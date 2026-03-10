'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, TrendingUp, BookOpen, Zap, Target } from 'lucide-react'

export interface ScheduleTemplate {
  id: string
  name: string
  type: string
  description: string | null
  intensity: number
  dailyHours: number
  isSystem: boolean
  config: any
}

interface ScheduleTemplatesProps {
  isOpen: boolean
  onClose: () => void
  onApply: (templateId: string, startDate: Date) => Promise<void>
}

function getTemplateIcon(type: string) {
  switch (type) {
    case 'BEGINNER': return <BookOpen className="h-5 w-5 text-emerald-600" />
    case 'BALANCED': return <TrendingUp className="h-5 w-5 text-blue-600" />
    case 'INTENSIVE': return <Zap className="h-5 w-5 text-orange-600" />
    case 'EXPERT': return <Target className="h-5 w-5 text-purple-600" />
    default: return <Sparkles className="h-5 w-5 text-slate-600" />
  }
}

function getTemplateColor(type: string): string {
  switch (type) {
    case 'BEGINNER': return 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
    case 'BALANCED': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
    case 'INTENSIVE': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
    case 'EXPERT': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30'
    default: return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30'
  }
}

function getIntensityBadge(intensity: number) {
  if (intensity <= 2) return { label: 'Light', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' }
  if (intensity <= 3) return { label: 'Moderate', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
  if (intensity <= 4) return { label: 'Heavy', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' }
  return { label: 'Extreme', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }
}

export function ScheduleTemplates({ isOpen, onClose, onApply }: ScheduleTemplatesProps) {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('Fetch templates error:', err)
      setError('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyTemplate = async (templateId: string) => {
    setApplyingId(templateId)
    setError('')

    try {
      // Use Monday of current week as start date
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Get Monday
      startOfWeek.setHours(0, 0, 0, 0)

      await onApply(templateId, startOfWeek)
      onClose()
    } catch (err) {
      console.error('Apply template error:', err)
      setError('Failed to apply template. Please try again.')
    } finally {
      setApplyingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60">
      <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Schedule Templates</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Choose a pre-built schedule to get started</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => {
              const intensityBadge = getIntensityBadge(template.intensity)

              return (
                <Card
                  key={template.id}
                  className={`transition-all hover:shadow-md ${getTemplateColor(template.type)}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon(template.type)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      {template.isSystem && (
                        <Badge variant="outline" className="text-xs">Built-in</Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {template.description || 'A balanced learning schedule'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={intensityBadge.color}>
                        {intensityBadge.label}
                      </Badge>
                      <Badge variant="outline">
                        {template.dailyHours}h/day
                      </Badge>
                      <Badge variant="outline">
                        {template.type}
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {template.type === 'BEGINNER' && 'Perfect for beginners. 1-2 activities per day with light intensity.'}
                      {template.type === 'BALANCED' && 'Well-rounded schedule. 2-3 activities per day with moderate intensity.'}
                      {template.type === 'INTENSIVE' && 'For dedicated learners. 3-5 activities per day with heavy focus.'}
                      {template.type === 'EXPERT' && 'Maximum productivity. 5+ activities per day for serious learners.'}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => void handleApplyTemplate(template.id)}
                      disabled={applyingId === template.id}
                    >
                      {applyingId === template.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        'Apply Template'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}

            {templates.length === 0 && (
              <div className="col-span-2 py-8 text-center text-slate-600 dark:text-slate-400">
                No templates available. Check back later!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
