import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: {
            activities: true,
            categories: true,
          },
        },
      },
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
