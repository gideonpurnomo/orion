'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar, BookOpen, Plus, Zap, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'
import { useScheduleStore } from '@/store/schedule'
import { useScheduleData } from '@/hooks/useScheduleData'
import { formatTime, formatDuration } from '@/lib/utils'

export default function DashboardPage() {
  useScheduleData()

  const todayItems = useScheduleStore(state => state.getTodayItems())
  const completionRate = useScheduleStore(state => state.getCompletionRate())
  const streak = useScheduleStore(state => state.getStreak())
  const isLoading = useScheduleStore(state => state.isLoading)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/library">
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0" asChild>
              <Link href="/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border-2 border-purple-500/30 bg-white/5 backdrop-blur-sm shadow-xl shadow-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Today's Progress
                </CardTitle>
                <CardDescription className="text-gray-400">Track your daily learning journey</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-400">{completionRate}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-3" />
            <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <span className="text-orange-400">🔥</span> {streak} Day Streak
              </span>
              <span>{totalToday} items planned</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Today's Schedule</CardTitle>
                    <CardDescription className="text-gray-400">Your learning activities for today</CardDescription>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  </div>
                ) : todayItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">No activities scheduled for today</p>
                    <p className="text-sm text-gray-500 mb-4">Browse the library and add activities to your schedule</p>
                    <Button asChild variant="outline" className="border-white/20 text-white">
                      <Link href="/library">
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
                        className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{item.activity?.domain?.icon || '📚'}</div>
                          <div>
                            <div className="font-medium text-white">{item.activity?.title}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {formatTime(item.scheduledFor)}
                              <span>•</span>
                              {formatDuration(item.duration || item.activity?.duration || 0)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
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
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Completed Today</span>
                  <span className="font-semibold text-white">
                    {completedToday}/{totalToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time Planned</span>
                  <span className="font-semibold text-white">
                    {formatDuration(timePlanned)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Domains</span>
                  <span className="font-semibold text-white">{activeDomains}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 group hover:bg-yellow-500/20 transition-all duration-300">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <div className="font-medium text-sm text-white group-hover:text-yellow-300">First Week</div>
                    <div className="text-xs text-gray-400">Complete your first week</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 group hover:bg-purple-500/20 transition-all duration-300">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <div className="font-medium text-sm text-white group-hover:text-purple-300">Code Master</div>
                    <div className="text-xs text-gray-400">Complete 10 coding activities</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-pink-500/10 rounded-lg border border-pink-500/20 group hover:bg-pink-500/20 transition-all duration-300">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <div className="font-medium text-sm text-white group-hover:text-pink-300">3-Day Streak</div>
                    <div className="text-xs text-gray-400">3 days in a row</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Explore More</CardTitle>
                <CardDescription className="text-purple-100">
                  Discover new learning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 border-0 text-white" asChild>
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
