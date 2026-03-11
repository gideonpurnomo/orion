import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ChallengeType } from '@prisma/client'

const createChallengeSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  type: z.enum(['XP_COLLECTED', 'ACTIVITIES_COMPLETED', 'STREAK_HIGHEST', 'DOMAIN_MASTERY']),
  domainId: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

const listChallengeSchema = z.object({
  scope: z.enum(['active', 'upcoming', 'completed', 'all']).optional().default('active'),
  type: z.enum(['XP_COLLECTED', 'ACTIVITIES_COMPLETED', 'STREAK_HIGHEST', 'DOMAIN_MASTERY']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
})

function getScopeWhere(scope: 'active' | 'upcoming' | 'completed' | 'all') {
  const now = new Date()

  if (scope === 'active') {
    return {
      startDate: { lte: now },
      endDate: { gte: now },
    }
  }

  if (scope === 'upcoming') {
    return {
      startDate: { gt: now },
    }
  }

  if (scope === 'completed') {
    return {
      endDate: { lt: now },
    }
  }

  return {}
}

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const { searchParams } = new URL(request.url)
    const parsedParams = listChallengeSchema.safeParse({
      scope: searchParams.get('scope') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!parsedParams.success) {
      return NextResponse.json({ error: 'Invalid query params' }, { status: 400 })
    }

    const { scope, type, limit } = parsedParams.data

    const challenges = await prisma.challenge.findMany({
      where: {
        ...getScopeWhere(scope),
        ...(type ? { type } : {}),
      },
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
        domain: {
          select: { id: true, name: true, icon: true },
        },
        participants: {
          where: { userId },
          select: {
            id: true,
            score: true,
            rank: true,
          },
        },
      },
    })

    return NextResponse.json({
      challenges: challenges.map((challenge) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        domainId: challenge.domainId,
        domain: challenge.domain ? { id: challenge.domain.id, name: challenge.domain.name, icon: challenge.domain.icon } : null,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        winnerId: challenge.winnerId,
        winnerXP: challenge.winnerXP,
        participantCount: challenge._count.participants,
        isJoined: challenge.participants.length > 0,
        myParticipation: challenge.participants[0] || null,
        createdAt: challenge.createdAt,
      })),
    })
  } catch (error) {
    console.error('Fetch challenges error:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()
    const parsedBody = createChallengeSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { title, description, type, domainId, startDate, endDate } = parsedBody.data

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 })
    }

    // For DOMAIN_MASTERY challenges, a domainId is required
    if (type === 'DOMAIN_MASTERY' && !domainId) {
      return NextResponse.json({ error: 'domainId is required for DOMAIN_MASTERY challenges' }, { status: 400 })
    }

    // Validate domainId exists if provided
    if (domainId) {
      const domain = await prisma.domain.findUnique({ where: { id: domainId } })
      if (!domain) {
        return NextResponse.json({ error: 'Invalid domainId' }, { status: 400 })
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const challenge = await tx.challenge.create({
        data: {
          title,
          description: description || null,
          type: type as ChallengeType,
          domainId: domainId || null,
          startDate: start,
          endDate: end,
        },
      })

      await tx.challengeParticipation.create({
        data: {
          challengeId: challenge.id,
          userId,
          score: 0,
        },
      })

      return challenge
    })

    return NextResponse.json({ challenge: created }, { status: 201 })
  } catch (error) {
    console.error('Create challenge error:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }
}
