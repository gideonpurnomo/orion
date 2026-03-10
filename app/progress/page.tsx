'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  TrendingUp,
  Flame,
  Award,
  Clock,
  Activity,
  Zap,
  Loader2,
  ArrowRight,
  Trophy,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import TopNav from '@/components/top-nav'
import { LevelBadge } from '@/components/level-badge'
import { formatDuration } from '@/lib/utils'

// Recharts imports
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DailyStats {
  date: string
  completed: number
}

interface RecentActivity {
  id: string
  scheduledFor: string
  actualDuration?: number
  status: string
  activity: {
    id: string
    title: string
    duration?: number
    domain?: {
      name: string
      icon?: string
    }
    category?: {
      name: string
    }
  }
}

interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  completedAt: string
}

interface DomainStat {
  domain: string
  domainIcon: string
  count: number
}

interface ProgressData {
  user: {
    xp: number
    level: number
    levelInfo: {
      level: number
      xpRequired: number
      title: string
      badge: string
    }
    progressToNext: number
  }
  counts: {
    today: number
    week: number
    month: number
    total: number
  }
  streak: {
    current: number
    longest: number
  }
  domainBreakdown: DomainStat[]
  dailyStats: DailyStats[]
  recentActivities: RecentActivity[]
  achievements: Achievement[]
}

const DOMAIN_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1',
  '#d0ed57', '#ffc658', '#ff7c7f', '#00b8d4',
]

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/progress')
        if (response.status === 401) {
          setError('Please sign in to view your progress')
          return
        }
        if (!response.ok) throw new Error('Failed to fetch progress')

        const result = await response.json()
        setData(result)
        setError('')
      } catch (err) {
        console.error('Fetch progress error:', err)
        setError('Failed to load progress data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const chartData = useMemo(() => {
    if (!data) return []
    return data.dailyStats.map(d => ({
      name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: d.completed,
    }))
  }, [data])

  const domainChartData = useMemo(() => {
    if (!data) return []
    return data.domainBreakdown.map(d => ({
      name: d.domain,
      value: d.count,
      icon: d.domainIcon,
    }))
  }, [data])

  const sortedAchievements = useMemo(() => {
    if (!data) return []
    return [...data.achievements].sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
  }, [data])

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <TopNav theme="dark" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <TopNav theme="dark" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md text-center bg-white/10 border-white/20">
            <CardContent className="pt-6">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <TopNav theme="dark" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Progress & Analytics</h1>
          <p className="text-purple-200">Track your learning journey and achievements</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.user.xp.toLocaleString()}</div>
              <p className="text-sm text-purple-200">Level {data.user.level}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Flame className="h-4 w-4 text-orange-400" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.streak.current} days</div>
              <p className="text-sm text-purple-200">Best: {data.streak.longest} days</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Calendar className="h-4 w-4 text-blue-400" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.counts.week}</div>
              <p className="text-sm text-purple-200">Activities completed</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Target className="h-4 w-4 text-green-400" />
                All Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.counts.total}</div>
              <p className="text-sm text-purple-200">Total activities</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Level Progress */}
          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Level Progress</CardTitle>
              <CardDescription className="text-purple-200">XP to next level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <LevelBadge
                  levelInfo={data.user.levelInfo}
                  progressToNext={data.user.progressToNext}
                  xp={data.user.xp}
                  formattedXP={data.user.xp.toLocaleString()}
                />
                <div>
                  <div className="text-lg font-semibold text-white">{data.user.levelInfo.title}</div>
                  <div className="text-sm text-purple-200">Level {data.user.level}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Activity Chart */}
          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Daily Activity
              </CardTitle>
              <CardDescription className="text-purple-200">Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#d1d5db', fontSize: 12 }}
                    stroke="#d1d5db"
                  />
                  <YAxis
                    tick={{ fill: '#d1d5db', fontSize: 12 }}
                    stroke="#d1d5db"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(88, 28, 135, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="completed" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mt-6 lg:grid-cols-2">
          {/* Domain Breakdown */}
          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChartIcon className="h-5 w-5 text-purple-400" />
                Domain Breakdown
              </CardTitle>
              <CardDescription className="text-purple-200">Activities by learning domain</CardDescription>
            </CardHeader>
            <CardContent>
              {domainChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={domainChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value, icon }) => `${icon} ${value}`}
                      labelLine={false}
                    >
                      {domainChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(88, 28, 135, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => `${value} activities`}
                    />
                  </RechartsPieChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <p className="text-purple-200">No data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-purple-500/30 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-yellow-400" />
                Achievements
              </CardTitle>
              <CardDescription className="text-purple-200">
                {sortedAchievements.length} unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedAchievements.length > 0 ? (
                <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
                  {sortedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/20"
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{achievement.title}</div>
                        <div className="text-sm text-purple-200">{achievement.description}</div>
                        <div className="text-xs text-purple-300 mt-1">
                          {new Date(achievement.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <p className="text-purple-200">Complete activities to earn achievements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card className="mt-6 border-purple-500/30 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-purple-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-purple-200">Your completed activities</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-purple-500/20 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {item.activity?.domain?.icon || '📚'}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {item.activity?.title || 'Untitled Activity'}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-purple-200">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.scheduledFor).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {formatDuration(item.actualDuration || item.activity?.duration || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            {item.activity?.category?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getActivityStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-purple-200 mb-4">No completed activities yet</p>
                <Button className="bg-purple-600 text-white hover:bg-purple-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6 border-2 border-purple-500/50 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Keep the momentum going!</h3>
                <p className="text-purple-200">Add more activities to your schedule</p>
              </div>
              <div className="flex gap-3">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0" asChild>
                  <a href="/library">
                    <Zap className="h-4 w-4 mr-2" />
                    Browse Library
                  </a>
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0" asChild>
                  <a href="/schedule">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Schedule
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
