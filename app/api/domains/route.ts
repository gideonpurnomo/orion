import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const includeParam = request.nextUrl.searchParams.get('include') || ''
    const includeParts = new Set(includeParam.split(',').map(s => s.trim()).filter(Boolean))
    const includeCategories = includeParts.has('categories')
    const includeActivities = includeParts.has('activities')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const include: any = {
      _count: {
        select: {
          activities: true,
          categories: true,
        },
      },
    }

    if (includeCategories) {
      include.categories = {
        orderBy: { order: 'asc' },
        ...(includeActivities
          ? {
              include: {
                activities: {
                  orderBy: { order: 'asc' },
                  take: 15,
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    difficulty: true,
                    duration: true,
                    tags: true,
                  },
                },
              },
            }
          : {}),
      }
    }

    const domains = await prisma.domain.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include,
    })

    return NextResponse.json({ domains })
  } catch (error) {
    console.error('Fetch domains error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}
