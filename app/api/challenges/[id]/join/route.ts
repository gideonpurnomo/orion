import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        startDate: true,
        endDate: true,
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    if (challenge.endDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot join a completed challenge' },
        { status: 400 }
      )
    }

    const participation = await prisma.challengeParticipation.upsert({
      where: {
        challengeId_userId: {
          challengeId: challenge.id,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        challengeId: challenge.id,
        userId: session.user.id,
        score: 0,
      },
    })

    return NextResponse.json({ participation }, { status: 201 })
  } catch (error) {
    console.error('Join challenge error:', error)
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 })
  }
}
