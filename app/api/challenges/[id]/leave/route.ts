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
        endDate: true,
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    if (challenge.endDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot leave a completed challenge' },
        { status: 400 }
      )
    }

    await prisma.challengeParticipation.deleteMany({
      where: {
        challengeId: challenge.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leave challenge error:', error)
    return NextResponse.json({ error: 'Failed to leave challenge' }, { status: 500 })
  }
}
