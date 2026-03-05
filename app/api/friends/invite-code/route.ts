import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createUniqueInviteCode } from '@/lib/friends'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id

    let inviteCode = await prisma.friendInviteCode.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        code: true,
        uses: true,
        maxUses: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!inviteCode) {
      const created = await createUniqueInviteCode(userId)
      inviteCode = {
        code: created.code,
        uses: created.uses,
        maxUses: created.maxUses,
      }
    }

    return NextResponse.json({ inviteCode })
  } catch (error) {
    console.error('Fetch invite code error:', error)
    return NextResponse.json({ error: 'Failed to fetch invite code' }, { status: 500 })
  }
}

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id

    await prisma.friendInviteCode.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    })

    const created = await createUniqueInviteCode(userId)
    const inviteCode = {
      code: created.code,
      uses: created.uses,
      maxUses: created.maxUses,
    }

    return NextResponse.json({ inviteCode }, { status: 201 })
  } catch (error) {
    console.error('Regenerate invite code error:', error)
    return NextResponse.json({ error: 'Failed to regenerate invite code' }, { status: 500 })
  }
}
