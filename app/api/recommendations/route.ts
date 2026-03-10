import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const type = searchParams.get('type') || 'mixed' // 'mixed', 'challenging', 'similar', 'variety'

    const userId = session.user.id

    // Get user's completed activities
    const completedActivities = await prisma.progress.findMany({
      where: { userId },
      include: {
        activity: {
          include: {
            domain: true,
            category: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 50, // Last 50 completions
    })

    // Get user's current schedule
    const now = new Date()
    const scheduledItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: { userId },
        scheduledFor: { gte: now },
      },
      include: {
        activity: {
          include: {
            domain: true,
            category: true,
          },
        },
      },
      take: 100,
    })

    // Get user's XP and level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all available activities
    const allActivities = await prisma.activity.findMany({
      include: {
        domain: true,
        category: true,
      },
      orderBy: [{ difficulty: 'asc' }, { order: 'asc' }],
    })

    // Exclude already completed and scheduled activities
    const completedIds = new Set(completedActivities.map(p => p.activityId))
    const scheduledIds = new Set(scheduledItems.map(s => s.activityId))

    let recommendations: any[] = []

    // Get user's preferred domains (most completed)
    const domainFrequency = new Map<string, number>()
    completedActivities.forEach(p => {
      const domainId = p.activity.domainId
      domainFrequency.set(domainId, (domainFrequency.get(domainId) || 0) + 1)
    })

    // Get user's preferred categories
    const categoryFrequency = new Map<string, number>()
    completedActivities.forEach(p => {
      const categoryId = p.activity.categoryId
      if (categoryId) {
        categoryFrequency.set(categoryId, (categoryFrequency.get(categoryId) || 0) + 1)
      }
    })

    // Calculate average completed difficulty
    const completedDifficulties = completedActivities
      .map(p => p.activity.difficulty)
      .filter(d => d !== undefined)
    const avgDifficulty = completedDifficulties.length > 0
      ? completedDifficulties.reduce((sum, d) => sum + d, 0) / completedDifficulties.length
      : 5

    // Generate recommendations based on type
    if (type === 'challenging') {
      // Recommend activities slightly above user's average difficulty
      recommendations = allActivities
        .filter(a =>
          !completedIds.has(a.id) &&
          !scheduledIds.has(a.id) &&
          a.difficulty > avgDifficulty
        )
        .sort((a, b) => b.difficulty - a.difficulty)
        .slice(0, limit)
        .map(a => ({ ...a, reason: `Level up! Try something more challenging.` }))
    } else if (type === 'similar') {
      // Recommend activities in user's favorite domains
      const topDomains = Array.from(domainFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([domainId]) => domainId)

      recommendations = allActivities
        .filter(a =>
          !completedIds.has(a.id) &&
          !scheduledIds.has(a.id) &&
          topDomains.includes(a.domainId || '')
        )
        .slice(0, limit)
        .map(a => ({ ...a, reason: `Continue your learning journey in ${a.domain?.name}.` }))
    } else if (type === 'variety') {
      // Recommend activities from less explored domains
      const leastExplored = Array.from(domainFrequency.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([domainId]) => domainId)

      recommendations = allActivities
        .filter(a =>
          !completedIds.has(a.id) &&
          !scheduledIds.has(a.id) &&
          (leastExplored.includes(a.domainId || '') || !domainFrequency.has(a.domainId || ''))
        )
        .slice(0, limit)
        .map(a => ({
          ...a,
          reason: `Explore something new! ${a.domain?.name} could be interesting.`,
        }))
    } else {
      // Mixed: balanced recommendations
      const challenging = allActivities
        .filter(a =>
          !completedIds.has(a.id) &&
          !scheduledIds.has(a.id) &&
          a.difficulty > avgDifficulty
        )
        .slice(0, Math.ceil(limit / 3))
        .map(a => ({ ...a, reason: `Level up!` }))

      const similar = allActivities
        .filter(a =>
          !completedIds.has(a.id) &&
          !scheduledIds.has(a.id) &&
          a.difficulty >= avgDifficulty - 1 &&
          a.difficulty <= avgDifficulty + 1 &&
          domainFrequency.has(a.domainId || '')
        )
        .slice(0, Math.ceil(limit / 3))
        .map(a => ({ ...a, reason: `Continue learning ${a.domain?.name}.` }))

      const variety = allActivities
        .filter(a =>
          !completedIds.has(a.id) &&
          !scheduledIds.has(a.id) &&
          !domainFrequency.has(a.domainId || '')
        )
        .slice(0, Math.ceil(limit / 3))
        .map(a => ({ ...a, reason: `Explore ${a.domain?.name}!` }))

      recommendations = [...challenging, ...similar, ...variety]
        .slice(0, limit)
    }

    // Add metadata to recommendations
    recommendations = recommendations.map(r => ({
      ...r,
      recommendedAt: new Date(),
      score: calculateRecommendationScore(r, avgDifficulty, domainFrequency, categoryFrequency),
    })).sort((a, b) => b.score - a.score)

    return NextResponse.json({
      recommendations,
      summary: {
        totalActivities: allActivities.length,
        completedActivities: completedActivities.length,
        scheduledActivities: scheduledItems.length,
        userLevel: user.level,
        userXP: user.xp,
        avgDifficulty: Math.round(avgDifficulty * 10) / 10,
        topDomains: Array.from(domainFrequency.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([domainId, count]) => ({ domainId, count })),
      },
    })
  } catch (error) {
    console.error('Fetch recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

function calculateRecommendationScore(
  activity: any,
  avgDifficulty: number,
  domainFrequency: Map<string, number>,
  categoryFrequency: Map<string, number>
): number {
  let score = 50 // Base score

  // Difficulty alignment: activities near user's average get higher score
  const diffDiff = Math.abs(activity.difficulty - avgDifficulty)
  score -= diffDiff * 5

  // Domain preference: activities in user's favorite domains get higher score
  const domainCount = domainFrequency.get(activity.domainId) || 0
  score += domainCount * 2

  // Category preference
  if (activity.categoryId) {
    const categoryCount = categoryFrequency.get(activity.categoryId) || 0
    score += categoryCount * 3
  }

  // Boost for less explored domains (variety)
  const totalCompletions = Array.from(domainFrequency.values()).reduce((sum, count) => sum + count, 0)
  const domainAvg = totalCompletions / domainFrequency.size
  if (domainCount < domainAvg) {
    score += 10 // Slight boost for variety
  }

  return Math.min(100, Math.max(0, score))
}
