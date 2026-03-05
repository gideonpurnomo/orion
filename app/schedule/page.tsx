'use client'

import React, { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon, Clock, Loader2, Copy, X, ChevronRight, ChevronLeft as PrevIcon } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import SessionPlanner, { SubTopic } from '@/components/session-planner'
import TimerDisplay from '@/components/timer-display'
import TopNav from '@/components/top-nav'

interface ScheduleItem {
  id: string
  activityId?: string
  title?: string
  description?: string
  difficulty?: number
  duration?: number
  tags?: string[]
  status: string
  scheduledFor: string
  domain?: {
    name: string
    icon?: string
  }
  activity?: {
    id: string
    title: string
    duration?: number
    tags?: string[]
    domain?: {
      name: string
      icon?: string
    }
  }
}

interface Activity {
  id: string
  title: string
  description: string
  difficulty: number
  duration: number
  tags: string[]
  domain?: {
    id: string
    name: string
    icon?: string
  }
  category?: {
    id: string
    name: string
  }
}

interface ClipboardActivity {
  activityId: string
  title: string
  duration: number
  icon?: string
}

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfWeekMonday(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  const diff = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - diff)
  return result
}

function endOfWeekMonday(date: Date) {
  const start = startOfWeekMonday(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function formatHour(hour24: number) {
  const ampm = hour24 >= 12 ? 'PM' : 'AM'
  const display = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${display} ${ampm}`
}

function toCellDate(baseDate: Date, hour: number, minute = 0) {
  const result = new Date(baseDate)
  result.setHours(hour, minute, 0, 0)
  return result
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const addActivityId = searchParams.get('add')
  const scheduledForParam = searchParams.get('scheduledFor')

  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showPlanner, setShowPlanner] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ScheduleItem | null>(null)
  const [activeSession, setActiveSession] = useState<SubTopic[] | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [clipboardActivity, setClipboardActivity] = useState<ClipboardActivity | null>(null)

  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null)
  const [quickAddActivities, setQuickAddActivities] = useState<Activity[]>([])
  const [quickAddLoading, setQuickAddLoading] = useState(false)
  const [quickAddQuery, setQuickAddQuery] = useState('')

  const weekStart = useMemo(() => startOfWeekMonday(currentDate), [currentDate])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)),
    [weekStart]
  )

  const monthFirst = useMemo(() => startOfMonth(currentDate), [currentDate])
  const monthLast = useMemo(() => endOfMonth(currentDate), [currentDate])

  const monthGridDays = useMemo(() => {
    const gridStart = startOfWeekMonday(monthFirst)
    return Array.from({ length: 42 }).map((_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
  }, [monthFirst])

  const getItemTitle = (item: ScheduleItem) => item.title || item.activity?.title || 'Untitled Activity'
  const getItemIcon = (item: ScheduleItem) => item.domain?.icon || item.activity?.domain?.icon || '📚'
  const getItemDuration = (item: ScheduleItem) => item.duration || item.activity?.duration || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PLANNED': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'SKIPPED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const fetchSchedule = async () => {
    setIsLoading(true)
    const rangeStart = startOfWeekMonday(startOfMonth(currentDate))
    const rangeEnd = endOfWeekMonday(endOfMonth(currentDate))

    try {
      const params = new URLSearchParams({
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      })

      const response = await fetch(`/api/schedule?${params.toString()}`)
      if (response.status === 401) {
        setError('Please sign in to view and edit your schedule')
        setScheduleItems([])
        setIsLoading(false)
        return
      }
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }

      const data = await response.json()
      setScheduleItems(data.items || [])
      setError('')
    } catch (err) {
      console.error('Fetch schedule error:', err)
      setError('Failed to load schedule')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [currentDate])

  useEffect(() => {
    const handleAddFromUrl = async () => {
      if (!addActivityId) return

      try {
        const response = await fetch(`/api/activities/${addActivityId}`)
        if (!response.ok) throw new Error('Failed to fetch activity')

        const data = await response.json()
        const activity: Activity = data.activity

        const scheduledFor = scheduledForParam && !Number.isNaN(new Date(scheduledForParam).getTime())
          ? new Date(scheduledForParam).toISOString()
          : new Date().toISOString()

        const scheduleItem: ScheduleItem = {
          id: activity.id,
          activityId: activity.id,
          title: activity.title,
          description: activity.description,
          difficulty: activity.difficulty,
          duration: activity.duration,
          tags: activity.tags || [],
          status: 'PLANNED',
          scheduledFor,
          domain: activity.domain || undefined,
          activity: {
            id: activity.id,
            title: activity.title,
            duration: activity.duration,
            tags: activity.tags || [],
            domain: activity.domain,
          }
        }

        setSelectedActivity(scheduleItem)
        setShowPlanner(true)
      } catch (err) {
        console.error('Fetch activity error:', err)
        setError('Failed to load activity from URL')
      }
    }

    handleAddFromUrl()
  }, [addActivityId, scheduledForParam])

  const createScheduleItem = async (activityId: string, scheduledFor: Date, duration?: number, notes?: string) => {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId,
        scheduledFor: scheduledFor.toISOString(),
        duration,
        notes,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create schedule item')
    }

    await fetchSchedule()
  }

  const handleSaveSession = async (topics: SubTopic[]) => {
    if (!selectedActivity) return

    try {
      const activityId = selectedActivity.activity?.id || selectedActivity.activityId || selectedActivity.id
      const selectedDate = new Date(selectedActivity.scheduledFor)
      const scheduledFor = Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate
      if (Number.isNaN(selectedDate.getTime())) {
        scheduledFor.setMinutes(scheduledFor.getMinutes() + 5)
      }

      await createScheduleItem(
        activityId,
        scheduledFor,
        topics.reduce((sum, t) => sum + t.minutes, 0),
        topics.map(t => t.name).join(', ')
      )

      setActiveSession(topics)
      setShowPlanner(false)
    } catch (err) {
      console.error('Save session error:', err)
      setError('Failed to save session. Please try again.')
    }
  }

  const handleActivityClick = (item: ScheduleItem) => {
    setSelectedActivity(item)
    setShowPlanner(true)
  }

  const handleCompleteTopic = () => {
    setActiveSession(null)
  }

  const handleCopyActivity = (item: ScheduleItem) => {
    const activityId = item.activity?.id || item.activityId
    if (!activityId) {
      setError('This activity cannot be copied')
      return
    }

    setClipboardActivity({
      activityId,
      title: getItemTitle(item),
      duration: getItemDuration(item),
      icon: getItemIcon(item),
    })
  }

  const openQuickAdd = async (targetDate: Date) => {
    setQuickAddDate(targetDate)
    setQuickAddOpen(true)
    setQuickAddQuery('')

    if (quickAddActivities.length > 0) return

    setQuickAddLoading(true)
    try {
      const response = await fetch('/api/activities/search?limit=50')
      if (!response.ok) throw new Error('Failed to load activities')
      const data = await response.json()
      setQuickAddActivities(data.activities || [])
    } catch (err) {
      console.error('Quick add load error:', err)
      setError('Failed to load activities for quick add')
    } finally {
      setQuickAddLoading(false)
    }
  }

  const handleAddToCell = async (targetDate: Date) => {
    if (clipboardActivity) {
      try {
        await createScheduleItem(clipboardActivity.activityId, targetDate, clipboardActivity.duration)
      } catch (err) {
        setError('Failed to paste activity into selected block')
      }
      return
    }

    await openQuickAdd(targetDate)
  }

  const handleDropOnCell = async (itemId: string, targetDate: Date) => {
    const item = scheduleItems.find((s) => s.id === itemId)
    if (!item) return

    const sourceDate = new Date(item.scheduledFor)
    if (sourceDate.getTime() === targetDate.getTime()) return

    const targetIso = targetDate.toISOString()

    setScheduleItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, scheduledFor: targetIso } : s))
    )

    try {
      const response = await fetch('/api/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          scheduledFor: targetIso,
        }),
      })

      if (!response.ok) throw new Error('Failed to move activity')
    } catch (err) {
      setError('Failed to move activity. Please try again.')
      await fetchSchedule()
    }
  }

  const filteredQuickAddActivities = useMemo(() => {
    if (!quickAddQuery.trim()) return quickAddActivities
    const q = quickAddQuery.toLowerCase()
    return quickAddActivities.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      (a.tags || []).some((t) => t.toLowerCase().includes(q))
    )
  }, [quickAddActivities, quickAddQuery])

  const dayItems = scheduleItems
    .filter((item) => {
      const itemDate = new Date(item.scheduledFor)
      return itemDate.toDateString() === currentDate.toDateString()
    })
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())

  const goPrev = () => {
    const next = new Date(currentDate)
    if (view === 'day') next.setDate(next.getDate() - 1)
    if (view === 'week') next.setDate(next.getDate() - 7)
    if (view === 'month') next.setMonth(next.getMonth() - 1)
    setCurrentDate(next)
  }

  const goNext = () => {
    const next = new Date(currentDate)
    if (view === 'day') next.setDate(next.getDate() + 1)
    if (view === 'week') next.setDate(next.getDate() + 7)
    if (view === 'month') next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav theme="blue" />
      {error && (
        <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg bg-red-500/90 px-6 py-4 text-white shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button onClick={() => setError('')} className="rounded p-1 transition-colors hover:bg-white/20">✕</button>
          </div>
        </div>
      )}

      {activeSession && activeSession.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm dark:bg-black/90">
          <TimerDisplay
            topicName={activeSession[0].name}
            initialMinutes={activeSession[0].minutes}
            onComplete={handleCompleteTopic}
            onCancel={() => setActiveSession(null)}
            domainIcon={selectedActivity?.domain?.icon}
          />
        </div>
      )}

      {selectedActivity && (
        <SessionPlanner
          activity={{
            id: selectedActivity.id,
            title: getItemTitle(selectedActivity),
            tags: selectedActivity.tags || selectedActivity.activity?.tags || [],
            duration: getItemDuration(selectedActivity)
          }}
          isOpen={showPlanner}
          onClose={() => setShowPlanner(false)}
          onSave={handleSaveSession}
        />
      )}

      {quickAddOpen && quickAddDate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Activity to Block</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {quickAddDate.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setQuickAddOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <input
              value={quickAddQuery}
              onChange={(e) => setQuickAddQuery(e.target.value)}
              placeholder="Search activities..."
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />

            {quickAddLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                {filteredQuickAddActivities.map((activity) => (
                  <button
                    key={activity.id}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    onClick={async () => {
                      try {
                        await createScheduleItem(activity.id, quickAddDate, activity.duration)
                        setQuickAddOpen(false)
                      } catch (err) {
                        setError('Failed to add activity to selected block')
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{activity.domain?.icon} {activity.title}</p>
                      <p className="text-xs text-slate-600">{activity.category?.name} • {formatDuration(activity.duration)}</p>
                    </div>
                    <Plus className="h-4 w-4 text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Schedule</h1>
              <p className="text-slate-600">Blue planner: drag, copy/paste, and quick-add to specific blocks</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={goPrev} className="border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <PrevIcon className="mr-1 h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Today
              </Button>
              <Button variant="outline" onClick={goNext} className="border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>

              <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white hover:from-blue-700 hover:to-cyan-700">
                <Link href="/library?next=/schedule">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Link>
              </Button>
            </div>
          </div>

          {clipboardActivity && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Clipboard: {clipboardActivity.icon} {clipboardActivity.title} ({formatDuration(clipboardActivity.duration)})
              </p>
              <Button variant="ghost" size="sm" className="text-blue-700 dark:text-blue-300" onClick={() => setClipboardActivity(null)}>
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => setView('day')}
            className={view === 'day' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
            className={view === 'week' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
            className={view === 'month' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}
          >
            Month
          </Button>
        </div>

        {view === 'week' && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <CalendarIcon className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription className="text-slate-600">
                Drag to reschedule. Click empty blocks to quick-add. Copy an activity, then click another block to paste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-8 gap-2">
                      <div className="py-2 text-sm font-semibold text-slate-500">Time</div>
                      {weekDays.map((day, index) => (
                        <div key={day.toISOString()} className="rounded bg-blue-100 py-2 text-center text-sm font-semibold text-slate-800">
                          {weekDayLabels[index]}<br />
                          <span className="text-xs text-slate-600">{day.getMonth() + 1}/{day.getDate()}</span>
                        </div>
                      ))}

                      {hours.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="py-3 pr-2 text-right text-sm text-slate-500">{formatHour(hour)}</div>
                          {weekDays.map((dayDate) => {
                            const targetDate = toCellDate(dayDate, hour)
                            const itemsInCell = scheduleItems.filter((s) => {
                              const d = new Date(s.scheduledFor)
                              return d.toDateString() === targetDate.toDateString() && d.getHours() === hour
                            })

                            return (
                              <div
                                key={`${targetDate.toISOString()}-${hour}`}
                                onClick={() => {
                                  if (itemsInCell.length === 0) {
                                    void handleAddToCell(targetDate)
                                  }
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  const itemId = e.dataTransfer.getData('text/plain')
                                  if (itemId) {
                                    void handleDropOnCell(itemId, targetDate)
                                  }
                                  setDraggingItemId(null)
                                }}
                                className={`min-h-[72px] rounded-lg border border-slate-200 p-2 transition-all ${
                                  itemsInCell.length > 0 ? 'hover:border-blue-300 hover:bg-blue-50' : 'cursor-pointer hover:border-blue-300 hover:bg-blue-50/70'
                                } ${draggingItemId ? 'ring-1 ring-blue-300' : ''}`}
                              >
                                {itemsInCell.length === 0 && (
                                  <div className="mt-4 text-center text-[11px] text-slate-400">Click to add</div>
                                )}

                                {itemsInCell.length > 0 && (
                                  <div className="space-y-1">
                                    {itemsInCell.slice(0, 2).map((item) => (
                                      <button
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData('text/plain', item.id)
                                          e.dataTransfer.effectAllowed = 'move'
                                          setDraggingItemId(item.id)
                                        }}
                                        onDragEnd={() => setDraggingItemId(null)}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleActivityClick(item)
                                        }}
                                        className={`w-full rounded border p-2 text-left text-sm ${getStatusColor(item.status)} hover:opacity-90`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="truncate font-medium">{getItemIcon(item)} {getItemTitle(item)}</div>
                                          <span
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleCopyActivity(item)
                                            }}
                                            className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/70 text-slate-600 hover:bg-white"
                                          >
                                            <Copy className="h-3.5 w-3.5" />
                                          </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                                          <Clock className="h-3 w-3" />
                                          {formatDuration(getItemDuration(item))}
                                        </div>
                                      </button>
                                    ))}
                                    {itemsInCell.length > 2 && (
                                      <div className="px-1 text-[10px] text-blue-700">+{itemsInCell.length - 2} more</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {view === 'day' && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Day View</CardTitle>
              <CardDescription className="text-slate-600">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : dayItems.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="mb-4 text-slate-600">No activities scheduled for this day</p>
                  <Button onClick={() => void handleAddToCell(toCellDate(currentDate, 9))} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add at 9 AM
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleActivityClick(item)}
                      className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getItemIcon(item)}</div>
                        <div>
                          <div className="font-medium text-slate-900">{getItemTitle(item)}</div>
                          <div className="text-sm text-slate-600">
                            {new Date(item.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {' '}• {formatDuration(getItemDuration(item))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyActivity(item)
                          }}
                          className="text-slate-500 hover:bg-white hover:text-slate-900"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {view === 'month' && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Month View</CardTitle>
              <CardDescription className="text-slate-600">
                Click any day to add at 9 AM. Use clipboard + click for quick paste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDayLabels.map((label) => (
                  <div key={label} className="py-2 text-center text-sm font-semibold text-slate-500">{label}</div>
                ))}

                {monthGridDays.map((dayDate) => {
                  const isCurrentMonth = dayDate.getMonth() === monthFirst.getMonth()
                  const dayItems = scheduleItems.filter((item) => {
                    const d = new Date(item.scheduledFor)
                    return d.toDateString() === dayDate.toDateString()
                  })

                  return (
                    <div
                      key={dayDate.toISOString()}
                      onClick={() => {
                        if (dayItems.length === 0) {
                          void handleAddToCell(toCellDate(dayDate, 9))
                        }
                      }}
                      className={`min-h-[90px] rounded-lg border p-2 transition ${
                        isCurrentMonth
                          ? 'cursor-pointer border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className={`text-sm font-medium ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}`}>
                        {dayDate.getDate()}
                      </div>

                      <div className="mt-1 space-y-1">
                        {dayItems.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActivityClick(item)
                            }}
                            className="truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800 hover:bg-blue-200"
                          >
                            {getItemIcon(item)} {getItemTitle(item).slice(0, 16)}
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <div className="text-[10px] text-blue-700">+{dayItems.length - 2} more</div>
                        )}
                        {isCurrentMonth && dayItems.length === 0 && (
                          <div className="text-[10px] text-slate-400">Click to add</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-blue-100 to-indigo-100">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  )
}
