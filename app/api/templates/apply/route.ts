import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ItemStatus } from '@prisma/client'
import { z } from 'zod'

const applyTemplateSchema = z.object({
  templateId: z.string().min(1),
  startDate: z.string().datetime(),
  weekOffset: z.number().int().default(0), // Which week of the template (0 = first week)
})

function getWeekStartDate(date: Date): Date {
  const startOfWeek = new Date(date)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  return startOfWeek
}

function getWeekEndDate(startDate: Date): Date {
  const endOfWeek = new Date(startDate)
  endOfWeek.setDate(startDate.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

// Template configurations with recommended time slots and activity counts
const templateConfigs: Record<string, {
  dailySlots: Array<{ hour: number; maxActivities: number }>
  dailyActivityCount: { min: number; max: number }
  preferredDomains?: string[]
}> = {
  BEGINNER: {
    dailySlots: [
      { hour: 9, maxActivities: 1 },
      { hour: 10, maxActivities: 1 },
    ],
    dailyActivityCount: { min: 1, max: 2 },
  },
  BALANCED: {
    dailySlots: [
      { hour: 9, maxActivities: 1 },
      { hour: 10, maxActivities: 1 },
      { hour: 14, maxActivities: 1 },
    ],
    dailyActivityCount: { min: 2, max: 3 },
  },
  INTENSIVE: {
    dailySlots: [
      { hour: 9, maxActivities: 1 },
      { hour: 10, maxActivities: 1 },
      { hour: 11, maxActivities: 1 },
      { hour: 14, maxActivities: 1 },
      { hour: 15, maxActivities: 1 },
    ],
    dailyActivityCount: { min: 3, max: 5 },
  },
  EXPERT: {
    dailySlots: [
      { hour: 8, maxActivities: 1 },
      { hour: 9, maxActivities: 1 },
      { hour: 10, maxActivities: 1 },
      { hour: 11, maxActivities: 1 },
      { hour: 14, maxActivities: 1 },
      { hour: 15, maxActivities: 1 },
      { hour: 16, maxActivities: 1 },
    ],
    dailyActivityCount: { min: 5, max: 7 },
  },
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsedBody = applyTemplateSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { templateId, startDate, weekOffset } = parsedBody.data

    // Get the template
    const template = await prisma.scheduleTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Calculate week dates
    const startOfWeek = getWeekStartDate(new Date(startDate))
    const endOfWeek = getWeekEndDate(startOfWeek)

    // Clear existing weekly schedule items for this week
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        type: 'WEEKLY',
        startDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        }
      },
      include: { items: true },
    })

    if (existingSchedule) {
      // Delete existing schedule items
      await prisma.scheduleItem.deleteMany({
        where: { scheduleId: existingSchedule.id },
      })

      // Update schedule dates
      await prisma.schedule.update({
        where: { id: existingSchedule.id },
        data: {
          startDate: startOfWeek,
          endDate: endOfWeek,
        },
      })
    } else {
      // Create new schedule
      await prisma.schedule.create({
        data: {
          name: `${template.name} - Week ${weekOffset + 1}`,
          type: 'WEEKLY',
          userId: session.user.id,
          startDate: startOfWeek,
          endDate: endOfWeek,
        },
      })
    }

    // Get template configuration
    const config = template.config as any
    const configType = template.type
    const templateConfig = templateConfigs[configType] || templateConfigs.BALANCED

    // Get available activities
    const activities = await prisma.activity.findMany({
      include: {
        domain: true,
        category: true,
      },
      orderBy: [
        { order: 'asc' },
        { id: 'asc' },
      ],
    })

    if (activities.length === 0) {
      return NextResponse.json(
        { error: 'No activities available to populate schedule' },
        { status: 400 }
      )
    }

    // Get or recreate the schedule
    const schedule = await prisma.schedule.findFirst({
      where: {
        userId: session.user.id,
        type: 'WEEKLY',
        startDate: startOfWeek,
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Failed to create schedule' },
        { status: 500 }
      )
    }

    // Build weekly schedule items
    const scheduleItems: Array<{
      scheduleId: string
      activityId: string
      scheduledFor: Date
      duration?: number
      status: ItemStatus
    }> = []

    // Use custom config if provided, otherwise use template defaults
    const slots = config?.dailySlots || templateConfig.dailySlots
    const activityCount = config?.dailyActivityCount || templateConfig.dailyActivityCount

    // Generate activities for each day of the week (Monday-Sunday)
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + dayOffset - 1)
      currentDay.setHours(0, 0, 0, 0)

      // Skip Sunday (day 7) for most templates
      if (dayOffset === 7 && configType !== 'EXPERT') {
        continue
      }

      // Determine number of activities for this day
      const count = Math.floor(
        Math.random() * (activityCount.max - activityCount.min + 1)
      ) + activityCount.min

      // Assign activities to slots
      for (let i = 0; i < count && i < slots.length; i++) {
        const slot = slots[i]
        const scheduledFor = new Date(currentDay)
        scheduledFor.setHours(slot.hour, 0, 0, 0)

        // Pick an activity (rotate through available activities)
        const activityIndex = (dayOffset - 1 + i) % activities.length
        const activity = activities[activityIndex]

        if (activity) {
          scheduleItems.push({
            scheduleId: schedule.id,
            activityId: activity.id,
            scheduledFor,
            duration: activity.duration,
            status: 'PLANNED' as ItemStatus,
          })
        }
      }
    }

    // Create all schedule items
    if (scheduleItems.length > 0) {
      await prisma.scheduleItem.createMany({
        data: scheduleItems,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Applied ${template.name} template`,
      itemsCreated: scheduleItems.length,
    })
  } catch (error) {
    console.error('Apply template error:', error)
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    )
  }
}
