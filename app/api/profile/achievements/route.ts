import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    // Get user's completed achievements
    const earnedAchievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: 'desc' },
    })

    const earnedAchievementTypes = earnedAchievements.map(a => a.type)

    // Get user stats for checking new achievements
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        progress: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Count completed activities
    const totalCompleted = await prisma.scheduleItem.count({
      where: {
        schedule: { userId: session.user.id },
        status: 'COMPLETED',
      },
    })

    const totalScheduled = await prisma.scheduleItem.count({
      where: {
        schedule: { userId: session.user.id },
      },
    })

    // Get streak from schedule items
    const allItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: { userId: session.user.id },
        status: 'COMPLETED',
      },
      orderBy: { scheduledFor: 'asc' },
    })

    // Calculate streak
    let streak = 0
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const item of allItems) {
      const itemDate = new Date(item.scheduledFor)
      itemDate.setHours(0, 0, 0, 0)

      const dayDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dayDiff === 0) {
        currentStreak++
      } else if (dayDiff === 1) {
        currentStreak++
      } else if (dayDiff > 1) {
        streak = Math.max(streak, currentStreak)
        currentStreak = 1
      }
    }
    streak = Math.max(streak, currentStreak)

    // Get completed count by domain
    const completedItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: { userId: session.user.id },
        status: 'COMPLETED',
      },
      include: {
        activity: {
          include: {
            domain: true,
          },
        },
      },
    })

    const completedByDomain: Record<string, number> = {}
    for (const item of completedItems) {
      const domainSlug = item.activity?.domain?.slug || 'unknown'
      completedByDomain[domainSlug] = (completedByDomain[domainSlug] || 0) + 1
    }

    const userStats = {
      totalCompleted,
      totalScheduled,
      streak,
      xp: user.xp,
      level: user.level,
      completedByDomain,
    }

    // Check for new achievements
    const availableAchievements = checkAchievements(userStats, earnedAchievementTypes)

    // Award new achievements
    const newAchievements = []
    for (const achievement of availableAchievements) {
      try {
        const newAchievement = await prisma.achievement.create({
          data: {
            userId: session.user.id,
            type: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward,
          },
        })

        // Award bonus XP
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xp: { increment: achievement.xpReward },
          },
        })

        newAchievements.push(newAchievement)
      } catch (err) {
        // Achievement might already exist, skip
        continue
      }
    }

    return NextResponse.json({
      earned: earnedAchievements,
      available: availableAchievements,
      newAchievements,
      total: ACHIEVEMENTS.length,
      earnedCount: earnedAchievements.length,
    })
  } catch (error) {
    console.error('Fetch achievements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
