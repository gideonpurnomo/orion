import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getXPReward } from '@/lib/xp'

function getCurrentWeekRange(date = new Date()) {
  const startOfWeek = new Date(date)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return { startOfWeek, endOfWeek }
}

const createScheduleItemSchema = z.object({
  activityId: z.string().min(1),
  scheduledFor: z.string().datetime(),
  duration: z.number().int().min(1).max(24 * 60).optional(),
  notes: z.string().max(2000).optional().nullable(),
})

const updateScheduleItemSchema = z.object({
  itemId: z.string().min(1),
  scheduledFor: z.string().datetime(),
})

const updateStatusSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
})

const scheduleRangeSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
})

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const rangeParams = scheduleRangeSchema.safeParse({
      start: searchParams.get('start') ?? undefined,
      end: searchParams.get('end') ?? undefined,
    })

    const fallbackRange = getCurrentWeekRange()
    const startOfWeek = rangeParams.success && rangeParams.data.start
      ? new Date(rangeParams.data.start)
      : fallbackRange.startOfWeek
    const endOfWeek = rangeParams.success && rangeParams.data.end
      ? new Date(rangeParams.data.end)
      : fallbackRange.endOfWeek

    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: {
          userId: userId
        },
        scheduledFor: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        activity: {
          include: {
            domain: true,
            category: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    })

    return NextResponse.json({ items: scheduleItems })
  } catch (error) {
    console.error('Fetch schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

// PUT endpoint for updating status and awarding XP
export async function PUT(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsedBody = updateStatusSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { itemId, status } = parsedBody.data

    const scheduleItem = await prisma.scheduleItem.findFirst({
      where: {
        id: itemId,
        schedule: {
          userId: session.user.id,
        },
      },
      include: {
        activity: true,
      },
    })

    if (!scheduleItem) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }

    // Only award XP when completing an activity
    if (status === 'COMPLETED' && scheduleItem.status !== 'COMPLETED') {
      const xpReward = getXPReward(
        scheduleItem.activity?.difficulty || 5,
        scheduleItem.duration || scheduleItem.activity?.duration || 30
      )

      // Update user XP and level
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: xpReward },
        },
      })

      // Create progress record
      await prisma.progress.create({
        data: {
          userId: session.user.id,
          activityId: scheduleItem.activityId,
          completedAt: new Date(),
        },
      })
    }

    const updatedItem = await prisma.scheduleItem.update({
      where: { id: itemId },
      data: { status },
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsedBody = createScheduleItemSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { activityId, scheduledFor, duration, notes } = parsedBody.data

    // Get activity details
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        domain: true,
        category: true
      }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Get or create user's weekly schedule
    const { startOfWeek, endOfWeek } = getCurrentWeekRange(new Date(scheduledFor))

    let schedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        type: 'WEEKLY',
        startDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        }
      }
    })

    if (!schedule) {
      schedule = await prisma.schedule.create({
        data: {
          name: 'My Schedule',
          type: 'WEEKLY',
          userId: session.user.id,
          startDate: startOfWeek,
          endDate: endOfWeek
        }
      })
    }

    // Create schedule item
    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        scheduleId: schedule.id,
        activityId: activityId,
        scheduledFor: new Date(scheduledFor),
        duration: duration || activity.duration,
        status: 'PLANNED',
        notes: notes || null
      }
    })

    return NextResponse.json({ item: scheduleItem }, { status: 201 })
  } catch (error) {
    console.error('Create schedule item error:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule item' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsedBody = updateScheduleItemSchema.safeParse(body)

    if (!parsedBody.score) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { itemId, scheduledFor } = parsedBody.data

    const existingItem = await prisma.scheduleItem.findFirst({
      where: {
        id: itemId,
        schedule: {
          userId: session.user.id,
        },
      },
      select: { id: true },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.scheduleItem.update({
      where: { id: itemId },
      data: { scheduledFor: new Date(scheduledFor) },
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Update schedule item error:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule item' },
      { status: 500 }
    )
  }
}
