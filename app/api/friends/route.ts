import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isFriend } from '@/lib/friends'

const createRequestSchema = z.object({
  receiverId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  message: z.string().max(300).optional(),
})

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id

    const [friends, incomingRequests, outgoingRequests] = await Promise.all([
      prisma.friendship.findMany({
        where: { userId },
        include: {
          friend: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          status: 'PENDING',
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      friends: friends.map((friendship) => ({
        id: friendship.id,
        createdAt: friendship.createdAt,
        user: friendship.friend,
      })),
      incomingRequests,
      outgoingRequests,
    })
  } catch (error) {
    console.error('Fetch friends error:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!parsed.data.receiverId && !parsed.data.email) {
      return NextResponse.json(
        { error: 'receiverId or email is required' },
        { status: 400 }
      )
    }

    const senderId = session.user.id

    const receiver = parsed.data.receiverId
      ? await prisma.user.findUnique({
          where: { id: parsed.data.receiverId },
          select: { id: true, name: true, email: true },
        })
      : await prisma.user.findUnique({
          where: { email: parsed.data.email?.toLowerCase() },
          select: { id: true, name: true, email: true },
        })

    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (receiver.id === senderId) {
      return NextResponse.json({ error: 'Cannot send a friend request to yourself' }, { status: 400 })
    }

    if (await isFriend(senderId, receiver.id)) {
      return NextResponse.json({ error: 'You are already friends' }, { status: 409 })
    }

    const existingPending = await prisma.friendRequest.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { senderId, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: senderId },
        ],
      },
      select: { id: true },
    })

    if (existingPending) {
      return NextResponse.json(
        { error: 'A pending friend request already exists between these users' },
        { status: 409 }
      )
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId: receiver.id,
        message: parsed.data.message,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } },
        receiver: { select: { id: true, name: true, email: true, image: true } },
      },
    })

    return NextResponse.json({ request: friendRequest }, { status: 201 })
  } catch (error) {
    console.error('Create friend request error:', error)
    return NextResponse.json({ error: 'Failed to create friend request' }, { status: 500 })
  }
}
