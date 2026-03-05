import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createActivitySchema = z.object({
  title: z.string().trim().min(2).max(120),
  domainSlug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(500).optional(),
})

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createActivitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid activity data' }, { status: 400 })
    }

    const { title, domainSlug, description } = parsed.data

    const domain = await prisma.domain.findUnique({
      where: { slug: domainSlug },
      select: { id: true, name: true },
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    const customCategory = await prisma.category.upsert({
      where: {
        domainId_slug: {
          domainId: domain.id,
          slug: 'custom-topics',
        },
      },
      update: {},
      create: {
        domainId: domain.id,
        name: 'Custom Topics',
        slug: 'custom-topics',
        description: 'User-created learning topics',
        order: 999,
      },
      select: { id: true },
    })

    const baseSlug = slugify(title)
    let slug = baseSlug
    let suffix = 1

    // Ensure unique slug in (domain, category) scope.
    while (true) {
      const existing = await prisma.activity.findFirst({
        where: {
          domainId: domain.id,
          categoryId: customCategory.id,
          slug,
        },
        select: { id: true },
      })
      if (!existing) break
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        slug,
        description: description || `Custom ${domain.name} learning topic`,
        difficulty: 2,
        duration: 45,
        tags: ['custom', 'user-created'],
        prerequisites: [],
        domainId: domain.id,
        categoryId: customCategory.id,
      },
      include: {
        domain: true,
        category: true,
      },
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
