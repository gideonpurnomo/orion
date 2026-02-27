'use client'

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Search, X, Clock, Flame, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDuration, getDifficultyColor, getDifficultyLabel } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface SearchBarProps {
  variant?: 'hero' | 'default'
  placeholder?: string
  autoFocus?: boolean
}

const SearchBar = forwardRef<{ focus: () => void }, SearchBarProps>(({
  variant = 'default',
  placeholder = 'Search activities...',
  autoFocus = false
}, ref) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
    }
  }))

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/activities/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.activities || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  const handleActivityClick = (activity: Activity) => {
    setShowResults(false)
    // Navigate to schedule page with the activity pre-selected
    router.push(`/schedule?add=${activity.id}`)
  }

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      {/* Search Input */}
      <div className={`relative group ${variant === 'hero' ? 'scale-110' : ''}`}>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          autoFocus={autoFocus}
          className={`pl-12 pr-12 text-lg ${
            variant === 'hero'
              ? 'h-14 bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20'
              : 'h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-600 focus:border-purple-400'
          } transition-all duration-300`}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden z-50">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Quick Stats */}
              <div className="px-4 py-3 bg-purple-500/10 border-b border-white/10">
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-purple-400" />
                    {results.length} activities found
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-pink-400" />
                    Click to add to schedule
                  </span>
                </div>
              </div>

              {/* Results List */}
              {results.map((activity, index) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="group w-full px-4 py-3 hover:bg-white/10 transition-all duration-200 border-b border-white/10 last:border-0 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{activity.domain?.icon || '📚'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-gray-400 truncate mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="text-purple-400">{activity.domain?.name}</span>
                            <span>•</span>
                            <span>{activity.category?.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(activity.duration)}
                            </span>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(activity.difficulty)} shrink-0>
                          {getDifficultyLabel(activity.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400">No activities found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords or browse the library</p>
              <Link href="/library">
                <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">
                  Browse Library
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {/* Keyboard Hints */}
      {variant === 'hero' && (
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
            /
          </kbd>
          <span>to focus search</span>
          <span className="mx-2">•</span>
          <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
            Esc
          </kbd>
          <span>to close</span>
        </div>
      )}
    </div>
  )
})

SearchBar.displayName = 'SearchBar'
export default SearchBar
