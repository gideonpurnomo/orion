'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LevelBadge } from '@/components/level-badge'
import { Calendar, BookOpen, Plus, Zap, ChevronRight, Loader2 } from 'lucide-react'
import { useScheduleStore } from '@/store/schedule'
import { useScheduleData } from '@/hooks/useScheduleData'
import { formatTime, formatDuration } from '@/lib/utils'
import TopNav from '@/components/top-nav'
import type { LevelInfo } from '@/lib/xp'

export default function DashboardPage() {
  useScheduleData()

  const todayItems = useScheduleStore(state => state.getTodayItems())
  const completionRate = useScheduleStore(state => state.getCompletionRate())
  const streak = useScheduleStore(state => state.getStreak())
  const isLoading = useScheduleStore(state => state.isLoading)

  const [userStats, setUserStats] = useState<{
    xp: number
    formattedXP: string
    level: number
    levelInfo: LevelInfo
    progressToNext: number
  } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [achievements, setAchievements] = useState<{
    earned: any[]
    available: any[]
    newAchievements: any[]
    earnedCount: number
    total: number
  }>({ earned: [], available: [], newAchievements: [], earnedCount: 0, total: 0 })
  const [achievementsLoading, setAchievementsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/profile/stats')
        const data = await response.json()
        setUserStats(data)
      } catch (err) {
        console.error('Fetch stats error:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/profile/achievements')
        const data = await response.json()
        setAchievements(data)

        // Show notification for new achievements
        if (data.newAchievements && data.newAchievements.length > 0) {
          data.newAchievements.forEach((achievement: any) => {
            // Show confetti or notification
            setTimeout(() => {
              alert(`🎉 Achievement Unlocked: ${achievement.title}\n+${achievement.xpReward} XP`)
            }, 500)
          })
        }
      } catch (err) {
        console.error('Fetch achievements error:', err)
      } finally {
        setAchievementsLoading(false)
      }
    }

    fetchStats()
    fetchAchievements()
  }, [])

  // Calculate real quick stats
  const completedToday = todayItems.filter(item => item.status === 'COMPLETED').length
  const totalToday = todayItems.length
  const timePlanned = todayItems.reduce((sum, item) => sum + (item.duration || item.activity?.duration || 0), 0)
  const activeDomains = new Set(todayItems.map(item => item.activity?.domain?.name)).size

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PLANNED': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'SKIPPED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      })

      if (response.ok) {
        // Refresh stats after completing
        if (newStatus === 'COMPLETED') {
          const statsResponse = await fetch('/api/profile/stats')
          const statsData = await statsResponse.json()
          setUserStats(statsData)
        }
        // Reload schedule to update UI
        window.location.reload()
      }
    } catch (err) {
      console.error('Update status error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-100 to-lime-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav theme="green" />
      <div className="container mx-auto px-4 py-8">
        {/* Level Badge */}
        {userStats && !statsLoading && (
          <div className="mb-6">
            <LevelBadge
              levelInfo={userStats.levelInfo}
              progressToNext={userStats.progressToNext}
              xp={userStats.xp}
              formattedXP={userStats.formattedXP}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800" asChild>
              <Link href="/library">
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0" asChild>
              <Link href="/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border border-emerald-200 bg-white shadow-sm dark:border-emerald-900 dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  Today's Progress
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Track your daily learning journey</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">{completionRate}%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-3" />
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <span className="text-orange-500">🔥</span> {streak} Day Streak
              </span>
              <span>{totalToday} items planned</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-100">Today's Schedule</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Your learning activities for today</CardDescription>
                  </div>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 border-0" asChild>
                    <Link href="/library?next=/schedule">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                  </div>
                ) : todayItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">No activities scheduled for today</p>
                    <p className="text-sm text-slate-500 mb-4">Browse the library and add activities to your schedule</p>
                    <Button asChild variant="outline" className="border-slate-300 text-slate-700">
                      <Link href="/library?next=/schedule">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Activities
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 hover:scale-[1.01]"
                      >
                      <div className="flex items-center gap-4">
                          <div className="text-2xl">{item.activity?.domain?.icon || '📚'}</div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{item.activity?.title}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {formatTime(item.scheduledFor)}
                              <span>•</span>
                              {formatDuration(item.duration || item.activity?.duration || 0)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'PLANNED' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                              className="bg-blue-500 hover:bg-blue-600 border-0"
                            >
                              Start
                            </Button>
                          )}
                          {item.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                              className="bg-green-500 hover:bg-green-600 border-0"
                            >
                              Complete
                            </Button>
                          )}
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          {item.status === 'COMPLETED' && (
                            <div className="text-2xl text-green-500">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Completed Today</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {completedToday}/{totalToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Time Planned</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDuration(timePlanned)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Active Domains</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{activeDomains}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Achievements</CardTitle>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {achievements.earnedCount}/{achievements.total} Unlocked
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievementsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                  </div>
                ) : achievements.earned.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm">Complete activities to unlock achievements!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Earned achievements */}
                    {achievements.earned.slice(0, 3).map((achievement: any) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg border border-yellow-200 shadow-sm dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-yellow-700/50">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{achievement.title}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-300">{achievement.description}</div>
                        </div>
                        <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">+{achievement.xpReward} XP</div>
                      </div>
                    ))}

                    {/* Available achievements (hint what's next) */}
                    {achievements.available.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                          🎯 Next Achievements:
                        </p>
                        {achievements.available.slice(0, 3).map((achievement: any) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-75 dark:bg-slate-700/50 dark:border-slate-600">
                            <div className="text-2xl opacity-50">{achievement.icon}</div>
                            <div className="flex-1 opacity-75">
                              <div className="font-medium text-sm text-slate-700 dark:text-slate-300">{achievement.title}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{achievement.description}</div>
                            </div>
                            <div className="text-xs font-semibold text-slate-400">+{achievement.xpReward} XP</div>
                          </div>
                        ))}
                        {achievements.available.length > 3 && (
                          <p className="text-xs text-slate-400 mt-2">
                            +{achievements.available.length - 3} more...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-white">Explore More</CardTitle>
                <CardDescription className="text-emerald-100">
                  Discover new learning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full bg-white text-slate-900 hover:bg-slate-100 border-0" asChild>
                  <Link href="/library?next=/schedule">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Library
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
