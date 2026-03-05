import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: { friendId: string } }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const friendId = params.friendId

    await prisma.$transaction([
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      }),
      prisma.friendRequest.updateMany({
        where: {
          status: 'PENDING',
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
        },
        data: {
          status: 'CANCELED',
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove friend error:', error)
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
  }
}
