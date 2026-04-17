'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, TrendingUp, Users, Award } from 'lucide-react'

type LeaderboardType = 'global' | 'domain' | 'weekly'

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  image?: string
  xp: number
  level: number
  rank: number
  achievementCount: number
}

export default function Leaderboard() {
  const [type, setType] = useState<LeaderboardType>('global')
  const [data, setData] = useState<{
    leaderboard: LeaderboardEntry[]
    weeklyChampion: any | null
    total: number
    hasMore: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/leaderboards?type=${type}`)
        const result = await response.json()

        setData(result)

        // Find current user's rank
        // This would require passing user ID, for now mock
        setCurrentUserRank(null)
      } catch (err) {
        console.error('Fetch leaderboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [type])

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-900/50 text-yellow-400 border-yellow-700'
    if (rank <= 3) return 'bg-slate-800 text-slate-300 border-slate-700'
    if (rank <= 10) return 'bg-orange-900/50 text-orange-400 border-orange-700'
    if (rank <= 50) return 'bg-purple-900/50 text-purple-400 border-purple-700'
    return 'bg-slate-900 text-slate-400 border-slate-700'
  }

  const getLevelBadgeColor = (level: number) => {
    if (level >= 30) return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
    if (level >= 20) return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
    if (level >= 10) return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
    if (level >= 5) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
    return 'bg-slate-800 text-slate-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-100">Leaderboards</h1>
            <p className="text-slate-300">
              {data?.weeklyChampion ? 'Current Week Champion' : 'Global Rankings'}
            </p>
          </div>
        </div>
      </div>

      {/* Week Champion Banner */}
      {data?.weeklyChampion && (
        <div className="mx-auto max-w-4xl -mt-4 px-6 py-6">
          <div className="rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-8 text-center text-white shadow-2xl">
            <div className="text-6xl mb-2">👑</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">This Week's Champion</h2>
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  {data.weeklyChampion.image ? '👤' : '👤'}
                </div>
                <div className="text-left">
                  <p className="text-xl font-semibold">{data.weeklyChampion.name}</p>
                  <p className="text-orange-200">Level {data.weeklyChampion.level || '?'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Type Tabs */}
        <div className="mb-6 flex justify-center gap-2">
          <Button
            variant={type === 'global' ? 'default' : 'outline'}
            onClick={() => setType('global')}
            className={type === 'global' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Global
          </Button>
          <Button
            variant={type === 'domain' ? 'default' : 'outline'}
            onClick={() => setType('domain')}
            className={type === 'domain' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Users className="h-4 w-4 mr-2" />
            By Domain
          </Button>
          <Button
            variant={type === 'weekly' ? 'default' : 'outline'}
            onClick={() => setType('weekly')}
            className={type === 'weekly' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            <Award className="h-4 w-4 mr-2" />
            Weekly
          </Button>
        </div>

        {/* Leaderboard Card */}
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">Top Learners</CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-slate-300">
                  {data?.total || 0} learners
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-700 bg-slate-700/50 text-xs font-semibold text-slate-400">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Learner</div>
                  <div className="col-span-2">Level</div>
                  <div className="col-span-2 text-right">XP</div>
                  <div className="col-span-1">Rank</div>
                </div>

                {/* Data Rows */}
                {data?.leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm transition-colors ${
                      currentUserRank === entry.rank ? 'bg-purple-900/30' : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`col-span-1 flex items-center justify-center font-bold text-lg ${getRankColor(entry.rank)}`}>
                      #{entry.rank}
                    </div>
                    <div className="col-span-6 flex items-center gap-3">
                      {entry.image ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                          {entry.name[0]}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-400">
                          <Users className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-100">{entry.name}</p>
                        <p className="text-xs text-slate-400">
                          {entry.achievementCount} achievements
                        </p>
                      </div>
                    </div>
                    <div className={`col-span-2 flex items-center justify-center rounded-lg px-2 py-1 font-bold text-xs ${getLevelBadgeColor(entry.level)}`}>
                      L{entry.level}
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-bold text-purple-400">
                        {entry.xp.toLocaleString()}
                      </p>
                    </div>
                    <div className={`col-span-1 flex items-center justify-center ${getRankColor(entry.rank)} rounded px-2 py-1`}>
                      {entry.rank <= 3 && '🏆'}
                      {entry.rank > 3 && entry.rank <= 10 && '⭐'}
                      {entry.rank > 10 && '📊'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {data?.hasMore && (
              <div className="border-t border-slate-700 p-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => alert('Load more functionality coming soon!')}
                  className="w-full"
                >
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
