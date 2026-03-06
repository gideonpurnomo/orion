import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function medalForRank(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                xp: true,
                level: true,
              },
            },
          },
          orderBy: [{ score: 'desc' }],
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    const ranked = challenge.participants
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return a.userId.localeCompare(b.userId)
      })
      .map((participant, idx) => ({
      id: participant.id,
      userId: participant.userId,
      score: participant.score,
      rank: idx + 1,
      medal: medalForRank(idx + 1),
      user: participant.user,
      }))

    const myRank = ranked.find((row) => row.userId === userId) || null
    const now = new Date()

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        winnerId: challenge.winnerId,
        winnerXP: challenge.winnerXP,
        createdAt: challenge.createdAt,
      },
      leaderboard: ranked,
      participantCount: ranked.length,
      isJoined: Boolean(myRank),
      myRank,
      canJoin: !myRank && challenge.endDate > now,
      canLeave: Boolean(myRank) && challenge.endDate > now,
      status: challenge.startDate > now ? 'UPCOMING' : challenge.endDate < now ? 'COMPLETED' : 'ACTIVE',
    })
  } catch (error) {
    console.error('Fetch challenge details error:', error)
    return NextResponse.json({ error: 'Failed to fetch challenge details' }, { status: 500 })
  }
}
