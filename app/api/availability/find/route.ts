import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const findAvailabilitySchema = z.object({
  friendIds: z.array(z.string()).min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

interface TimeSlot {
  start: Date
  end: Date
}

interface BusySlot {
  start: Date
  end: Date
}

// Merge overlapping busy slots
function mergeBusySlots(slots: BusySlot[]): BusySlot[] {
  if (slots.length === 0) return []

  const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime())
  const merged: BusySlot[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]

    if (current.start <= last.end) {
      // Overlapping or adjacent - merge them
      last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()))
    } else {
      merged.push(current)
    }
  }

  return merged
}

// Find free slots within a time range, excluding busy slots
function findFreeSlots(
  rangeStart: Date,
  rangeEnd: Date,
  busySlots: BusySlot[],
  minDurationMinutes: number = 30
): TimeSlot[] {
  const minDurationMs = minDurationMinutes * 60 * 1000
  const freeSlots: TimeSlot[] = []
  const mergedBusy = mergeBusySlots(busySlots)

  let currentStart = rangeStart

  for (const busy of mergedBusy) {
    if (busy.start > currentStart) {
      // There's a gap before this busy slot
      const gapDuration = busy.start.getTime() - currentStart.getTime()
      if (gapDuration >= minDurationMs) {
        freeSlots.push({
          start: currentStart,
          end: busy.start,
        })
      }
    }
    currentStart = busy.end
  }

  // Check if there's time after the last busy slot
  if (currentStart < rangeEnd) {
    const gapDuration = rangeEnd.getTime() - currentStart.getTime()
    if (gapDuration >= minDurationMs) {
      freeSlots.push({
        start: currentStart,
        end: rangeEnd,
      })
    }
  }

  return freeSlots
}

// Get busy slots for a user within a date range
async function getBusySlotsForUser(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<BusySlot[]> {
  const scheduleItems = await prisma.scheduleItem.findMany({
    where: {
      schedule: {
        userId,
      },
      scheduledFor: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'],
      },
    },
    include: {
      activity: {
        select: {
          duration: true,
        },
      },
    },
    orderBy: {
      scheduledFor: 'asc',
    },
  })

  return scheduleItems.map((item) => ({
    start: new Date(item.scheduledFor),
    end: new Date(item.scheduledFor.getTime() + (item.duration || item.activity?.duration || 30) * 60 * 1000),
  }))
}

// Find overlapping free slots between multiple users
function findMutualFreeSlots(
  rangeStart: Date,
  rangeEnd: Date,
  allBusySlots: BusySlot[][],
  minDurationMinutes: number = 30
): TimeSlot[] {
  // Start with the full range as free
  let currentFree: TimeSlot[] = [{ start: rangeStart, end: rangeEnd }]

  // For each user's busy slots, filter out overlapping time
  for (const userBusySlots of allBusySlots) {
    const newFreeSlots: TimeSlot[] = []

    for (const freeSlot of currentFree) {
      const busyInSlot = userBusySlots.filter(
        (busy) => busy.start < freeSlot.end && busy.end > freeSlot.start
      )

      if (busyInSlot.length === 0) {
        // No overlap, keep this free slot
        newFreeSlots.push(freeSlot)
      } else {
        // Find gaps between busy slots within this free slot
        const sortedBusy = [...busyInSlot].sort((a, b) => a.start.getTime() - b.start.getTime())
        let currentStart = freeSlot.start

        for (const busy of sortedBusy) {
          if (busy.start > currentStart) {
            const gapDuration = busy.start.getTime() - currentStart.getTime()
            if (gapDuration >= minDurationMinutes * 60 * 1000) {
              newFreeSlots.push({
                start: currentStart,
                end: busy.start,
              })
            }
          }
          currentStart = busy.end
        }

        // Check remaining time after last busy slot
        if (currentStart < freeSlot.end) {
          const gapDuration = freeSlot.end.getTime() - currentStart.getTime()
          if (gapDuration >= minDurationMinutes * 60 * 1000) {
            newFreeSlots.push({
              start: currentStart,
              end: freeSlot.end,
            })
          }
        }
      }
    }

    currentFree = newFreeSlots
    if (currentFree.length === 0) break // No mutual free time left
  }

  return currentFree
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const parsed = findAvailabilitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error },
        { status: 400 }
      )
    }

    const { friendIds, startDate, endDate } = parsed.data
    const userId = session.user.id
    const dedupedFriendIds = Array.from(new Set(friendIds)).filter((id) => id !== userId)

    if (dedupedFriendIds.length === 0) {
      return NextResponse.json({ error: 'Please include at least one friend' }, { status: 400 })
    }

    // Validate date range
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
    }

    if (start >= end) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 })
    }

    // Limit date range to 30 days max
    const maxRangeDays = 30
    const rangeDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (rangeDays > maxRangeDays) {
      return NextResponse.json(
        { error: `Date range too large. Maximum ${maxRangeDays} days.` },
        { status: 400 }
      )
    }

    // Get busy slots for all users (current user + friends)
    const friendships = await prisma.friendship.findMany({
      where: {
        userId,
        friendId: { in: dedupedFriendIds },
      },
      select: { friendId: true },
    })

    const allowedFriendIds = new Set(friendships.map((row) => row.friendId))
    if (allowedFriendIds.size !== dedupedFriendIds.length) {
      return NextResponse.json(
        { error: 'One or more selected users are not your friends' },
        { status: 403 }
      )
    }

    const [myBusySlots, friendBusySlots] = await Promise.all([
      getBusySlotsForUser(userId, start, end),
      Promise.all(
        dedupedFriendIds.map((friendId) => getBusySlotsForUser(friendId, start, end))
      ),
    ])

    // Find mutual free time slots
    const allBusySlots = [myBusySlots, ...friendBusySlots]
    const mutualFreeSlots = findMutualFreeSlots(start, end, allBusySlots, 30)

    // Format response
    return NextResponse.json({
      mutualFreeSlots: mutualFreeSlots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        durationMinutes: Math.floor((slot.end.getTime() - slot.start.getTime()) / (60 * 1000)),
      })),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      participants: [userId, ...dedupedFriendIds],
      totalParticipants: 1 + dedupedFriendIds.length,
    })
  } catch (error) {
    console.error('Find availability error:', error)
    return NextResponse.json(
      { error: 'Failed to find availability' },
      { status: 500 }
    )
  }
}
