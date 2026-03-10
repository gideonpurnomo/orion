import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const availabilitySettingsSchema = z.object({
  workingHours: z.record(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']), z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })),
  daysOff: z.array(z.string().datetime()),
  timePreferences: z.object({
    energyLevels: z.array(z.object({
      timeSlot: z.enum(['morning', 'midday', 'afternoon', 'evening']),
      level: z.enum(['low', 'medium', 'high']),
    })),
    optimalLearningTimes: z.array(z.object({
      day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    breakPreferences: z.object({
      pomodoroEnabled: z.boolean(),
      pomodoroWorkMinutes: z.number().int().min(15).max(60),
      pomodoroBreakMinutes: z.number().int().min(5).max(30),
      sessionLengthMinutes: z.number().int().min(15).max(180),
    }),
  }),
})

const updateSettingsSchema = z.object({
  userId: z.string().min(1),
  workingHours: z.record(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']), z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })),
  daysOff: z.array(z.string().datetime()),
  timePreferences: z.object({
    energyLevels: z.array(z.object({
      timeSlot: z.enum(['morning', 'midday', 'afternoon', 'evening']),
      level: z.enum(['low', 'medium', 'high']),
    })),
    optimalLearningTimes: z.array(z.object({
      day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    breakPreferences: z.object({
      pomodoroEnabled: z.boolean(),
      pomodoroWorkMinutes: z.number().int().min(15).max(60),
      pomodoroBreakMinutes: z.number().int().min(5).max(30),
      sessionLengthMinutes: z.number().int().min(15).max(180),
    }),
  }),
})

// GET endpoint - Fetch availability settings
export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const availability = await prisma.userAvailability.findUnique({
      where: { userId: session.user.id },
    })

    if (!availability) {
      // Return default settings
      const defaultSettings = {
        workingHours: {
          mon: { enabled: true, startTime: '09:00', endTime: '17:00' },
          tue: { enabled: true, startTime: '09:00', endTime: '17:00' },
          wed: { enabled: true, startTime: '09:00', endTime: '17:00' },
          thu: { enabled: true, startTime: '09:00', endTime: '17:00' },
          fri: { enabled: true, startTime: '09:00', endTime: '17:00' },
          sat: { enabled: false, startTime: '09:00', endTime: '17:00' },
          sun: { enabled: false, startTime: '09:00', endTime: '17:00' },
        },
        daysOff: [],
        timePreferences: {
          energyLevels: [
            { timeSlot: 'morning', level: 'high' },
            { timeSlot: 'midday', level: 'high' },
            { timeSlot: 'afternoon', level: 'medium' },
            { timeSlot: 'evening', level: 'low' },
          ],
          optimalLearningTimes: [],
          breakPreferences: {
            pomodoroEnabled: false,
            pomodoroWorkMinutes: 25,
            pomodoroBreakMinutes: 5,
            sessionLengthMinutes: 60,
          },
        },
      }

      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Fetch availability error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

// POST endpoint - Create or update availability settings
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const existing = await prisma.userAvailability.findUnique({
      where: { userId },
    })

    const body = await request.json()
    const parsedBody = availabilitySettingsSchema.parse(body)

    const availabilityData = {
      userId,
      workingHours: parsedBody.workingHours,
      daysOff: parsedBody.daysOff || [],
      timePreferences: parsedBody.timePreferences,
    }

    if (existing) {
      await prisma.userAvailability.update({
        where: { userId },
        data: availabilityData,
      })
    } else {
      await prisma.userAvailability.create({
        data: availabilityData,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Availability settings saved',
    })
  } catch (error) {
    console.error('Save availability error:', error)
    return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 })
  }
}

// PATCH endpoint - Admin can update any user's availability
export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, ...settings } = updateSettingsSchema.parse(body)

    const updated = await prisma.userAvailability.update({
      where: { userId },
      data: settings,
    })

    return NextResponse.json({
      success: true,
      availability: updated,
    })
  } catch (error) {
    console.error('Update availability error:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}
