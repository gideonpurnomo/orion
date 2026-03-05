'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/top-nav'
import { MutualAvailability } from '@/components/availability/mutual-availability'

interface Friend {
  id: string
  name: string
  email: string
  image?: string
}

interface FriendRecord {
  id: string
  user: Friend
}

export default function AvailabilityPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  const loadFriends = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load friends')
      const data = await response.json()
      const mappedFriends = ((data.friends || []) as FriendRecord[]).map((entry) => ({
        id: entry.user.id,
        name: entry.user.name || entry.user.email,
        email: entry.user.email,
        image: entry.user.image,
      }))
      setFriends(mappedFriends)
    } catch (error) {
      console.error('Load friends error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFriends()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav />

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Find Mutual Availability
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            See when you and your friends are all free to learn together.
          </p>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400">Loading friends...</p>
          </div>
        ) : (
          <MutualAvailability friends={friends} />
        )}
      </div>
    </main>
  )
}
