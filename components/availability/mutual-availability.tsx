'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Friend {
  id: string
  name: string
  email: string
  image?: string
}

interface TimeSlot {
  start: string
  end: string
  durationMinutes: number
}

interface AvailabilityResponse {
  mutualFreeSlots: TimeSlot[]
  dateRange: {
    start: string
    end: string
  }
  participants: string[]
  totalParticipants: number
}

interface MutualAvailabilityProps {
  friends: Friend[]
}

export function MutualAvailability({ friends }: MutualAvailabilityProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [error, setError] = useState<string>('')

  // Set default date range to this week
  useEffect(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    setStartDate(startOfWeek.toISOString().split('T')[0])
    setEndDate(endOfWeek.toISOString().split('T')[0])
  }, [])

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    )
  }

  const findAvailability = async () => {
    setError('')
    setAvailability(null)

    if (selectedFriends.length === 0) {
      setError('Please select at least one friend')
      return
    }

    if (!startDate || !endDate) {
      setError('Please select a date range')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/availability/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendIds: selectedFriends,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Failed to find availability')
      }

      const data = await response.json()
      setAvailability(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find availability')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getSlotColor = (duration: number) => {
    if (duration >= 120) return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100'
    if (duration >= 60) return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100'
    return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-100'
  }

  return (
    <div className="space-y-6">
      {/* Friend Selection */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Select Friends</CardTitle>
          <CardDescription>
            Choose friends to find mutual free time with ({selectedFriends.length} selected)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-sm text-slate-500">
              No friends yet. Add some friends first!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => toggleFriend(friend.id)}
                  className={`
                    inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all
                    ${
                      selectedFriends.includes(friend.id)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                    }
                  `}
                >
                  {friend.image && (
                    <img
                      src={friend.image}
                      alt={friend.name || friend.email}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  {friend.name || friend.email.split('@')[0]}
                  {selectedFriends.includes(friend.id) && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range Selection */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select the date range to check availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
          </div>

          <Button
            onClick={findAvailability}
            disabled={loading || selectedFriends.length === 0}
            className="mt-4 bg-slate-900 text-white hover:bg-slate-700"
          >
            {loading ? 'Finding...' : 'Find Free Time'}
          </Button>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {availability && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Mutual Free Time</CardTitle>
            <CardDescription>
              {availability.mutualFreeSlots.length} time slot
              {availability.mutualFreeSlots.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availability.mutualFreeSlots.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-slate-600">No mutual free time found in this range.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different date range or deselect some friends.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availability.mutualFreeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 rounded-lg border-2 p-4 ${getSlotColor(slot.durationMinutes)}`}
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {slot.durationMinutes >= 60
                            ? `${Math.floor(slot.durationMinutes / 60)}h ${slot.durationMinutes % 60}m`
                            : `${slot.durationMinutes}m`}
                        </span>
                        <Badge variant="secondary">
                          {formatDateTime(slot.start)}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">
                        {formatDateTime(slot.start)} - {formatDateTime(slot.end)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
