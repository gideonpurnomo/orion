'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import TopNav from '@/components/top-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Challenge {
  id: string
  title: string
  description: string | null
  type: 'XP_COLLECTED' | 'ACTIVITIES_COMPLETED' | 'STREAK_HIGHEST' | 'DOMAIN_MASTERY'
  domainId: string | null
  domain: { id: string; name: string; icon: string | null } | null
  startDate: string
  endDate: string
  participantCount: number
  isJoined: boolean
  myParticipation: { score: number; rank: number | null } | null
}

const typeLabel: Record<Challenge['type'], string> = {
  XP_COLLECTED: 'XP Collected',
  ACTIVITIES_COMPLETED: 'Activities Completed',
  STREAK_HIGHEST: 'Highest Streak',
  DOMAIN_MASTERY: 'Domain Mastery',
}

export default function ChallengesPage() {
  const [scope, setScope] = useState<'active' | 'upcoming' | 'completed' | 'all'>('active')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const fetchChallenges = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/challenges?scope=${scope}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to fetch challenges')
      setChallenges(data.challenges || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to fetch challenges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [scope])

  const handleJoinLeave = async (challenge: Challenge) => {
    setActionId(challenge.id)
    setMessage('')
    try {
      const path = challenge.isJoined ? 'leave' : 'join'
      const response = await fetch(`/api/challenges/${challenge.id}/${path}`, { method: 'POST' })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || `Failed to ${path} challenge`)
      await fetchChallenges()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update participation')
    } finally {
      setActionId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav theme="blue" />

      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Challenges</h1>
            <p className="text-slate-600 dark:text-slate-300">Compete with others and climb the rankings.</p>
          </div>
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-700">
            <Link href="/challenges/new">Create Challenge</Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['active', 'upcoming', 'completed', 'all'] as const).map((value) => (
            <Button
              key={value}
              variant={scope === value ? 'default' : 'outline'}
              onClick={() => setScope(value)}
              className={scope === value ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </Button>
          ))}
        </div>

        {message && (
          <p className="mb-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-slate-600 dark:text-slate-300">Loading challenges...</p>
        ) : challenges.length === 0 ? (
          <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="py-10 text-center text-slate-600 dark:text-slate-300">
              No challenges found in this scope.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-slate-100">{challenge.title}</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">{challenge.description || 'No description'}</CardDescription>
                    </div>
                    <Badge>{typeLabel[challenge.type]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                  </p>
                  <p>{challenge.participantCount} participants</p>
                  {challenge.domain && <p>{challenge.domain.icon || ''} {challenge.domain.name}</p>}
                  {challenge.myParticipation && <p>Your score: {challenge.myParticipation.score}</p>}
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/challenges/${challenge.id}`}>View Details</Link>
                    </Button>
                    <Button
                      onClick={() => handleJoinLeave(challenge)}
                      disabled={actionId === challenge.id}
                      className={challenge.isJoined ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                    >
                      {actionId === challenge.id ? 'Working...' : challenge.isJoined ? 'Leave' : 'Join'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
