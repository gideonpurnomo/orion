import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ items: [] })
  }

  try {
    const userId = session.user.id

    // Get start of week for filtering
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: {
          userId: userId
        },
        scheduledFor: {
          gte: startOfWeek
        }
      },
      include: {
        activity: {
          include: {
            domain: true,
            category: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    })

    return NextResponse.json({ items: scheduleItems })
  } catch (error) {
    console.error('Fetch schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { activityId, scheduledFor, duration, notes } = body

    // Get the activity details
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        domain: true,
        category: true
      }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Get or create user's weekly schedule
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    let schedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        type: 'WEEKLY',
        startDate: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    })

    if (!schedule) {
      schedule = await prisma.schedule.create({
        data: {
          name: 'My Schedule',
          type: 'WEEKLY',
          userId: session.user.id,
          startDate: startOfWeek,
          endDate: endOfWeek
        }
      })
    }

    // Create schedule item
    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        scheduleId: schedule.id,
        activityId: activityId,
        scheduledFor: new Date(scheduledFor),
        duration: duration || activity.duration,
        status: 'PLANNED',
        notes: notes || null
      }
    })

    return NextResponse.json({ item: scheduleItem }, { status: 201 })
  } catch (error) {
    console.error('Create schedule item error:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule item' },
      { status: 500 }
    )
  }
}
