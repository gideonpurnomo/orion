import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevel, getLevelProgress } from '@/lib/xp'

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

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const levelInfo = calculateLevel(user.xp)
    const progressToNext = getLevelProgress(user.xp, user.level)

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    })

    // Calculate date ranges
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get completed items by time periods
    const [todayCompleted, weekCompleted, monthCompleted, allCompleted] = await Promise.all([
      prisma.scheduleItem.count({
        where: {
          schedule: { userId },
          status: 'COMPLETED',
          scheduledFor: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.scheduleItem.count({
        where: {
          schedule: { userId },
          status: 'COMPLETED',
          scheduledFor: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.scheduleItem.count({
        where: {
          schedule: { userId },
          status: 'COMPLETED',
          scheduledFor: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.scheduleItem.count({
        where: {
          schedule: { userId },
          status: 'COMPLETED',
        },
      }),
    ])

    // Get domain breakdown by querying completed activities with domains
    const completedItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: { userId },
        status: 'COMPLETED',
      },
      include: {
        activity: {
          include: { domain: true },
        },
      },
      orderBy: { scheduledFor: 'desc' },
    })

    // Group by domain
    const domainMap = new Map<string, { domain: string; domainIcon: string; count: number }>()

    for (const item of completedItems) {
      const domainName = item.activity?.domain?.name || 'Unknown'
      const domainIcon = item.activity?.domain?.icon || '📚'
      const existing = domainMap.get(domainName)

      if (existing) {
        existing.count++
      } else {
        domainMap.set(domainName, { domain: domainName, domainIcon, count: 1 })
      }
    }

    const domainBreakdown = Array.from(domainMap.values())
    domainBreakdown.sort((a, b) => b.count - a.count)

    // Get daily stats for the last 30 days
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayCompleted = await prisma.scheduleItem.count({
        where: {
          schedule: { userId },
          status: 'COMPLETED',
          scheduledFor: { gte: date, lte: dayEnd },
        },
      })

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        completed: dayCompleted,
      })
    }

    // Calculate streak
    const streak = await calculateStreak(userId)

    // Get recent activities
    const recentActivities = await prisma.scheduleItem.findMany({
      where: {
        schedule: { userId },
        status: 'COMPLETED',
      },
      include: {
        activity: {
          include: { domain: true, category: true },
        },
      },
      orderBy: { scheduledFor: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      user: {
        xp: user.xp,
        level: user.level,
        levelInfo,
        progressToNext,
      },
      counts: {
        today: todayCompleted,
        week: weekCompleted,
        month: monthCompleted,
        total: allCompleted,
      },
      streak,
      domainBreakdown: domainBreakdown,
      dailyStats,
      recentActivities,
      achievements,
    })
  } catch (error) {
    console.error('Fetch progress error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

async function calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
  const progressRecords = await prisma.progress.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true },
  })

  if (progressRecords.length === 0) {
    return { current: 0, longest: 0 }
  }

  const uniqueDays = new Set(
    progressRecords.map(p => new Date(p.completedAt).toDateString())
  )
  const sortedDays = Array.from(uniqueDays).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  const today = new Date().toDateString()

  for (const dayStr of sortedDays) {
    const day = new Date(dayStr)

    if (dayStr === today) {
      currentStreak = tempStreak + 1
      tempStreak++
    } else {
      const prevDay = new Date(day)
      prevDay.setDate(prevDay.getDate() - 1)
      const prevDayStr = prevDay.toDateString()

      if (sortedDays.includes(prevDayStr)) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
  }
}
