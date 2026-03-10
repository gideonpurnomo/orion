'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, MinusCircle, Loader2, Save } from 'lucide-react'

interface TimeSlot {
  hour: number
  available: boolean | null // null = not set, true = available, false = unavailable
}

type DaySlots = {
  [hour: number]: boolean | null
}

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfWeekMonday(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  const diff = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - diff)
  return result
}

export default function AvailabilityCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Availability state: dayIndex (0-6) -> hour -> availability
  const [availability, setAvailability] = useState<Record<number, DaySlots>>({})

  const weekStart = useMemo(() => startOfWeekMonday(currentDate), [currentDate])
  const weekDaysDates = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    }),
    [weekStart]
  )

  useEffect(() => {
    fetchAvailability()
  }, [currentDate])

  const fetchAvailability = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/availability/settings')
      if (response.status === 401) {
        setError('Please sign in to view your availability')
        setIsLoading(false)
        return
      }
      if (!response.ok) throw new Error('Failed to fetch availability')

      const data = await response.json()
      if (data.settings?.timePreferences) {
        setAvailability(data.settings.timePreferences)
      } else {
        // Initialize empty availability
        const empty: Record<number, DaySlots> = {}
        weekDays.forEach((_, i) => {
          empty[i] = {}
          hours.forEach(hour => {
            empty[i][hour] = null
          })
        })
        setAvailability(empty)
      }
    } catch (err) {
      console.error('Fetch availability error:', err)
      setError('Failed to load availability settings')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSlot = (dayIndex: number, hour: number) => {
    setAvailability(prev => {
      const current = prev[dayIndex]?.[hour]
      let newValue: boolean | null

      // Cycle: null -> true -> false -> null
      if (current === null) newValue = true
      else if (current === true) newValue = false
      else newValue = null

      return {
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          [hour]: newValue,
        },
      }
    })
  }

  const saveAvailability = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/availability/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timePreferences: availability,
        }),
      })

      if (!response.ok) throw new Error('Failed to save availability')

      setSuccess('Availability settings saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Save availability error:', err)
      setError('Failed to save availability settings')
    } finally {
      setSaving(false)
    }
  }

  const getSlotIcon = (status: boolean | null) => {
    if (status === null) return <MinusCircle className="h-4 w-4 text-slate-400" />
    if (status) return <CheckCircle className="h-4 w-4 text-emerald-500" />
    return <XCircle className="h-4 w-4 text-red-400" />
  }

  const getSlotClass = (status: boolean | null) => {
    if (status === null) return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
    if (status) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
  }

  const formatHour = (hour24: number) => {
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    const display = hour24 % 12 === 0 ? 12 : hour24 % 12
    return `${display} ${ampm}`
  }

  const goPrevWeek = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() - 7)
    setCurrentDate(next)
  }

  const goNextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 7)
    setCurrentDate(next)
  }

  const goToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Availability Calendar</h1>
              <p className="text-slate-600 dark:text-slate-400">Set your weekly availability for scheduling</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goPrevWeek} className="border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <ChevronLeft className="mr-1 h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" onClick={goToday} className="border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Today
              </Button>
              <Button variant="outline" onClick={goNextWeek} className="border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                onClick={() => void saveAvailability()}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white hover:from-blue-700 hover:to-cyan-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-emerald-700 dark:text-emerald-300">
              {success}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-slate-400" />
              <span>Not set</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-400/30 text-purple-600">💡</Badge>
              <span>Click to toggle status</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  <CalendarIcon className="mr-2 inline h-5 w-5 text-blue-500" />
                  {weekDaysDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {' - '}
                  {weekDaysDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Click time slots to set your availability
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {hours.length} hours/day • {hours.length * 7} total slots
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header row */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="py-2 text-sm font-semibold text-slate-500">Time</div>
                    {weekDays.map((day, index) => (
                      <div key={day} className="rounded bg-blue-100 py-2 text-center text-sm font-semibold text-slate-800 dark:bg-blue-900/30 dark:text-slate-200">
                        {day}<br />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {weekDaysDates[index].getMonth() + 1}/{weekDaysDates[index].getDate()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  <div className="space-y-2">
                    {hours.map(hour => (
                      <div key={hour} className="grid grid-cols-8 gap-2">
                        <div className="py-3 pr-2 text-right text-sm text-slate-500 dark:text-slate-400">
                          {formatHour(hour)}
                        </div>
                        {weekDays.map((_, dayIndex) => (
                          <button
                            key={`${hour}-${dayIndex}`}
                            onClick={() => toggleSlot(dayIndex, hour)}
                            className={`min-h-[48px] rounded-lg border p-2 transition-all hover:scale-105 hover:shadow-md ${
                              getSlotClass(availability[dayIndex]?.[hour])
                            } ${availability[dayIndex]?.[hour] === null ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700' : ''}`}
                          >
                            <div className="flex h-full items-center justify-center">
                              {getSlotIcon(availability[dayIndex]?.[hour])}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
