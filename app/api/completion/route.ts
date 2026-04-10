import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getXPReward, calculateLevel, formatXP } from '@/lib/xp'

const completeActivitySchema = z.object({
  scheduleItemId: z.string().min(1),
  notes: z.string().max(1000).optional(),
  actualDuration: z.number().int().min(1).max(24 * 60).optional(),
})

const updateStatusSchema = z.object({
  scheduleItemId: z.string().min(1),
  status: z.enum(['IN_PROGRESS', 'SKIPPED']),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsedBody = completeActivitySchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { scheduleItemId, notes, actualDuration } = parsedBody.data

    // Get the schedule item with activity details
    const scheduleItem = await prisma.scheduleItem.findFirst({
      where: {
        id: scheduleItemId,
        schedule: { userId: session.user.id },
      },
      include: {
        activity: true,
      },
    })

    if (!scheduleItem) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }

    // Only award XP if not already completed
    if (scheduleItem.status !== 'COMPLETED') {
      const xpReward = getXPReward(
        scheduleItem.activity?.difficulty || 5,
        actualDuration || scheduleItem.duration || scheduleItem.activity?.duration || 30
      )

      // Update user XP
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: xpReward },
        },
        select: { xp: true, level: true },
      })

      // Create progress record
      await prisma.progress.create({
        data: {
          userId: session.user.id,
          activityId: scheduleItem.activityId,
          completedAt: new Date(),
          notes: notes || null,
        },
      })

      // Calculate new level
      const newLevelInfo = calculateLevel(user.xp)

      // Check for new achievements
      const achievements = await checkAchievements(session.user.id, user.xp, user.level)

      // Update challenge participation scores
      const now = new Date()
      const activeChallenges = await prisma.challenge.findMany({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
          participants: {
            some: { userId: session.user.id },
          },
        },
        select: { id: true, type: true },
      })

      for (const challenge of activeChallenges) {
        let scoreIncrement = 0

        if (challenge.type === 'XP_COLLECTED') {
          scoreIncrement = xpReward
        } else if (challenge.type === 'ACTIVITIES_COMPLETED') {
          scoreIncrement = 1
        }

        if (scoreIncrement > 0) {
          await prisma.challengeParticipation.update({
            where: {
              challengeId_userId: {
                challengeId: challenge.id,
                userId: session.user.id,
              },
            },
            data: { score: { increment: scoreIncrement } },
          })
        }
      }

      // Update schedule item status
      const updatedItem = await prisma.scheduleItem.update({
        where: { id: scheduleItemId },
        data: {
          status: 'COMPLETED',
          notes: notes || scheduleItem.notes,
          actualDuration: actualDuration || scheduleItem.actualDuration,
        },
      })

      // Check for level up
      const leveledUp = user.level !== newLevelInfo.level

      return NextResponse.json({
        item: updatedItem,
        xpAwarded: xpReward,
        newXP: user.xp + xpReward,
        newLevel: newLevelInfo.level,
        leveledUp,
        achievements,
        formattedXP: formatXP(user.xp + xpReward),
      })
    }

    // Already completed - just update notes and duration
    const updatedItem = await prisma.scheduleItem.update({
      where: { id: scheduleItemId },
      data: {
        notes: notes || scheduleItem.notes,
        actualDuration: actualDuration || scheduleItem.actualDuration,
      },
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Complete activity error:', error)
    return NextResponse.json({ error: 'Failed to complete activity' }, { status: 500 })
  }
}

// PATCH endpoint for updating status (IN_PROGRESS, SKIPPED)
export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsedBody = updateStatusSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { scheduleItemId, status } = parsedBody.data

    const existingItem = await prisma.scheduleItem.findFirst({
      where: {
        id: scheduleItemId,
        schedule: { userId: session.user.id },
      },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }

    // Update status
    const updatedItem = await prisma.scheduleItem.update({
      where: { id: scheduleItemId },
      data: { status },
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

async function checkAchievements(userId: string, xp: number, level: number): Promise<any[]> {
  const newAchievements: any[] = []

  // First Activity achievement
  const progressCount = await prisma.progress.count({
    where: { userId },
  })

  if (progressCount === 1) {
    const existing = await prisma.achievement.findFirst({
      where: { userId, type: 'FIRST_ACTIVITY' },
    })

    if (!existing) {
      const achievement = await prisma.achievement.create({
        data: {
          userId,
          type: 'FIRST_ACTIVITY',
          title: 'First Steps',
          description: 'Complete your first activity',
          icon: '🎯',
          xpReward: 10,
          completedAt: new Date(),
        },
      })
      newAchievements.push(achievement)
    }
  }

  // Level-based achievements
  const levelAchievements = [
    { level: 5, type: 'LEVEL_5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
    { level: 10, type: 'LEVEL_10', title: 'Dedicated Learner', description: 'Reach level 10', icon: '🌟' },
    { level: 20, type: 'LEVEL_20', title: 'Expert Student', description: 'Reach level 20', icon: '🏆' },
    { level: 30, type: 'LEVEL_30', title: 'Master Mind', description: 'Reach level 30', icon: '👑' },
  ]

  for (const ach of levelAchievements) {
    if (level >= ach.level) {
      const existing = await prisma.achievement.findFirst({
        where: { userId, type: ach.type },
      })

      if (!existing) {
        const achievement = await prisma.achievement.create({
          data: {
            userId,
            type: ach.type,
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            xpReward: 0,
            completedAt: new Date(),
          },
        })
        newAchievements.push(achievement)
      }
    }
  }

  // XP-based achievements
  const xpAchievements = [
    { xp: 1000, type: 'XP_1000', title: 'XP Hunter', description: 'Earn 1,000 total XP', icon: '💎' },
    { xp: 5000, type: 'XP_5000', title: 'XP Champion', description: 'Earn 5,000 total XP', icon: '🏆' },
    { xp: 10000, type: 'XP_10000', title: 'XP Legend', description: 'Earn 10,000 total XP', icon: '🌟' },
  ]

  for (const ach of xpAchievements) {
    if (xp >= ach.xp) {
      const existing = await prisma.achievement.findFirst({
        where: { userId, type: ach.type },
      })

      if (!existing) {
        const achievement = await prisma.achievement.create({
          data: {
            userId,
            type: ach.type,
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            xpReward: 0,
            completedAt: new Date(),
          },
        })
        newAchievements.push(achievement)
      }
    }
  }

  return newAchievements
}

// GET endpoint to check completion status of activities
export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const activityIds = searchParams.get('ids')?.split(',').filter(Boolean) || []

    if (activityIds.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        id: { in: activityIds },
        schedule: { userId: session.user.id },
      },
      include: {
        activity: {
          include: { domain: true },
        },
      },
    })

    const progressRecords = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        activityId: { in: activityIds },
      },
      select: { activityId: true },
    })

    const completedSet = new Set(progressRecords.map(p => p.activityId))

    const itemsWithStatus = scheduleItems.map(item => ({
      ...item,
      isCompleted: completedSet.has(item.activityId),
    }))

    return NextResponse.json({ items: itemsWithStatus })
  } catch (error) {
    console.error('Fetch completion status error:', error)
    return NextResponse.json({ error: 'Failed to fetch completion status' }, { status: 500 })
  }
}
