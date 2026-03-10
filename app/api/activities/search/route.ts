import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const domain = searchParams.get('domain') || ''
    const limit = parseInt(searchParams.get('limit') || '24')

    const where: any = {}

    // Add domain filter if specified
    if (domain && domain !== 'all') {
      where.domain = { slug: domain }
    }

    // If query is present, switch to search mode.
    if (query.length >= 2) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } }
      ]
    }

    // Search for activities
    const activities = await prisma.activity.findMany({
      where,
      include: {
        domain: true,
        category: true
      },
      take: limit,
      orderBy: [
        { order: 'asc' },
        { difficulty: 'asc' },
        { title: 'asc' }
      ]
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
