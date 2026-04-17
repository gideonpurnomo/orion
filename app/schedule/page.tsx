'use client'

import React, { useEffect, useMemo, useState, Suspense, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Calendar as CalendarIcon, Clock, Loader2, Copy, X, ChevronRight, ChevronLeft as PrevIcon, CheckCircle, LayoutTemplate, Download, Undo2, Keyboard } from 'lucide-react'
import { ScheduleTemplates } from '@/components/schedule-templates'
import CalendarExport from '@/components/calendar-export'
import { formatDuration } from '@/lib/utils'
import SessionPlanner, { SubTopic } from '@/components/session-planner'
import TimerDisplay from '@/components/timer-display'
import ActivityCompletion from '@/components/activity-completion'
import TopNav from '@/components/top-nav'
import { useScheduleDnd } from '@/hooks/useScheduleDnd'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { WeekGrid } from '@/components/schedule/week-grid'
import { SortableItem } from '@/components/schedule/sortable-item'
import { DragOverlayCard } from '@/components/schedule/drag-overlay-card'
import { WeekSkeleton, DaySkeleton, MonthSkeleton } from '@/components/schedule/schedule-skeleton'
import { ScheduleContextMenu } from '@/components/schedule/context-menu'
import type { ContextMenuTarget } from '@/components/schedule/context-menu'
import type { ScheduleItem, Activity, ClipboardActivity } from '@/types/schedule'

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

function getPersistedView(): 'day' | 'week' | 'month' {
  if (typeof window === 'undefined') return 'week'
  const stored = localStorage.getItem('schedule-view')
  if (stored === 'day' || stored === 'week' || stored === 'month') return stored
  return 'week'
}

function getRecentActivityIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('schedule-recent-activities') || '[]')
  } catch { return [] }
}

function addRecentActivityId(id: string) {
  try {
    const recent = getRecentActivityIds().filter((r) => r !== id)
    recent.unshift(id)
    localStorage.setItem('schedule-recent-activities', JSON.stringify(recent.slice(0, 10)))
  } catch { /* ignore */ }
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const addActivityId = searchParams.get('add')
  const scheduledForParam = searchParams.get('scheduledFor')

  const [view, setViewState] = useState<'day' | 'week' | 'month'>(getPersistedView)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showPlanner, setShowPlanner] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ScheduleItem | null>(null)
  const [activeSession, setActiveSession] = useState<SubTopic[] | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [clipboardActivity, setClipboardActivity] = useState<ClipboardActivity | null>(null)
  const [completionActivity, setCompletionActivity] = useState<ScheduleItem | null>(null)

  // Undo toast state
  const [undoInfo, setUndoInfo] = useState<{ itemId: string; originalDate: string } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Quick add state
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null)
  const [quickAddActivities, setQuickAddActivities] = useState<Activity[]>([])
  const [quickAddLoading, setQuickAddLoading] = useState(false)
  const [quickAddQuery, setQuickAddQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  // Keyboard shortcuts help dialog
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null)

  // Current time indicator
  const [now, setNow] = useState(new Date())

  // Persist view preference
  const setView = useCallback((v: 'day' | 'week' | 'month') => {
    setViewState(v)
    try { localStorage.setItem('schedule-view', v) } catch { /* ignore */ }
  }, [])

  // Debounce quick-add search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(quickAddQuery), 200)
    return () => clearTimeout(timer)
  }, [quickAddQuery])

  // Update current time every 60s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

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
      case 'COMPLETED': return 'bg-green-950/50 text-green-400 border-green-800'
      case 'IN_PROGRESS': return 'bg-blue-950/50 text-blue-400 border-blue-800'
      case 'PLANNED': return 'bg-slate-800 text-slate-300 border-slate-700'
      case 'SKIPPED': return 'bg-red-950/50 text-red-400 border-red-800'
      default: return 'bg-slate-800 text-slate-300 border-slate-700'
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
    setCompletionActivity(item)
  }

  const handleCompleteTopic = () => {
    setActiveSession(null)
  }

  const handleCompleteActivity = async (notes?: string, actualDuration?: number) => {
    if (!completionActivity) return

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleItemId: completionActivity.id,
          notes,
          actualDuration,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete activity')
      }

      const result = await response.json()

      // Update schedule item in local state
      setScheduleItems((prev) =>
        prev.map((item) =>
          item.id === completionActivity.id
            ? { ...item, status: 'COMPLETED' }
            : item
        )
      )

      // Show notification
      if (result.leveledUp || (result.achievements && result.achievements.length > 0)) {
        const msgs: string[] = []
        if (result.leveledUp) msgs.push(`Level up! You're now level ${result.newLevel}`)
        if (result.achievements?.length > 0) msgs.push(`${result.achievements[0].icon} ${result.achievements[0].title} unlocked! +${result.xpAwarded} XP`)
        const notification = msgs.join(' • ')
        setSuccessMessage(notification)
        setTimeout(() => setSuccessMessage(''), 5000)
      }

      // Return result so ActivityCompletion dialog can show XP reward
      return result
    } catch (err) {
      console.error('Complete error:', err)
      setError('Failed to complete activity')
      return null
    }
  }

  const handleMarkInProgress = async () => {
    if (!completionActivity) return

    try {
      const response = await fetch('/api/completion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleItemId: completionActivity.id,
          status: 'IN_PROGRESS',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark activity as in progress')
      }

      setScheduleItems((prev) =>
        prev.map((item) =>
          item.id === completionActivity.id
            ? { ...item, status: 'IN_PROGRESS' }
            : item
        )
      )
    } catch (err) {
      console.error('Mark in progress error:', err)
      setError('Failed to mark activity as in progress')
    }
  }

  const handleSkipActivity = async () => {
    if (!completionActivity) return

    try {
      const response = await fetch('/api/completion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleItemId: completionActivity.id,
          status: 'SKIPPED',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to skip activity')
      }

      setScheduleItems((prev) =>
        prev.map((item) =>
          item.id === completionActivity.id
            ? { ...item, status: 'SKIPPED' }
            : item
        )
      )
    } catch (err) {
      console.error('Skip error:', err)
      setError('Failed to skip activity')
    }
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

  const handleApplyTemplate = async (templateId: string, startDate: Date) => {
    try {
      const response = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          startDate: startDate.toISOString(),
          weekOffset: 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply template')
      }

      const result = await response.json()
      await fetchSchedule()
      return result
    } catch (err) {
      console.error('Apply template error:', err)
      throw err
    }
  }

  const handleDropOnCell = async (itemId: string, targetDate: Date) => {
    const item = scheduleItems.find((s) => s.id === itemId)
    if (!item) return

    const sourceDate = new Date(item.scheduledFor)
    if (sourceDate.getTime() === targetDate.getTime()) return

    const targetIso = targetDate.toISOString()
    const originalDate = item.scheduledFor

    // Save undo info
    setUndoInfo({ itemId, originalDate })
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndoInfo(null), 5000)

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

  const handleUndoMove = async () => {
    if (!undoInfo) return
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)

    const { itemId, originalDate } = undoInfo
    setUndoInfo(null)

    // Optimistically revert
    setScheduleItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, scheduledFor: originalDate } : s))
    )

    try {
      const response = await fetch('/api/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, scheduledFor: originalDate }),
      })
      if (!response.ok) throw new Error('Failed to undo move')
    } catch (err) {
      setError('Failed to undo move')
      await fetchSchedule()
    }
  }

  // Context menu handler for activity actions
  const handleActivityContextAction = async (action: 'complete' | 'copy' | 'moveToday' | 'delete', item: ScheduleItem) => {
    switch (action) {
      case 'complete':
        setCompletionActivity(item)
        break
      case 'copy':
        handleCopyActivity(item)
        break
      case 'moveToday': {
        const today = new Date()
        today.setHours(9, 0, 0, 0)
        await handleDropOnCell(item.id, today)
        break
      }
      case 'delete': {
        try {
          const response = await fetch(`/api/schedule/${item.id}`, { method: 'DELETE' })
          if (!response.ok) throw new Error('Failed to delete')
          setScheduleItems((prev) => prev.filter((s) => s.id !== item.id))
        } catch {
          setError('Failed to delete activity')
        }
        break
      }
    }
  }

  const handleCellContextAction = async (action: 'add' | 'paste', date: Date) => {
    if (action === 'add') {
      await openQuickAdd(date)
    } else if (action === 'paste' && clipboardActivity) {
      try {
        await createScheduleItem(clipboardActivity.activityId, date, clipboardActivity.duration)
      } catch {
        setError('Failed to paste activity')
      }
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchScheduleCb = useCallback(async () => { fetchSchedule() }, [currentDate])

  const { dndContextProps, activeItem, overCellId, isDragging } = useScheduleDnd(
    scheduleItems,
    handleDropOnCell,
    fetchScheduleCb,
  )

  // Filtered + sorted quick add: recent first when no query, then filter by debounced query
  const filteredQuickAddActivities = useMemo(() => {
    let list = quickAddActivities
    if (!debouncedQuery.trim()) {
      const recentIds = getRecentActivityIds()
      const recentSet = new Set(recentIds)
      const recent = list.filter((a) => recentSet.has(a.id)).sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
      const rest = list.filter((a) => !recentSet.has(a.id))
      list = [...recent, ...rest]
    } else {
      const q = debouncedQuery.toLowerCase()
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [quickAddActivities, debouncedQuery])

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

  // Keyboard shortcuts
  const cycleView = useCallback(() => {
    setView(view === 'day' ? 'week' : view === 'week' ? 'month' : 'day')
  }, [view, setView])

  const jumpToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const toggleHelp = useCallback(() => {
    setShortcutsHelpOpen((prev) => !prev)
  }, [])

  const closeTopmost = useCallback(() => {
    if (contextMenu) { setContextMenu(null); return }
    if (quickAddOpen) { setQuickAddOpen(false); return }
    if (completionActivity) { setCompletionActivity(null); return }
    if (templatesOpen) { setTemplatesOpen(false); return }
    if (exportOpen) { setExportOpen(false); return }
    if (shortcutsHelpOpen) { setShortcutsHelpOpen(false); return }
  }, [contextMenu, quickAddOpen, completionActivity, templatesOpen, exportOpen, shortcutsHelpOpen])

  useKeyboardShortcuts({
    onCycleView: cycleView,
    onToday: jumpToday,
    onToggleHelp: toggleHelp,
    onClose: closeTopmost,
  })

  // Context menu handlers
  const handleItemContextMenu = useCallback((e: React.MouseEvent, item: ScheduleItem) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }, [])

  const handleCellContextMenu = useCallback((e: React.MouseEvent, cellDate: Date) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, cellDate })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <TopNav theme="blue" />
      {error && (
        <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg bg-red-500/90 px-6 py-4 text-white shadow-lg backdrop-blur-sm animate-fade-slide-in">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button onClick={() => setError('')} className="rounded p-1 transition-colors hover:bg-white/20">✕</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg bg-emerald-500/90 px-6 py-4 text-white shadow-lg backdrop-blur-sm animate-fade-slide-in">
          <div className="flex items-center justify-between gap-4">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="rounded p-1 transition-colors hover:bg-white/20">✕</button>
          </div>
        </div>
      )}

      {/* Undo toast */}
      {undoInfo && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-slide-in">
          <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 shadow-xl">
            <span className="text-sm text-slate-300">Activity moved</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndoMove}
              className="border-blue-500 text-blue-400 hover:bg-blue-950/30"
            >
              <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
            </Button>
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <ScheduleContextMenu
          target={contextMenu}
          clipboardActivity={clipboardActivity}
          onActivityAction={handleActivityContextAction}
          onCellAction={handleCellContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {activeSession && activeSession.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
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

      {/* Activity Completion Dialog */}
      {completionActivity && (
        <ActivityCompletion
          isOpen={!!completionActivity}
          onClose={() => setCompletionActivity(null)}
          activity={{
            id: completionActivity.id,
            title: getItemTitle(completionActivity),
            description: completionActivity.description,
            difficulty: completionActivity.difficulty || 1,
            duration: getItemDuration(completionActivity),
            domain: completionActivity.domain || completionActivity.activity?.domain,
            category: undefined,
          }}
          scheduleItemId={completionActivity.id}
          onComplete={handleCompleteActivity}
          onMarkInProgress={handleMarkInProgress}
          onSkip={handleSkipActivity}
        />
      )}

      {quickAddOpen && quickAddDate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-xl animate-fade-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Add Activity to Block</h3>
                <p className="text-sm text-slate-300">
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
              className="mb-4 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
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
                    className="flex w-full items-center justify-between rounded-lg border border-slate-700 p-3 text-left transition hover:border-blue-500 hover:bg-blue-950/30"
                    onClick={async () => {
                      try {
                        addRecentActivityId(activity.id)
                        await createScheduleItem(activity.id, quickAddDate, activity.duration)
                        setQuickAddOpen(false)
                      } catch (err) {
                        setError('Failed to add activity to selected block')
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium text-slate-100">{activity.domain?.icon} {activity.title}</p>
                      <p className="text-xs text-slate-400">{activity.category?.name} • {formatDuration(activity.duration)}</p>
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
              <h1 className="text-3xl font-bold text-slate-100">Schedule</h1>
              <p className="text-slate-400">Blue planner: drag, copy/paste, and quick-add to specific blocks</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700">
                <PrevIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goNext} className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white hover:from-blue-700 hover:to-cyan-700">
                <Link href="/library?next=/schedule">
                  <Plus className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Add Activity</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setTemplatesOpen(true)}
                className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                <LayoutTemplate className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportOpen(true)}
                className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                <Download className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {clipboardActivity && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-blue-900 bg-blue-950/30 px-4 py-3">
              <p className="text-sm text-blue-300">
                Clipboard: {clipboardActivity.icon} {clipboardActivity.title} ({formatDuration(clipboardActivity.duration)})
              </p>
              <Button variant="ghost" size="sm" className="text-blue-300" onClick={() => setClipboardActivity(null)}>
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

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsHelpOpen(true)}
              className="text-slate-500 hover:text-slate-300"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div key={view} className="animate-crossfade-in">
          {view === 'week' && (
            <Card className="border-slate-700 bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <CalendarIcon className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Drag to reschedule. Click empty blocks to quick-add. Copy an activity, then click another block to paste.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <WeekSkeleton />
                ) : (
                  <DndContext {...dndContextProps}>
                    {/* Mobile: sortable day lists */}
                    <div className="space-y-4 md:hidden">
                      {weekDays.map((dayDate, dayIndex) => {
                        const dayItemsList = scheduleItems
                          .filter((s) => new Date(s.scheduledFor).toDateString() === dayDate.toDateString())
                          .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())

                        return (
                          <div key={dayDate.toISOString()} className="rounded-lg border border-slate-700 p-3">
                            <div className="mb-2 rounded bg-blue-950/50 px-3 py-2 text-center text-sm font-semibold text-blue-300">
                              {weekDayLabels[dayIndex]} — {dayDate.getMonth() + 1}/{dayDate.getDate()}
                            </div>
                            {dayItemsList.length === 0 ? (
                              <button
                                onClick={() => void handleAddToCell(toCellDate(dayDate, 9))}
                                className="w-full rounded-lg border border-dashed border-slate-600 p-4 text-center text-sm text-slate-400 hover:border-blue-500 hover:bg-blue-950/30"
                              >
                                + Add activity
                              </button>
                            ) : (
                              <SortableContext items={dayItemsList.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                  {dayItemsList.map((item) => (
                                    <SortableItem
                                      key={item.id}
                                      item={item}
                                      getStatusColor={getStatusColor}
                                      getItemIcon={getItemIcon}
                                      getItemTitle={getItemTitle}
                                      getItemDuration={getItemDuration}
                                      formatDuration={formatDuration}
                                      onActivityClick={handleActivityClick}
                                      onCopyActivity={handleCopyActivity}
                                      onContextMenu={handleItemContextMenu}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Desktop: grid view */}
                    <WeekGrid
                      hours={hours}
                      weekDays={weekDays}
                      weekDayLabels={weekDayLabels}
                      scheduleItems={scheduleItems}
                      isDragging={isDragging}
                      overCellId={overCellId}
                      currentTime={now}
                      getStatusColor={getStatusColor}
                      getItemIcon={getItemIcon}
                      getItemTitle={getItemTitle}
                      getItemDuration={getItemDuration}
                      formatDuration={formatDuration}
                      formatHour={formatHour}
                      toCellDate={toCellDate}
                      onActivityClick={handleActivityClick}
                      onCopyActivity={handleCopyActivity}
                      onAddToCell={(date) => void handleAddToCell(date)}
                    />

                    <DragOverlay dropAnimation={null}>
                      {activeItem ? (
                        <DragOverlayCard
                          item={activeItem}
                          getItemIcon={getItemIcon}
                          getItemTitle={getItemTitle}
                          getItemDuration={getItemDuration}
                          formatDuration={formatDuration}
                          getStatusColor={getStatusColor}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          )}

          {view === 'day' && (
            <Card className="border-slate-700 bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Day View</CardTitle>
                <CardDescription className="text-slate-400">
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <DaySkeleton />
                ) : dayItems.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="mb-4 text-slate-400">No activities scheduled for this day</p>
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
                        onContextMenu={(e) => handleItemContextMenu(e, item)}
                        className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4 transition hover:border-blue-500 hover:bg-blue-950/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getItemIcon(item)}</div>
                          <div>
                            <div className="font-medium text-slate-100">{getItemTitle(item)}</div>
                            <div className="text-sm text-slate-400">
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
                            className="text-slate-400 hover:bg-slate-700 hover:text-slate-100"
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
            <Card className="border-slate-700 bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Month View</CardTitle>
                <CardDescription className="text-slate-400">
                  Click any day to add at 9 AM. Use clipboard + click for quick paste.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <MonthSkeleton />
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {weekDayLabels.map((label) => (
                      <div key={label} className="py-2 text-center text-sm font-semibold text-slate-500">{label}</div>
                    ))}

                    {monthGridDays.map((dayDate) => {
                      const isCurrentMonth = dayDate.getMonth() === monthFirst.getMonth()
                      const dayCellItems = scheduleItems.filter((item) => {
                        const d = new Date(item.scheduledFor)
                        return d.toDateString() === dayDate.toDateString()
                      })

                      return (
                        <div
                          key={dayDate.toISOString()}
                          onClick={() => {
                            if (dayCellItems.length === 0) {
                              void handleAddToCell(toCellDate(dayDate, 9))
                            }
                          }}
                          onContextMenu={(e) => handleCellContextMenu(e, toCellDate(dayDate, 9))}
                          className={`min-h-[90px] rounded-lg border p-2 transition ${
                            isCurrentMonth
                              ? 'cursor-pointer border-slate-700 hover:border-blue-500 hover:bg-blue-950/30'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          <div className={`text-sm font-medium ${isCurrentMonth ? 'text-slate-100' : 'text-slate-400'}`}>
                            {dayDate.getDate()}
                          </div>

                          <div className="mt-1 space-y-1">
                            {dayCellItems.slice(0, 2).map((item) => (
                              <div
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActivityClick(item)
                                }}
                                onContextMenu={(e) => {
                                  e.stopPropagation()
                                  handleItemContextMenu(e, item)
                                }}
                                className="truncate rounded bg-blue-950/50 px-1 py-0.5 text-xs text-blue-300 hover:bg-blue-900"
                              >
                                {getItemIcon(item)} {getItemTitle(item).slice(0, 16)}
                              </div>
                            ))}
                            {dayCellItems.length > 2 && (
                              <div className="text-[10px] text-blue-400">+{dayCellItems.length - 2} more</div>
                            )}
                            {isCurrentMonth && dayCellItems.length === 0 && (
                              <div className="text-[10px] text-slate-400">Click to add</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <ScheduleTemplates
          isOpen={templatesOpen}
          onClose={() => setTemplatesOpen(false)}
          onApply={handleApplyTemplate}
        />

        <CalendarExport
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
        />
      </div>

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
        <DialogContent className="max-w-sm bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {[
              { key: 'V', desc: 'Cycle view (Day → Week → Month)' },
              { key: 'T', desc: 'Jump to today' },
              { key: '?', desc: 'Toggle this help' },
              { key: 'Esc', desc: 'Close topmost dialog' },
            ].map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{shortcut.desc}</span>
                <kbd className="rounded border border-slate-600 bg-slate-700 px-2 py-0.5 text-xs font-mono text-slate-200">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  )
}
