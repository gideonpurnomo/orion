import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get users sorted by their stats
    let orderBy: any = { xp: 'desc' as const }

    // Filter by domain if specified
    let where: any = {}

    if (type === 'domain') {
      const domainSlug = searchParams.get('domain')
      if (domainSlug) {
        // This would require a more complex query to count by domain
        // For now, return all users and filter client-side
        where = {}
      }
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        createdAt: true,
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    })

    // Calculate ranks
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
      achievementCount: user._count.achievements,
    }))

    // Get current week's champion if requested
    let weeklyChampion = null
    if (type === 'weekly') {
      const today = new Date()

      const currentWeekChallenge = await prisma.challenge.findFirst({
        where: {
          startDate: { lte: today },
          endDate: { gte: today },
        },
        select: {
          winnerId: true,
        },
      })

      if (currentWeekChallenge?.winnerId) {
        weeklyChampion = await prisma.user.findUnique({
          where: { id: currentWeekChallenge.winnerId },
          select: {
            id: true,
            name: true,
            image: true,
          },
        })
      }
    }

    return NextResponse.json({
      type,
      leaderboard,
      weeklyChampion,
      total: users.length,
      limit,
      offset,
      hasMore: offset + limit < users.length,
    })
  } catch (error) {
    console.error('Fetch leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
