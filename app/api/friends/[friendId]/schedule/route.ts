import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { friendId: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const friendId = params.friendId

    // Check if they are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id },
        ],
      },
      select: { id: true },
    })

    if (!friendship) {
      return NextResponse.json(
        { error: 'Not friends with this user' },
        { status: 403 }
      )
    }

    // Get friend's weekly schedule
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const friendSchedule = await prisma.scheduleItem.findMany({
      where: {
        schedule: {
          userId: friendId,
        },
        scheduledFor: {
          gte: today,
          lte: endOfWeek,
        },
      },
      include: {
        activity: {
          include: {
            domain: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    })

    return NextResponse.json({ schedule: friendSchedule })
  } catch (error) {
    console.error('Fetch friend schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}
