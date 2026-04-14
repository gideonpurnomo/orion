import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { compare, hash } from 'bcryptjs'

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  image: z.string().url().optional().or(z.literal('')),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, xp: true, level: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Handle password change
    if (body.currentPassword && body.newPassword) {
      const parsed = changePasswordSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid password data' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        return NextResponse.json({ error: 'Password change not available for this account' }, { status: 400 })
      }

      const valid = await compare(parsed.data.currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      const hashed = await hash(parsed.data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      })

      return NextResponse.json({ success: true })
    }

    // Handle profile update
    const parsedBody = updateProfileSchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 })
    }

    const { name, image } = parsedBody.data
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        image: image || null,
      },
      select: { id: true, name: true, email: true, image: true, xp: true, level: true, createdAt: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
