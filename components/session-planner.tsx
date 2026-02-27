'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Clock, Play, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export interface SubTopic {
  id: string
  name: string
  minutes: number
  isCustom: boolean
}

interface SessionPlannerProps {
  activity: {
    id: string
    title: string
    tags: string[]
    duration: number
  }
  isOpen: boolean
  onClose: () => void
  onSave: (topics: SubTopic[]) => void
}

export default function SessionPlanner({ activity, isOpen, onClose, onSave }: SessionPlannerProps) {
  const [customTopic, setCustomTopic] = useState('')
  const [totalDuration, setTotalDuration] = useState(activity.duration)
  const [topics, setTopics] = useState<SubTopic[]>([])

  // Initialize with one topic when opened
  useEffect(() => {
    if (isOpen && topics.length === 0) {
      setTopics([{ id: '1', name: activity.title, minutes: totalDuration, isCustom: false }])
    }
  }, [isOpen, activity.title, totalDuration])

  const toggleTag = (tag: string) => {
    const exists = topics.find(t => t.name.toLowerCase() === tag.toLowerCase() && !t.isCustom)
    if (exists) {
      // Remove topic
      setTopics(topics.filter(t => t.id !== exists.id))
    } else {
      // Add topic with default time
      const newTopic: SubTopic = {
        id: Date.now().toString(),
        name: tag,
        minutes: Math.floor(totalDuration / (topics.length + 1)),
        isCustom: false
      }
      setTopics([...topics, newTopic])
    }
  }

  const addCustomTopic = () => {
    if (customTopic.trim()) {
      const newTopic: SubTopic = {
        id: Date.now().toString(),
        name: customTopic.trim(),
        minutes: Math.floor(totalDuration / (topics.length + 1)),
        isCustom: true
      }
      setTopics([...topics, newTopic])
      setCustomTopic('')
    }
  }

  const updateTopicTime = (id: string, minutes: number) => {
    setTopics(topics.map(t =>
      t.id === id ? { ...t, minutes: Math.max(1, Math.min(minutes, totalDuration)) } : t
    ))
  }

  const removeTopic = (id: string) => {
    setTopics(topics.filter(t => t.id !== id))
  }

  const handleSave = () => {
    onSave(topics)
    onClose()
  }

  const usedTime = topics.reduce((sum, t) => sum + t.minutes, 0)
  const remainingTime = totalDuration - usedTime

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Session Planner</h2>
              <p className="text-gray-400">Plan what to learn in this session</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Activity Info */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">📚</div>
              <div>
                <h3 className="text-xl font-semibold text-white">{activity.title}</h3>
                <p className="text-gray-400 text-sm">{activity.tags.slice(0, 3).join(' • ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="h-4 w-4" />
                Total: {totalDuration} min
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                Used: {usedTime} min
              </span>
              {remainingTime > 0 ? (
                <span className="flex items-center gap-1 text-green-400">
                  Remaining: {remainingTime} min
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400">
                  Over: {Math.abs(remainingTime)} min
                </span>
              )}
            </div>
          </div>

          {/* Available Topics */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Available Topics</h4>
            <p className="text-sm text-gray-400 mb-3">Click to add to your session</p>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag) => {
                const isSelected = topics.some(t => t.name.toLowerCase() === tag.toLowerCase() && !t.isCustom)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Custom Topic</h4>
            <p className="text-sm text-gray-400 mb-3">Add your own learning topic</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Business Spanish, Travel phrases"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-600 focus:border-purple-400"
              />
              <Button onClick={addCustomTopic} variant="outline" className="border-white/20 text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Topics */}
          {topics.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Your Session ({topics.length} topics)</h4>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{topic.name}</span>
                        {topic.isCustom && (
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={topic.minutes}
                        onChange={(e) => updateTopicTime(topic.id, parseInt(e.target.value) || 0)}
                        min="1"
                        max={totalDuration}
                        className="w-20 bg-white/10 border-white/20 text-white text-center focus:border-purple-400"
                      />
                      <span className="text-gray-400 text-sm">min</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTopic(topic.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <Button variant="outline" onClick={onClose} className="border-white/20 text-white">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={topics.length === 0 || remainingTime < 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
          >
            <Save className="h-4 w-4 mr-2" />
            Save & Start Session
          </Button>
        </div>
      </div>
    </div>
  )
}
