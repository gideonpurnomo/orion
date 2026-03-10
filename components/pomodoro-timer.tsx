'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Coffee, Zap, Clock, CheckCircle2, X } from 'lucide-react'

export interface PomodoroSession {
  id: string
  type: 'focus' | 'shortBreak' | 'longBreak'
  duration: number
  completedAt: Date
}

interface PomodoroTimerProps {
  initialMinutes?: number
  onComplete?: (session: PomodoroSession) => void
  onCancel?: () => void
}

const DURATIONS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
}

export function PomodoroTimer({ initialMinutes = 25, onComplete, onCancel }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [showComplete, setShowComplete] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startTimer = useCallback(() => {
    setIsActive(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setMinutes(DURATIONS[sessionType])
    setSeconds(0)
  }, [sessionType])

  const switchType = useCallback((type: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsActive(false)
    setSessionType(type)
    setMinutes(DURATIONS[type])
    setSeconds(0)
  }, [])

  const playSound = useCallback(() => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds > 0) {
            return prevSeconds - 1
          } else if (minutes > 0) {
            setMinutes(prevMinutes => prevMinutes - 1)
            return 59
          } else {
            // Timer completed
            setIsActive(false)
            playSound()
            setShowComplete(true)

            // Save session
            const newSession: PomodoroSession = {
              id: Date.now().toString(),
              type: sessionType,
              duration: DURATIONS[sessionType],
              completedAt: new Date(),
            }
            setSessions(prev => [...prev, newSession])

            if (onComplete) {
              onComplete(newSession)
            }

            return 0
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, minutes, seconds, sessionType, playSound, onComplete])

  useEffect(() => {
    // Update document title with timer
    if (isActive) {
      document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - Pomodoro | Orion`
    } else {
      document.title = 'Pomodoro Timer | Orion'
    }

    return () => {
      document.title = 'Orion'
    }
  }, [minutes, seconds, isActive])

  const handleCompleteDismiss = () => {
    setShowComplete(false)

    // Auto-switch to next session type
    if (sessionType === 'focus') {
      const completedFocusSessions = sessions.filter(s => s.type === 'focus').length + 1
      if (completedFocusSessions % 4 === 0) {
        switchType('longBreak')
      } else {
        switchType('shortBreak')
      }
    } else {
      switchType('focus')
    }
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'focus': return <Zap className="h-5 w-5 text-orange-500" />
      case 'shortBreak': return <Coffee className="h-5 w-5 text-emerald-500" />
      case 'longBreak': return <Coffee className="h-5 w-5 text-blue-500" />
    }
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus': return 'from-orange-500 to-amber-600'
      case 'shortBreak': return 'from-emerald-500 to-teal-600'
      case 'longBreak': return 'from-blue-500 to-indigo-600'
    }
  }

  const getSessionTitle = () => {
    switch (sessionType) {
      case 'focus': return 'Focus Session'
      case 'shortBreak': return 'Short Break'
      case 'longBreak': return 'Long Break'
    }
  }

  const getSessionDescription = () => {
    switch (sessionType) {
      case 'focus': return 'Stay focused and complete your tasks'
      case 'shortBreak': return 'Take a quick breather'
      case 'longBreak': return 'Relax and recharge your energy'
    }
  }

  const progressPercentage = ((DURATIONS[sessionType] * 60 - (minutes * 60 + seconds)) / (DURATIONS[sessionType] * 60)) * 100

  return (
    <>
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl dark:bg-slate-800">
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-2" />
              <CardTitle className="text-2xl">Session Complete!</CardTitle>
              <CardDescription>
                {sessionType === 'focus'
                  ? 'Great job! Time for a break.'
                  : 'Break over! Ready to focus again?'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleCompleteDismiss} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0">
                {sessionType === 'focus' ? 'Start Break' : 'Start Focus Session'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowComplete(false)}
                className="w-full border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className={`border-2 bg-gradient-to-br ${getSessionColor()} bg-opacity-10 text-white shadow-xl`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getSessionIcon()}
              <div>
                <CardTitle className="text-white">{getSessionTitle()}</CardTitle>
                <CardDescription className="text-white/80">{getSessionDescription()}</CardDescription>
              </div>
            </div>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Timer Display */}
          <div className="mb-8 text-center">
            <div className="text-8xl font-bold tabular-nums tracking-tight text-white drop-shadow-lg">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 mx-auto max-w-md">
              <div className="h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {isActive ? (
              <Button
                onClick={pauseTimer}
                size="lg"
                className="h-16 w-16 rounded-full bg-white/20 border-2 border-white hover:bg-white/30 backdrop-blur-sm transition-all"
              >
                <Pause className="h-6 w-6 text-white" />
              </Button>
            ) : (
              <Button
                onClick={startTimer}
                size="lg"
                className="h-16 w-16 rounded-full bg-white text-slate-900 hover:bg-white/90 border-2 border-white shadow-lg transition-all"
              >
                <Play className="h-6 w-6 ml-1" />
              </Button>
            )}

            <Button
              onClick={resetTimer}
              size="lg"
              variant="ghost"
              className="h-16 w-16 rounded-full border-2 border-white/30 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* Session Type Switcher */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { type: 'focus', label: 'Focus', icon: <Zap className="h-4 w-4" />, minutes: DURATIONS.focus },
              { type: 'shortBreak', label: 'Short', icon: <Coffee className="h-4 w-4" />, minutes: DURATIONS.shortBreak },
              { type: 'longBreak', label: 'Long', icon: <Coffee className="h-4 w-4" />, minutes: DURATIONS.longBreak },
            ].map(({ type, label, icon, minutes: typeMinutes }) => (
              <Button
                key={type}
                variant={sessionType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchType(type as any)}
                className={`${
                  sessionType === type
                    ? 'bg-white text-slate-900 border-0'
                    : 'border-white/30 text-white/80 hover:bg-white/20'
                }`}
              >
                <span className="mr-1">{icon}</span>
                {label}
                <span className="ml-1 text-xs opacity-75">({typeMinutes}m)</span>
              </Button>
            ))}
          </div>

          {/* Session History */}
          {sessions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm text-white/80 mb-3">
                <Clock className="h-4 w-4" />
                <span>Today's Sessions: {sessions.length}</span>
                <span className="text-white/60">
                  ({sessions.filter(s => s.type === 'focus').length} focus • {sessions.filter(s => s.type !== 'focus').length} breaks)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
