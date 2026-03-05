import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevel, getLevelProgress, formatXP } from '@/lib/xp'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        xp: true,
        level: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const levelInfo = calculateLevel(user.xp)
    const progressToNext = getLevelProgress(user.xp, user.level)

    // Get today's completed count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayCompleted = await prisma.scheduleItem.count({
      where: {
        schedule: {
          userId: session.user.id,
        },
        status: 'COMPLETED',
        scheduledFor: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    return NextResponse.json({
      xp: user.xp,
      formattedXP: formatXP(user.xp),
      level: user.level,
      levelInfo,
      progressToNext,
      todayCompleted,
    })
  } catch (error) {
    console.error('Fetch user stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
