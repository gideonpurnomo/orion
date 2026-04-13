'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar, BookOpen, Plus, Zap, TrendingUp, ChevronRight, Loader2, Trophy } from 'lucide-react'
import { useScheduleStore } from '@/store/schedule'
import { useScheduleData } from '@/hooks/useScheduleData'
import { formatTime, formatDuration } from '@/lib/utils'
import { AIRecommendations } from '@/components/ai-recommendations'

interface DashboardAchievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  xpReward: number
  completedAt: string
}

export default function DashboardPage() {
  useScheduleData()

  const todayItems = useScheduleStore(state => state.getTodayItems())
  const completionRate = useScheduleStore(state => state.getCompletionRate())
  const streak = useScheduleStore(state => state.getStreak())
  const isLoading = useScheduleStore(state => state.isLoading)
  const [achievements, setAchievements] = useState<DashboardAchievement[]>([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/profile/achievements')
        if (response.ok) {
          const data = await response.json()
          setAchievements(data.earned || [])
        }
      } catch {
        // Non-critical
      } finally {
        setAchievementsLoading(false)
      }
    }
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
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-border text-foreground hover:bg-accent" asChild>
              <Link href="/library">
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </Link>
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent" asChild>
              <Link href="/progress">
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border-2 border-primary/30 bg-card backdrop-blur-sm shadow-xl shadow-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5 text-primary" />
                  Today's Progress
                </CardTitle>
                <CardDescription className="text-muted-foreground">Track your daily learning journey</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{completionRate}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-3" />
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-orange-400">&#x1F525;</span> {streak} Day Streak
              </span>
              <span>{totalToday} items planned</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="bg-card backdrop-blur-sm border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Today's Schedule</CardTitle>
                    <CardDescription className="text-muted-foreground">Your learning activities for today</CardDescription>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : todayItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No activities scheduled for today</p>
                    <p className="text-sm text-muted-foreground mb-4">Browse the library and add activities to your schedule</p>
                    <Button asChild variant="outline" className="border-border text-foreground">
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
                        className="group flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{item.activity?.domain?.icon || '&#x1F4DA;'}</div>
                          <div>
                            <div className="font-medium text-foreground">{item.activity?.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {formatTime(item.scheduledFor)}
                              <span>&#x2022;</span>
                              {formatDuration(item.duration || item.activity?.duration || 0)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
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
            <AIRecommendations limit={3} />

            <Card className="bg-card backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed Today</span>
                  <span className="font-semibold text-foreground">
                    {completedToday}/{totalToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Planned</span>
                  <span className="font-semibold text-foreground">
                    {formatDuration(timePlanned)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Domains</span>
                  <span className="font-semibold text-foreground">{activeDomains}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievementsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : achievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Complete activities to earn achievements
                  </p>
                ) : (
                  achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg border border-primary/20 group hover:bg-primary/20 transition-all duration-300">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <div className="font-medium text-sm text-foreground group-hover:text-primary">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground shadow-xl shadow-primary/30">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Explore More</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Discover new learning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full bg-primary-foreground/20 hover:bg-primary-foreground/30 border-0 text-primary-foreground" asChild>
                  <Link href="/library">
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
