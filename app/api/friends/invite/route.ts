import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatInviteCode, isFriend } from '@/lib/friends'

const redeemInviteSchema = z.object({
  code: z.string().min(1),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const parsed = redeemInviteSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const senderId = session.user.id
    const normalizedCode = formatInviteCode(parsed.data.code)

    const inviteCode = await prisma.friendInviteCode.findUnique({
      where: { code: normalizedCode },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!inviteCode || !inviteCode.isActive) {
      return NextResponse.json({ error: 'Invite code is invalid' }, { status: 404 })
    }

    if (inviteCode.expiresAt && inviteCode.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Invite code has expired' }, { status: 410 })
    }

    if (inviteCode.maxUses !== null && inviteCode.uses >= inviteCode.maxUses) {
      return NextResponse.json({ error: 'Invite code can no longer be used' }, { status: 410 })
    }

    if (inviteCode.userId === senderId) {
      return NextResponse.json({ error: 'Cannot use your own invite code' }, { status: 400 })
    }

    if (await isFriend(senderId, inviteCode.userId)) {
      return NextResponse.json({ error: 'You are already friends' }, { status: 409 })
    }

    const existingPending = await prisma.friendRequest.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { senderId, receiverId: inviteCode.userId },
          { senderId: inviteCode.userId, receiverId: senderId },
        ],
      },
      select: { id: true },
    })

    if (existingPending) {
      return NextResponse.json({ error: 'A pending friend request already exists' }, { status: 409 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const requestRecord = await tx.friendRequest.create({
        data: {
          senderId,
          receiverId: inviteCode.userId,
        },
      })

      const nextUses = inviteCode.uses + 1
      const shouldDeactivate =
        inviteCode.maxUses !== null && nextUses >= inviteCode.maxUses

      await tx.friendInviteCode.update({
        where: { id: inviteCode.id },
        data: {
          uses: { increment: 1 },
          isActive: shouldDeactivate ? false : inviteCode.isActive,
        },
      })

      return requestRecord
    })

    return NextResponse.json({ request: result }, { status: 201 })
  } catch (error) {
    console.error('Redeem invite code error:', error)
    return NextResponse.json({ error: 'Failed to redeem invite code' }, { status: 500 })
  }
}
