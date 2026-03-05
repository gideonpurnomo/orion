import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  image: z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
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
      select: { id: true, name: true, email: true, image: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
