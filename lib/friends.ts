import { prisma } from '@/lib/prisma'

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const INVITE_CODE_LENGTH = 8

export function generateInviteCode() {
  let code = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    const idx = Math.floor(Math.random() * INVITE_CODE_CHARS.length)
    code += INVITE_CODE_CHARS[idx]
  }
  return code
}

export function formatInviteCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function createUniqueInviteCode(userId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateInviteCode()
    try {
      return await prisma.friendInviteCode.create({
        data: {
          userId,
          code,
          isActive: true,
        },
      })
    } catch (error) {
      // Retry on rare code collision
      if (attempt === 4) throw error
    }
  }

  throw new Error('Failed to create invite code')
}

export async function isFriend(userId: string, otherUserId: string) {
  const friendship = await prisma.friendship.findUnique({
    where: {
      userId_friendId: {
        userId,
        friendId: otherUserId,
      },
    },
    select: { id: true },
  })

  return Boolean(friendship)
}
