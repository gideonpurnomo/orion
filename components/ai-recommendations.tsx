'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Plus, RefreshCw, Brain, Target, Compass, Zap } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export interface Recommendation {
  id: string
  title: string
  description: string | null
  difficulty: number
  duration: number
  domain?: {
    id: string
    name: string
    icon?: string
  }
  category?: {
    id: string
    name: string
  }
  reason: string
  score: number
}

interface AIRecommendationsProps {
  onAdd?: (activityId: string) => void
  limit?: number
}

export function AIRecommendations({ onAdd, limit = 3 }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [type, setType] = useState<'mixed' | 'challenging' | 'similar' | 'variety'>('mixed')

  useEffect(() => {
    fetchRecommendations()
  }, [type])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        type,
      })

      const response = await fetch(`/api/recommendations?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch recommendations')

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Fetch recommendations error:', err)
      setError('Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'challenging': return <Target className="h-4 w-4" />
      case 'similar': return <Brain className="h-4 w-4" />
      case 'variety': return <Compass className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  const getReasonIcon = (reason: string) => {
    if (reason.includes('Level up')) return <Zap className="h-3 w-3 text-amber-500" />
    if (reason.includes('Continue')) return <Brain className="h-3 w-3 text-blue-500" />
    if (reason.includes('Explore')) return <Compass className="h-3 w-3 text-emerald-500" />
    return <Sparkles className="h-3 w-3 text-purple-500" />
  }

  const handleAdd = async (activityId: string) => {
    if (onAdd) {
      await onAdd(activityId)
    } else {
      // Default behavior: navigate to schedule with activity
      window.location.href = `/schedule?add=${activityId}`
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">AI Recommendations</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => void fetchRecommendations()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-purple-200">
          Smart suggestions based on your learning patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Type selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'mixed', label: 'Mix', icon: <Sparkles className="h-3 w-3" /> },
            { value: 'challenging', label: 'Level Up', icon: <Target className="h-3 w-3" /> },
            { value: 'similar', label: 'Continue', icon: <Brain className="h-3 w-3" /> },
            { value: 'variety', label: 'Explore', icon: <Compass className="h-3 w-3" /> },
          ].map(({ value, label, icon }) => (
            <Button
              key={value}
              variant={type === value ? 'default' : 'outline'}
              size="sm"
              className={`${
                type === value
                  ? 'bg-purple-600 hover:bg-purple-700 border-0 text-white'
                  : 'border-purple-400/30 text-purple-200 hover:bg-purple-500/20'
              }`}
              onClick={() => setType(value as any)}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            <span className="ml-2 text-purple-300">Analyzing your learning patterns...</span>
          </div>
        ) : error ? (
          <div className="py-4 text-center text-purple-300">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center text-purple-300">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Complete some activities to get personalized recommendations!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300"
              >
                <div className="text-2xl flex-shrink-0">
                  {activity.domain?.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors">
                      {activity.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0 text-purple-300 hover:text-white hover:bg-purple-600/30"
                      onClick={() => void handleAdd(activity.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-xs text-purple-200">
                    <Badge variant="outline" className="border-purple-400/30 text-purple-200 text-[10px] px-1.5 py-0">
                      {activity.difficulty}/10
                    </Badge>
                    <span>{formatDuration(activity.duration)}</span>
                    {activity.domain && (
                      <span>• {activity.domain.name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full inline-flex">
                    {getReasonIcon(activity.reason)}
                    <span>{activity.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 border-purple-400/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100"
            asChild
          >
            <a href={`/library?source=ai-recommendations`}>
              View All Recommendations
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
