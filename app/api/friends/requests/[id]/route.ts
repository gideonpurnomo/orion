import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateRequestSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel']),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const parsed = updateRequestSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const userId = session.user.id
    const requestId = params.id

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        status: true,
      },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    if (friendRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Friend request is no longer pending' }, { status: 409 })
    }

    if (parsed.data.action === 'cancel') {
      if (friendRequest.senderId !== userId) {
        return NextResponse.json({ error: 'Only sender can cancel this request' }, { status: 403 })
      }

      const canceled = await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELED' },
      })

      return NextResponse.json({ request: canceled })
    }

    if (friendRequest.receiverId !== userId) {
      return NextResponse.json({ error: 'Only receiver can perform this action' }, { status: 403 })
    }

    if (parsed.data.action === 'reject') {
      const rejected = await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      })

      return NextResponse.json({ request: rejected })
    }

    const result = await prisma.$transaction(async (tx) => {
      const accepted = await tx.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      })

      await tx.friendship.upsert({
        where: {
          userId_friendId: {
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId,
          },
        },
        update: {},
        create: {
          userId: friendRequest.senderId,
          friendId: friendRequest.receiverId,
        },
      })

      await tx.friendship.upsert({
        where: {
          userId_friendId: {
            userId: friendRequest.receiverId,
            friendId: friendRequest.senderId,
          },
        },
        update: {},
        create: {
          userId: friendRequest.receiverId,
          friendId: friendRequest.senderId,
        },
      })

      return accepted
    })

    return NextResponse.json({ request: result })
  } catch (error) {
    console.error('Update friend request error:', error)
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 })
  }
}
