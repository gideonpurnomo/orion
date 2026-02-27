'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, ChevronLeft, Loader2 } from 'lucide-react'
import { formatDuration, getDifficultyColor, getDifficultyLabel } from '@/lib/utils'
import SearchBar from '@/components/search-bar'

interface Activity {
  id: string
  title: string
  description: string
  difficulty: number
  duration: number
  tags: string[]
  domain?: {
    id: string
    name: string
    icon?: string
    slug?: string
  }
  category?: {
    id: string
    name: string
  }
}

export default function LibraryPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const domains = [
    { id: 'all', name: 'All Domains', icon: '📚', color: 'from-gray-500 to-gray-600' },
    { id: 'programming', name: 'Programming', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { id: 'music', name: 'Music', icon: '🎸', color: 'from-purple-500 to-pink-500' },
    { id: 'cooking', name: 'Cooking', icon: '🍳', color: 'from-red-500 to-orange-500' },
    { id: 'fitness', name: 'Fitness', icon: '🏋️', color: 'from-green-500 to-emerald-500' },
    { id: 'languages', name: 'Languages', icon: '🌍', color: 'from-amber-500 to-orange-500' },
    { id: 'school', name: 'School Topics', icon: '📖', color: 'from-pink-500 to-rose-500' },
  ]

  const fetchActivities = async (domain: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/activities/search${domain !== 'all' ? `?domain=${domain}` : ''}`)
      const data = await response.json()
      setActivities(data.activities || [])
      setError('')
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(selectedDomain)
  }, [selectedDomain])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Activity Library</h1>
              <p className="text-gray-400">Browse programming, languages, school topics, music, fitness & more</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0" asChild>
              <Link href="/schedule">
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl">
          <SearchBar placeholder="Search activities..." />
        </div>

        {/* Domain Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {domains.map((d) => (
            <Button
              key={d.id}
              variant={selectedDomain === d.id ? 'default' : 'outline'}
              onClick={() => setSelectedDomain(d.id)}
              className={`min-w-fit transition-all duration-300 ${
                selectedDomain === d.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/30'
                  : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
              }`}
            >
              {d.icon} {d.name}
            </Button>
          ))}
        </div>

        {/* Activities Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
              <p className="text-gray-400">Loading activities...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent>
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => fetchActivities(selectedDomain)} variant="outline" className="border-white/20 text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : activities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 hover:bg-white/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getDifficultyColor(activity.difficulty)}>
                      {getDifficultyLabel(activity.difficulty)} - {activity.difficulty}/10
                    </Badge>
                    <div className="flex items-center text-sm text-gray-400 group-hover:text-purple-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(activity.duration)}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-purple-300 transition-colors">
                    {activity.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    {activity.category?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-300 line-clamp-2">{activity.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {activity.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-white/20 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 border-0" size="sm" asChild>
                    <Link href={`/schedule?add=${activity.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Schedule
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent>
              <p className="text-gray-500 mb-2">No activities found in this domain</p>
              <p className="text-sm text-gray-600">Try selecting a different domain or browse all activities</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
