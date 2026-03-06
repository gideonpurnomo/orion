'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopNav from '@/components/top-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ChallengeDetail {
  challenge: {
    id: string
    title: string
    description: string | null
    type: 'XP_COLLECTED' | 'ACTIVITIES_COMPLETED' | 'STREAK_HIGHEST' | 'DOMAIN_MASTERY'
    startDate: string
    endDate: string
  }
  leaderboard: {
    id: string
    userId: string
    score: number
    rank: number
    medal: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
      level: number
      xp: number
    }
  }[]
  participantCount: number
  isJoined: boolean
  myRank: { rank: number; score: number } | null
  canJoin: boolean
  canLeave: boolean
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED'
}

const typeLabel: Record<ChallengeDetail['challenge']['type'], string> = {
  XP_COLLECTED: 'XP Collected',
  ACTIVITIES_COMPLETED: 'Activities Completed',
  STREAK_HIGHEST: 'Highest Streak',
  DOMAIN_MASTERY: 'Domain Mastery',
}

export default function ChallengeDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<ChallengeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchDetails = async () => {
    if (!params?.id) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/challenges/${params.id}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || 'Failed to load challenge')
      setData(result)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [params?.id])

  const statusTone = useMemo(() => {
    if (!data) return 'bg-slate-200 text-slate-700'
    if (data.status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700'
    if (data.status === 'UPCOMING') return 'bg-blue-100 text-blue-700'
    return 'bg-slate-200 text-slate-700'
  }, [data])

  const joinLeave = async (action: 'join' | 'leave') => {
    if (!params?.id) return
    setActionLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/challenges/${params.id}/${action}`, { method: 'POST' })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || `Failed to ${action} challenge`)
      await fetchDetails()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update participation')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav theme="blue" />

      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/challenges')}>Back</Button>
          <Button asChild variant="outline">
            <Link href="/challenges/new">New Challenge</Link>
          </Button>
        </div>

        {message && (
          <p className="mb-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {message}
          </p>
        )}

        {loading || !data ? (
          <p className="text-slate-600 dark:text-slate-300">Loading challenge...</p>
        ) : (
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-100">{data.challenge.title}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">{data.challenge.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{typeLabel[data.challenge.type]}</Badge>
                    <Badge className={statusTone}>{data.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  {new Date(data.challenge.startDate).toLocaleString()} - {new Date(data.challenge.endDate).toLocaleString()}
                </p>
                <p>{data.participantCount} participants</p>
                {data.myRank ? <p>Your rank: #{data.myRank.rank} • Score: {data.myRank.score}</p> : <p>You have not joined this challenge.</p>}
                <div className="flex gap-2">
                  {data.canJoin && (
                    <Button disabled={actionLoading} onClick={() => joinLeave('join')} className="bg-emerald-600 hover:bg-emerald-700">
                      {actionLoading ? 'Working...' : 'Join Challenge'}
                    </Button>
                  )}
                  {data.canLeave && (
                    <Button disabled={actionLoading} onClick={() => joinLeave('leave')} className="bg-red-600 hover:bg-red-700">
                      {actionLoading ? 'Working...' : 'Leave Challenge'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Rankings for this challenge</CardDescription>
              </CardHeader>
              <CardContent>
                {data.leaderboard.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-300">No participants yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          <th className="px-2 py-2">Rank</th>
                          <th className="px-2 py-2">Participant</th>
                          <th className="px-2 py-2">Score</th>
                          <th className="px-2 py-2">Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.leaderboard.map((entry) => (
                          <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-700">
                            <td className="px-2 py-2 font-semibold">
                              {entry.medal ? `${entry.medal} #${entry.rank}` : `#${entry.rank}`}
                            </td>
                            <td className="px-2 py-2">
                              {entry.user.name || entry.user.email}
                            </td>
                            <td className="px-2 py-2">{entry.score}</td>
                            <td className="px-2 py-2">L{entry.user.level}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
