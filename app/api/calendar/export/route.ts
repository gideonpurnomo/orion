import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const exportSchema = z.object({
  format: z.enum(['ics', 'csv', 'json']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function formatICSDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

function escapeCSV(text: string): string {
  const csv = text.toString()
  if (csv.includes(',') || csv.includes('\n') || csv.includes('"')) {
    return `"${csv.replace(/"/g, '""')}"`
  }
  return csv
}

function generateICS(items: any[]): string {
  let ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Orion Learning//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-TIMEZONE:UTC\r\nX-WR-CALNAME:UTC\r\n`

  for (const item of items) {
    const startTime = new Date(item.scheduledFor)
    const duration = item.duration || item.activity?.duration || 60
    const endTime = new Date(startTime.getTime() + duration * 60000)

    ics += `BEGIN:VEVENT\r\n`
    ics += `UID:${item.id}@orion\r\n`
    ics += `DTSTAMP:${formatDateForICS(startTime)}\r\n`
    ics += `DTSTART:${formatICSDateTime(startTime)}\r\n`
    ics += `DTEND:${formatICSDateTime(endTime)}\r\n`
    ics += `SUMMARY:${escapeICS(item.activity?.title || item.title || 'Learning Activity')}\r\n`
    ics += `DESCRIPTION:${escapeICS(item.description || item.activity?.description || '')}\r\n`

    if (item.activity?.domain?.name) {
      ics += `CATEGORIES:${item.activity.domain.name}\r\n`
    }

    ics += `END:VEVENT\r\n`
  }

  ics += `END:VCALENDAR\r\n`
  return ics
}

function escapeICS(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function generateCSV(items: any[]): string {
  const headers = ['Date', 'Start Time', 'End Time', 'Activity', 'Domain', 'Category', 'Duration (min)', 'Status', 'Notes']
  let csv = headers.join(',') + '\r\n'

  for (const item of items) {
    const startTime = new Date(item.scheduledFor)
    const duration = item.duration || item.activity?.duration || 60
    const endTime = new Date(startTime.getTime() + duration * 60000)

    csv += [
      escapeCSV(startTime.toISOString().split('T')[0]),
      startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      escapeCSV(item.activity?.title || item.title || 'Untitled'),
      escapeCSV(item.activity?.domain?.name || ''),
      escapeCSV(item.activity?.category?.name || ''),
      duration.toString(),
      item.status,
      escapeCSV(item.notes || ''),
    ].join(',') + '\r\n'
  }

  return csv
}

function generateJSON(items: any[]): string {
  const data = items.map((item) => ({
    id: item.id,
    title: item.activity?.title || item.title || 'Untitled Activity',
    description: item.activity?.description || item.description || '',
    domain: item.activity?.domain?.name || '',
    category: item.activity?.category?.name || '',
    difficulty: item.activity?.difficulty || 5,
    duration: item.duration || item.activity?.duration || 60,
    scheduledFor: item.scheduledFor,
    status: item.status,
    notes: item.notes || '',
    completedAt: item.status === 'COMPLETED' ? new Date() : null,
  }))

  return JSON.stringify(data, null, 2)
}

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const { format = 'ics', startDate, endDate } = exportSchema.parse({
      format: searchParams.get('format') || 'ics',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    })

    // Calculate date range
    const now = new Date()
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999)

    // Fetch schedule items
    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        schedule: { userId: session.user.id },
        scheduledFor: {
          gte: start,
          lte: end,
        },
      },
      include: {
        activity: {
          include: {
            domain: true,
            category: true,
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    })

    let content: string
    let contentType: string
    let filename: string

    switch (format) {
      case 'ics':
        content = generateICS(scheduleItems)
        contentType = 'text/calendar; charset=utf-8'
        filename = `orion-schedule-${start.toISOString().split('T')[0]}.ics`
        break

      case 'csv':
        content = generateCSV(scheduleItems)
        contentType = 'text/csv; charset=utf-8'
        filename = `orion-schedule-${start.toISOString().split('T')[0]}.csv`
        break

      case 'json':
        content = generateJSON(scheduleItems)
        contentType = 'application/json; charset=utf-8'
        filename = `orion-schedule-${start.toISOString().split('T')[0]}.json`
        break
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export calendar' },
      { status: 500 }
    )
  }
}
