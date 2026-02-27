'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Plus, Calendar as CalendarIcon, Play, Clock, Loader2 } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import SessionPlanner, { SubTopic } from '@/components/session-planner'
import TimerDisplay from '@/components/timer-display'

interface ScheduleItem {
  id: string
  title: string
  description: string
  difficulty: number
  duration: number
  tags: string[]
  time: string
  day: string
  status: string
  scheduledFor: string
  domain?: {
    name: string
    icon?: string
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

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const addActivityId = searchParams.get('add')

  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [showPlanner, setShowPlanner] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ScheduleItem | null>(null)
  const [activeSession, setActiveSession] = useState<SubTopic[] | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch schedule from API
  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }
      const data = await response.json()
      setScheduleItems(data.items || [])
      setIsLoading(false)
    } catch (err) {
      console.error('Fetch schedule error:', err)
      setError('Failed to load schedule')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  // Parse URL parameters to auto-open planner for adding activity
  useEffect(() => {
    const handleAddFromUrl = async () => {
      if (addActivityId) {
        try {
          const response = await fetch(`/api/activities/${addActivityId}`)
          if (!response.ok) {
            throw new Error('Failed to fetch activity')
          }
          const data = await response.json()
          const activity: Activity = data.activity

          // Convert to ScheduleItem format for selectedActivity
          const scheduleItem: ScheduleItem = {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            difficulty: activity.difficulty,
            duration: activity.duration,
            tags: activity.tags || [],
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
            status: 'PLANNED',
            scheduledFor: new Date().toISOString(),
            domain: activity.domain || undefined
          }

          setSelectedActivity(scheduleItem)
          setShowPlanner(true)
        } catch (err) {
          console.error('Fetch activity error:', err)
          setError('Failed to load activity from URL')
        }
      }
    }

    handleAddFromUrl()
  }, [addActivityId])

  const handleActivityClick = (item: ScheduleItem) => {
    setSelectedActivity(item)
    setShowPlanner(true)
  }

  const handleSaveSession = async (topics: SubTopic[]) => {
    if (!selectedActivity) return

    try {
      const scheduledFor = new Date()
      scheduledFor.setMinutes(scheduledFor.getMinutes() + 5) // Schedule 5 minutes from now

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: selectedActivity.id,
          scheduledFor: scheduledFor.toISOString(),
          duration: topics.reduce((sum, t) => sum + t.minutes, 0),
          notes: topics.map(t => t.name).join(', ')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save schedule item')
      }

      // Refresh schedule data
      await fetchSchedule()

      // Start the first topic
      setActiveSession(topics)
      setShowPlanner(false)
    } catch (err) {
      console.error('Save session error:', err)
      setError('Failed to save session. Please try again.')
    }
  }

  const handleStartTopic = (topic: SubTopic) => {
    setActiveSession([topic])
  }

  const handleCompleteTopic = (topic: SubTopic) => {
    setActiveSession(null)
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PLANNED': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'SKIPPED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Error Notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button
              onClick={() => setError('')}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Active Session Overlay */}
      {activeSession && activeSession.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <TimerDisplay
            topicName={activeSession[0].name}
            initialMinutes={activeSession[0].minutes}
            onComplete={() => handleCompleteTopic(activeSession[0])}
            onCancel={() => setActiveSession(null)}
            domainIcon={selectedActivity?.domain?.icon}
          />
        </div>
      )}

      {/* Session Planner Modal */}
      {selectedActivity && (
        <SessionPlanner
          activity={{
            id: selectedActivity.id,
            title: selectedActivity.title,
            tags: selectedActivity.tags || [],
            duration: selectedActivity.duration
          }}
          isOpen={showPlanner}
          onClose={() => setShowPlanner(false)}
          onSave={handleSaveSession}
        />
      )}

      {/* Main Schedule Page */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Schedule</h1>
              <p className="text-gray-400">Plan and manage your learning schedule</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => setView('day')}
            className={`transition-all duration-300 ${
              view === 'day'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/30'
                : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
            }`}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
            className={`transition-all duration-300 ${
              view === 'week'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/30'
                : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
            }`}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
            className={`transition-all duration-300 ${
              view === 'month'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/30'
                : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
            }`}
          >
            Month
          </Button>
        </div>

        {/* Weekly Calendar View */}
        {view === 'week' && (
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarIcon className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription className="text-gray-400">Click any activity to customize your session</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-2">{error}</p>
                  <Button onClick={fetchSchedule} variant="outline" className="border-white/20 text-white">
                    Try Again
                  </Button>
                </div>
              ) : scheduleItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No scheduled activities yet</p>
                  <p className="text-sm text-gray-500">Search for activities and add them to your schedule</p>
                  <Button asChild variant="outline" className="border-white/20 text-white">
                    <Link href="/library">
                      Browse Activities
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-8 gap-2">
                      {/* Time Column */}
                      <div className="font-semibold text-sm text-gray-500 py-2">Time</div>
                      {days.map((day) => (
                        <div key={day} className="font-semibold text-sm text-center py-2 bg-purple-500/20 rounded text-white">
                          {day}
                        </div>
                      ))}

                      {/* Time Rows */}
                      {hours.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="text-sm text-gray-400 py-3 text-right pr-2">{hour}</div>
                          {days.map((day) => {
                            const item = scheduleItems.find(
                              (s) => {
                                // Parse the date and check if it matches the day and hour
                                const itemDate = new Date(s.scheduledFor)
                                return itemDate.getDay() === ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(day) &&
                                       itemDate.getHours() === parseInt(hour.split(' ')[0])
                              }
                            )
                            return (
                              <div
                                key={`${hour}-${day}`}
                                onClick={() => item && handleActivityClick(item)}
                                className={`border border-white/10 rounded-lg p-2 min-h-[60px] transition-all duration-300 ${
                                  item
                                    ? 'cursor-pointer hover:border-purple-400/50 hover:bg-purple-500/10'
                                    : 'cursor-default'
                                }`}
                              >
                                {item && (
                                  <div className={`text-sm p-2 rounded ${getStatusColor(item.status)}`}>
                                    <div className="font-medium truncate">{item.domain?.icon} {item.title}</div>
                                    <div className="text-xs opacity-75 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDuration(item.duration)}
                                    </div>
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

        {/* Day View */}
        {view === 'day' && (
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Today's Schedule</CardTitle>
              <CardDescription className="text-gray-400">Your learning activities for today</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-2">{error}</p>
                  <Button onClick={fetchSchedule} variant="outline" className="border-white/20 text-white">
                    Try Again
                  </Button>
                </div>
              ) : scheduleItems.filter(item => {
                const itemDate = new Date(item.scheduledFor)
                return itemDate.toDateString() === new Date().toDateString()
              }).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No activities scheduled for today</p>
                  <p className="text-sm text-gray-500">Search for activities and add them to your schedule</p>
                  <Button asChild variant="outline" className="border-white/20 text-white">
                    <Link href="/library">
                      Browse Activities
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduleItems
                    .filter(item => {
                      const itemDate = new Date(item.scheduledFor)
                      return itemDate.toDateString() === new Date().toDateString()
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleActivityClick(item)}
                        className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{item.domain?.icon}</div>
                          <div>
                            <div className="font-medium text-white">{item.title}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(item.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              • {formatDuration(item.duration)}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Month View (Simplified) */}
        {view === 'month' && (
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">This Month</CardTitle>
              <CardDescription className="text-gray-400">Monthly overview of your learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="font-semibold text-sm text-center py-2 text-gray-500">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 2
                  const dayHasActivity = day > 0 && day <= 28 && scheduleItems.some(item => {
                    const itemDate = new Date(item.scheduledFor)
                    const targetDate = new Date(new Date().getFullYear(), new Date().getMonth(), day)
                    return itemDate.toDateString() === targetDate.toDateString()
                  })

                  return (
                    <div
                      key={i}
                      className={`border border-white/10 rounded-lg p-2 min-h-[80px] hover:border-purple-400/50 hover:bg-purple-500/10 transition-all duration-300 ${
                        dayHasActivity ? 'bg-purple-500/20 border-purple-400/50' : ''
                      }`}
                    >
                      {day > 0 && day <= 28 && (
                        <>
                          <div className="text-sm font-medium text-white">{day}</div>
                          {dayHasActivity && (
                            <div className="mt-1 space-y-1">
                              {scheduleItems
                                .filter(item => {
                                  const itemDate = new Date(item.scheduledFor)
                                  const targetDate = new Date(new Date().getFullYear(), new Date().getMonth(), day)
                                  return itemDate.toDateString() === targetDate.toDateString()
                                })
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => handleActivityClick(item)}
                                    className={`text-xs bg-purple-500/30 text-purple-200 rounded px-1 py-0.5 truncate hover:bg-purple-500/50 transition-colors`}
                                  >
                                    {item.domain?.icon} {item.title.substring(0, 15)}
                                  </div>
                                ))}
                            </div>
                          )}
                        </>
                      )}
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
