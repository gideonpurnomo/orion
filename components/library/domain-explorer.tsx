'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDifficultyColor, getDifficultyLabel, formatDuration } from '@/lib/utils'

interface ExplorerActivity {
  id: string
  title: string
  slug: string
  description: string | null
  difficulty: number
  duration: number
  tags: string[]
}

interface ExplorerCategory {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  activities: ExplorerActivity[]
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

interface DomainExplorerProps {
  domains: ExplorerDomain[]
  onAddActivity: (domainSlug: string, title: string, description?: string) => Promise<void>
  buildAddLink: (activityId: string) => string
}

export default function DomainExplorer({ domains, onAddActivity, buildAddLink }: DomainExplorerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingActivity, setLoadingActivity] = useState<string | null>(null)
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [creatingInDomain, setCreatingInDomain] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const handleAddExisting = async (activity: ExplorerActivity) => {
    setLoadingActivity(activity.id)
    try {
      window.location.href = buildAddLink(activity.id)
    } finally {
      setLoadingActivity(null)
    }
  }

  const handleCustomCreate = async (domainSlug: string) => {
    const title = (customInputs[domainSlug] || '').trim()
    if (!title) return
    setCreatingInDomain(domainSlug)
    try {
      await onAddActivity(title, domainSlug)
    } finally {
      setCreatingInDomain(null)
      setCustomInputs(prev => ({ ...prev, [domainSlug]: '' }))
    }
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-300">No topics available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {domains.map((domain) => {
        const isExpanded = expandedId === domain.id
        const totalActivities = domain.categories.reduce(
          (sum, cat) => sum + cat.activities.length, 0
        )

        return (
          <div
            key={domain.id}
            className={isExpanded ? 'col-span-full' : ''}
          >
            {/* Domain Card */}
            <button
              onClick={() => toggle(domain.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                isExpanded
                  ? 'border-orange-500 bg-orange-950/30'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl shrink-0">{domain.icon || '📚'}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100 truncate">{domain.name}</p>
                    <p className="text-xs text-slate-400">
                      {domain.categories.length} categories &middot; {totalActivities} topics
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                </motion.div>
              </div>
            </button>

            {/* Expanded Panel */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-5">
                    {domain.description && (
                      <p className="text-sm text-slate-300">{domain.description}</p>
                    )}

                    {domain.categories.map((category) => (
                      <div key={category.id}>
                        <h3 className="text-sm font-semibold text-slate-200 mb-2">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-slate-400 mb-2">{category.description}</p>
                        )}
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {category.activities.map((activity) => {
                            const isThisLoading = loadingActivity === activity.id
                            return (
                              <div
                                key={activity.id}
                                className="rounded-lg border border-slate-700 bg-slate-800 p-3 flex flex-col gap-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-sm text-slate-100 leading-tight">
                                    {activity.title}
                                  </p>
                                  <Badge className={`${getDifficultyColor(activity.difficulty)} text-[10px] shrink-0`}>
                                    {getDifficultyLabel(activity.difficulty)}
                                  </Badge>
                                </div>
                                {activity.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2">
                                    {activity.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="text-xs text-slate-500">
                                    {formatDuration(activity.duration)}
                                  </span>
                                  <Button
                                    size="sm"
                                    className="bg-primary hover:opacity-90 border-0 h-7 text-xs px-3"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddExisting(activity)
                                    }}
                                    disabled={isThisLoading}
                                  >
                                    {isThisLoading ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                          {category.activities.length === 0 && (
                            <p className="text-xs text-slate-500 col-span-full">
                              No activities yet — add your own below.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Custom topic input */}
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">
                        Don&apos;t see what you need? Add your own topic...
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={customInputs[domain.slug] || ''}
                          onChange={(e) =>
                            setCustomInputs(prev => ({
                              ...prev,
                              [domain.slug]: e.target.value,
                            }))
                          }
                          placeholder={`e.g. ${domain.name} topic...`}
                          className="flex-1 rounded-md border bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 px-3 py-2 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCustomCreate(domain.slug)
                          }}
                        />
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                          onClick={() => handleCustomCreate(domain.slug)}
                          disabled={
                            creatingInDomain === domain.slug ||
                            !(customInputs[domain.slug] || '').trim()
                          }
                        >
                          {creatingInDomain === domain.slug ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Create
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
