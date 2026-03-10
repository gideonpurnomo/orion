'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  SkipForward,
  X,
  Sparkles,
  TrendingUp,
  Loader2,
} from 'lucide-react'

interface ActivityCompletionProps {
  isOpen: boolean
  onClose: () => void
  activity: {
    id: string
    title: string
    description?: string
    difficulty: number
    duration: number
    domain?: {
      name: string
      icon?: string
    }
    category?: {
      name: string
    }
  }
  scheduleItemId: string
  onComplete: (notes?: string, actualDuration?: number) => Promise<void>
  onMarkInProgress: () => Promise<void>
  onSkip: () => Promise<void>
}

export default function ActivityCompletion({
  isOpen,
  onClose,
  activity,
  scheduleItemId,
  onComplete,
  onMarkInProgress,
  onSkip,
}: ActivityCompletionProps) {
  const [notes, setNotes] = useState('')
  const [actualDuration, setActualDuration] = useState<number>(activity.duration)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completionResult, setCompletionResult] = useState<{
    xpAwarded?: number
    newXP?: number
    newLevel?: number
    leveledUp?: boolean
    achievements?: any[]
  } | null>(null)

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      const result = await onComplete(notes || undefined, actualDuration)
      setCompletionResult(result)

      // Show result for 3 seconds then close
      setTimeout(() => {
        setCompletionResult(null)
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Complete error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInProgress = async () => {
    setIsSubmitting(true)
    try {
      await onMarkInProgress()
      onClose()
    } catch (error) {
      console.error('Mark in progress error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      await onSkip()
      onClose()
    } catch (error) {
      console.error('Skip error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-50'
    if (level <= 6) return 'text-yellow-600 bg-yellow-50'
    if (level <= 8) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Beginner'
    if (level <= 6) return 'Intermediate'
    if (level <= 8) return 'Advanced'
    return 'Expert'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-800">
        {completionResult ? (
          // XP Reward Popup
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-center">
                <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
                <span className="text-green-600">
                  {completionResult.leveledUp ? 'Level Up!' : 'Activity Complete!'}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-6 text-center">
              {completionResult.leveledUp && (
                <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-2xl font-bold mb-1">Level {completionResult.newLevel}</div>
                  <div className="text-purple-100">
                    {completionResult.achievements?.[0]?.title || 'New Achievement Unlocked!'}
                  </div>
                </div>
              )}

              {!completionResult.leveledUp && (
                <div className="rounded-lg bg-green-50 border-2 border-green-200 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    +{completionResult.xpAwarded} XP
                  </div>
                  <div className="text-sm text-slate-600">
                    New Total XP: {completionResult.newXP?.toLocaleString()}
                  </div>
                </div>
              )}

              {completionResult.achievements && completionResult.achievements.length > 0 && (
                <div className="rounded-lg bg-yellow-50 border-2 border-yellow-200 p-4">
                  <div className="text-lg font-semibold text-yellow-800 mb-3 flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Achievement Unlocked!
                  </div>
                  <div className="space-y-2">
                    {completionResult.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <div className="font-medium text-slate-900">{achievement.title}</div>
                          <div className="text-sm text-slate-600">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={onClose} className="w-full">
                Awesome!
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Completion Options
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    {activity.domain?.icon || '📚'}
                    {activity.title}
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(activity.difficulty)}>
                        {getDifficultyLabel(activity.difficulty)} - {activity.difficulty}/10
                      </Badge>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {activity.duration} min
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Notes Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any reflections, learnings, or notes about this session..."
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  rows={3}
                />
              </div>

              {/* Actual Duration Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Actual Duration (minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="1440"
                    className="w-24 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActualDuration(activity.duration)}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Planned: {activity.duration} min
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button
                onClick={handleInProgress}
                disabled={isSubmitting}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-950/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Circle className="mr-2 h-4 w-4" />
                    Mark In Progress
                  </>
                )}
              </Button>

              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </>
                )}
              </Button>

              <Button
                onClick={handleSkip}
                disabled={isSubmitting}
                variant="outline"
                className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skipping...
                  </>
                ) : (
                  <>
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
