'use client'

import React from 'react'
import { PomodoroTimer, PomodoroSession } from '@/components/pomodoro-timer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Coffee, Zap, Target, Flame, Trophy } from 'lucide-react'

export default function PomodoroPage() {
  const handleComplete = async (session: PomodoroSession) => {
    if (session.type === 'focus') {
      try {
        await fetch('/api/completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduleItemId: `pomodoro-${session.id}`,
            notes: `Pomodoro focus session (${session.duration} min)`,
            actualDuration: session.duration,
            isPomodoro: true,
          }),
        })
      } catch {
        // Non-critical — session tracked locally in timer UI
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950/30 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            🍅 Pomodoro Timer
          </h1>
          <p className="text-lg text-slate-400">
            Focus better, work smarter with the Pomodoro technique
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <PomodoroTimer onComplete={handleComplete} />
          </div>

          {/* Info Cards */}
          <div className="space-y-6">
            {/* How it works */}
            <Card className="border-orange-800 bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">1</div>
                  <p>Work for 25 minutes with complete focus</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</div>
                  <p>Take a 5-minute short break</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">3</div>
                  <p>Repeat. After 4 pomodoros, take a 15-minute long break</p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-amber-800 bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">Better time management</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span className="text-sm">Improved focus & concentration</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm">Reduced burnout</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Trophy className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm">Achievable goals</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-emerald-800 bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-emerald-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-400">
                <p>🎯 Set clear goals for each focus session</p>
                <p>📵 Turn off notifications during focus time</p>
                <p>🚶 Use breaks to stretch and hydrate</p>
                <p>🎧 Play focus music or work in silence</p>
                <p>📊 Track your daily session count</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
