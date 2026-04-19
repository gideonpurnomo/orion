'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import { formatDuration, getDifficultyColor, getDifficultyLabel } from '@/lib/utils'
import TopNav from '@/components/top-nav'
import DomainExplorer from '@/components/library/domain-explorer'

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

interface DomainTab {
  id: string
  name: string
  icon?: string
  slug?: string
  _count?: {
    activities: number
    categories: number
  }
}

interface ExplorerCategory {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  activities: {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: number
    duration: number
    tags: string[]
  }[]
}

interface ExplorerDomain {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  color: string | null
  categories: ExplorerCategory[]
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function LibraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()

  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [domains, setDomains] = useState<DomainTab[]>([
    { id: 'all', name: 'All Domains', icon: '📚', slug: 'all' }
  ])

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [explorerDomains, setExplorerDomains] = useState<ExplorerDomain[]>([])

  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [maxDifficulty, setMaxDifficulty] = useState<string>('all')
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'difficulty-asc' | 'difficulty-desc' | 'duration-asc' | 'duration-desc' | 'title-asc'>('relevance')

  const nextParam = searchParams.get('next')
  const nextPath = nextParam && nextParam.startsWith('/') ? nextParam : '/schedule'
  const buildAddLink = (activityId: string) =>
    `${nextPath}${nextPath.includes('?') ? '&' : '?'}add=${encodeURIComponent(activityId)}`

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains')
      if (!response.ok) throw new Error('Failed to fetch domains')
      const data = await response.json()
      const domainTabs: DomainTab[] = (data.domains || []).map((domain: DomainTab) => ({
        id: domain.slug || domain.id,
        name: domain.name,
        icon: domain.icon || '📚',
        slug: domain.slug,
        _count: domain._count
      }))
      setDomains([{ id: 'all', name: 'All Domains', icon: '📚', slug: 'all' }, ...domainTabs])
    } catch (err) {
      console.error('Fetch domains error:', err)
    }
  }

  const fetchExplorerData = async () => {
    try {
      const response = await fetch('/api/domains?include=categories,activities')
      if (!response.ok) throw new Error('Failed to fetch explorer data')
      const data = await response.json()
      setExplorerDomains(data.domains || [])
    } catch (err) {
      console.error('Fetch explorer data error:', err)
    }
  }

  const fetchActivities = async (domain: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '300')
      if (domain !== 'all') params.set('domain', domain)
      if (query.trim()) params.set('q', query.trim())

      const response = await fetch(`/api/activities/search?${params.toString()}`)
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Failed to load activities')
      }
      const data = await response.json()
      setActivities(data.activities || [])
      setError('')
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      setError('Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExplorerCreate = async (title: string, domainSlug: string) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          domainSlug,
          description: `Custom topic: ${title}`,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create topic')
      }

      await fetchExplorerData()
      router.push(buildAddLink(data.activity.id))
    } catch (err) {
      console.error('Create topic error:', err)
      setError('Could not create custom topic')
    }
  }

  const clearFilters = () => {
    setQueryInput('')
    setQuery('')
    setMaxDifficulty('all')
    setDurationFilter('all')
    setSelectedTag('all')
    setSortBy('relevance')
  }

  useEffect(() => {
    const timer = setTimeout(() => setQuery(queryInput), 250)
    return () => clearTimeout(timer)
  }, [queryInput])

  useEffect(() => {
    fetchDomains()
    fetchExplorerData()
  }, [])

  useEffect(() => {
    fetchActivities(selectedDomain)
  }, [selectedDomain])

  const tagOptions = useMemo(() => {
    const tagSet = new Set<string>()
    for (const activity of activities) {
      for (const tag of activity.tags || []) tagSet.add(tag)
    }
    return ['all', ...Array.from(tagSet).sort((a, b) => a.localeCompare(b)).slice(0, 40)]
  }, [activities])

  const filteredActivities = useMemo(() => {
    let list = [...activities]

    if (query.trim()) {
      const q = normalizeText(query.trim())
      const tokens = q.split(/\s+/).filter(Boolean)

      const scoreActivity = (activity: Activity) => {
        const title = normalizeText(activity.title)
        const description = normalizeText(activity.description || '')
        const domainName = normalizeText(activity.domain?.name || '')
        const categoryName = normalizeText(activity.category?.name || '')
        const tags = (activity.tags || []).map((tag) => normalizeText(tag))
        const blob = `${title} ${description} ${domainName} ${categoryName} ${tags.join(' ')}`

        let score = 0
        if (title.startsWith(q)) score += 8
        if (title.includes(q)) score += 6
        if (categoryName.includes(q)) score += 5
        if (domainName.includes(q)) score += 4
        if (description.includes(q)) score += 2
        if (tags.some((tag) => tag.includes(q))) score += 5

        for (const token of tokens) {
          if (title.includes(token)) score += 3
          if (categoryName.includes(token)) score += 2
          if (domainName.includes(token)) score += 2
          if (description.includes(token)) score += 1
          if (tags.some((tag) => tag.includes(token))) score += 2
        }

        if (tokens.length > 1) {
          const matchedTokens = tokens.filter((token) => blob.includes(token)).length
          score += matchedTokens
        }

        if (q.length >= 2) {
          let idx = 0
          for (const ch of title) {
            if (ch === q[idx]) idx += 1
            if (idx === q.length) {
              score += 1
              break
            }
          }
        }

        return score
      }

      list = list
        .map((activity) => ({ activity, score: scoreActivity(activity) }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((row) => row.activity)
    }

    if (maxDifficulty !== 'all') {
      const max = Number(maxDifficulty)
      list = list.filter((activity) => activity.difficulty <= max)
    }

    if (durationFilter === 'short') {
      list = list.filter((activity) => activity.duration <= 30)
    }
    if (durationFilter === 'medium') {
      list = list.filter((activity) => activity.duration > 30 && activity.duration <= 60)
    }
    if (durationFilter === 'long') {
      list = list.filter((activity) => activity.duration >= 60)
    }

    if (selectedTag !== 'all') {
      const qTag = normalizeText(selectedTag)
      list = list.filter((activity) =>
        (activity.tags || []).some((tag) => normalizeText(tag).includes(qTag))
      )
    }

    if (sortBy === 'difficulty-asc') list.sort((a, b) => a.difficulty - b.difficulty)
    if (sortBy === 'difficulty-desc') list.sort((a, b) => b.difficulty - a.difficulty)
    if (sortBy === 'duration-asc') list.sort((a, b) => a.duration - b.duration)
    if (sortBy === 'duration-desc') list.sort((a, b) => b.duration - a.duration)
    if (sortBy === 'title-asc') list.sort((a, b) => a.title.localeCompare(b.title))

    return list
  }, [activities, query, maxDifficulty, durationFilter, selectedTag, sortBy])

  const hasActiveFilters = Boolean(
    query || maxDifficulty !== 'all' || durationFilter !== 'all' || selectedTag !== 'all' || sortBy !== 'relevance'
  )

  const cardBgClass = 'bg-slate-800 border-slate-700'
  const textPrimaryClass = 'text-slate-100'
  const textSecondaryClass = 'text-slate-300'
  const textMutedClass = 'text-slate-400'
  const inputBgClass = 'bg-slate-900 border-slate-700'
  const inputTextClass = 'text-slate-100 placeholder:text-slate-400'
  const buttonClass = 'bg-slate-800 text-slate-200 hover:bg-slate-700'
  const outlineButtonClass = 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Activity Library</h1>
              <p className="text-slate-300">Smart search + filters to quickly find what you want</p>
            </div>
            <Button className="bg-primary hover:opacity-90 border-0" asChild>
              <Link href={nextPath}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Link>
            </Button>
          </div>
        </div>

        <Card className={`mb-6 ${cardBgClass}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center gap-2 ${textPrimaryClass}`}>
              <SlidersHorizontal className="h-5 w-5 text-orange-600" />
              Smart Search Filters
            </CardTitle>
            <CardDescription className={textSecondaryClass}>
              Search is case-insensitive and typo-tolerant. Use filters to narrow results fast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search topic, tag, domain, or category..."
                className={`w-full rounded-md border py-2 pl-9 pr-3 text-sm ${inputBgClass} ${inputTextClass}`}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <select
                value={maxDifficulty}
                onChange={(e) => setMaxDifficulty(e.target.value)}
                className={`rounded-md border px-3 py-2 text-sm ${inputBgClass} ${inputTextClass}`}
              >
                <option value="all">Any Difficulty</option>
                <option value="3">Beginner (&lt;= 3)</option>
                <option value="5">Intermediate (&lt;= 5)</option>
                <option value="7">Advanced (&lt;= 7)</option>
                <option value="10">Expert (&lt;= 10)</option>
              </select>

              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as 'all' | 'short' | 'medium' | 'long')}
                className={`rounded-md border px-3 py-2 text-sm ${inputBgClass} ${inputTextClass}`}
              >
                <option value="all">Any Duration</option>
                <option value="short">Short (&lt;= 30 min)</option>
                <option value="medium">Medium (31-60 min)</option>
                <option value="long">Long (60+ min)</option>
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className={`rounded-md border px-3 py-2 text-sm ${inputBgClass} ${inputTextClass}`}
              >
                {tagOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'Any Tag' : tag}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'difficulty-asc' | 'difficulty-desc' | 'duration-asc' | 'duration-desc' | 'title-asc')}
                className={`rounded-md border px-3 py-2 text-sm ${inputBgClass} ${inputTextClass}`}
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="difficulty-asc">Sort: Difficulty Low to High</option>
                <option value="difficulty-desc">Sort: Difficulty High to Low</option>
                <option value="duration-asc">Sort: Duration Short to Long</option>
                <option value="duration-desc">Sort: Duration Long to Short</option>
                <option value="title-asc">Sort: Title A-Z</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <p className={textSecondaryClass}>
                Showing <span className={`font-semibold ${textPrimaryClass}`}>{filteredActivities.length}</span> of {activities.length} results
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className={outlineButtonClass} onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`mb-6 ${cardBgClass}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${textPrimaryClass}`}>Choose Your Theme</CardTitle>
            <CardDescription className={textSecondaryClass}>
              Select a color theme for your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  name: 'Luminary',
                  description: 'Become the light',
                  darkBg: 'linear-gradient(135deg, #78350f, #92400e, #451a03)',
                },
                {
                  name: 'Sunrise',
                  description: 'Morning energy, fresh start',
                  darkBg: 'linear-gradient(135deg, #7c2d12, #9a3412, #431407)',
                },
                {
                  name: 'Nebula',
                  description: 'Exciting possibilities',
                  darkBg: 'linear-gradient(135deg, #3b0764, #4c1d95, #2e1065)',
                },
                {
                  name: 'Aurora',
                  description: 'Magic moments',
                  darkBg: 'linear-gradient(135deg, #164e63, #083344, #0c4a6e)',
                },
                {
                  name: 'Forest',
                  description: 'Growth, organic progress',
                  darkBg: 'linear-gradient(135deg, #064e3b, #065f46, #022c22)',
                },
              ].map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => setTheme(themeOption.name)}
                  className={`relative h-24 rounded-lg border-2 transition-all duration-300 overflow-hidden ${
                    theme === themeOption.name
                      ? 'ring-2 ring-offset-2 ring-slate-900 border-slate-600'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="absolute inset-0 transition-all duration-300" style={{ background: themeOption.darkBg }}></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-lg font-semibold text-white drop-shadow-md">{themeOption.name}</div>
                    <div className="text-xs text-white/80">{themeOption.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={`mb-6 ${cardBgClass}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${textPrimaryClass}`}>Explore Topics</CardTitle>
            <CardDescription className={textSecondaryClass}>
              Browse domains, pick a topic, and add it to your schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DomainExplorer
              domains={explorerDomains}
              onAddActivity={handleExplorerCreate}
              buildAddLink={buildAddLink}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {domains.map((d) => (
            <Button
              key={d.id}
              variant={selectedDomain === d.id ? 'default' : 'outline'}
              onClick={() => setSelectedDomain(d.id)}
              className={`min-w-fit transition-all duration-300 ${
                selectedDomain === d.id
                  ? 'bg-primary hover:opacity-90 border-0 text-primary-foreground'
                  : buttonClass
              }`}
            >
              {d.icon} {d.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
              <p className={textSecondaryClass}>Loading activities...</p>
            </div>
          </div>
        ) : error ? (
          <Card className={`text-center py-12 ${cardBgClass}`}>
            <CardContent>
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => fetchActivities(selectedDomain)} variant="outline" className={outlineButtonClass}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : activities.length === 0 ? (
          <Card className={`text-center py-12 ${cardBgClass}`}>
            <CardContent>
              <p className={`mb-2 font-medium ${textPrimaryClass}`}>Activity catalog is empty</p>
              <p className={`text-sm mb-4 ${textMutedClass}`}>
                Smart search needs seeded activities before it can return results.
              </p>
              <div className="mx-auto max-w-xl rounded-md border bg-slate-900 px-3 py-2 text-left text-xs text-slate-300">
                Run: <span className="font-mono">npm run db:push && npm run db:seed</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredActivities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className={`group ${cardBgClass} border hover:border-orange-500 hover:bg-orange-950/30 transition-all duration-300 cursor-pointer hover:scale-[1.01]`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getDifficultyColor(activity.difficulty)}>
                      {getDifficultyLabel(activity.difficulty)} - {activity.difficulty}/10
                    </Badge>
                    <div className={`flex items-center text-sm ${textSecondaryClass}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(activity.duration)}
                    </div>
                  </div>
                  <CardTitle className={`text-lg transition-colors ${textPrimaryClass}`}>
                    {activity.title}
                  </CardTitle>
                  <CardDescription className={`text-xs ${textSecondaryClass}`}>
                    {activity.domain?.name} {activity.category?.name ? `• ${activity.category.name}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className={`text-sm line-clamp-2 ${textSecondaryClass}`}>{activity.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {activity.tags?.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className={`text-xs ${outlineButtonClass}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-primary hover:opacity-90 border-0" size="sm" asChild>
                    <Link href={buildAddLink(activity.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Schedule
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className={`text-center py-12 ${cardBgClass}`}>
            <CardContent>
              <p className={`mb-2 ${textSecondaryClass}`}>No activities found with current filters</p>
              <p className={`text-sm ${textMutedClass}`}>Try clearing filters or switching domain</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LibraryContent />
    </Suspense>
  )
}
