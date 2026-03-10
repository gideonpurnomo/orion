'use client' // @ts-ignore - TODO: Fix line 367 unmatched parenthesis


import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Settings2,
  Zap,
  Plus,
  X,
  CheckCircle2,
  Save,
  Loader2,
  Info,
  TrendingUp,
} from 'lucide-react'

interface AvailabilitySettings {
  workingHours: Record<string, { enabled: boolean; startTime: string; endTime: string }>
  daysOff: string[]
  timePreferences: {
    energyLevels: Array<{ timeSlot: string; level: string }>
    optimalLearningTimes: Array<{ day: string; startTime: string; endTime: string }>
  }
  breakPreferences: {
    pomodoroEnabled: boolean
    pomodoroWorkMinutes: number
    pomodoroBreakMinutes: number
    sessionLengthMinutes: number
  }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['morning', 'midday', 'afternoon', 'evening']
const ENERGY_LEVELS = ['low', 'medium', 'high']
const TIME_REGEX = /^\d{2}:\d{2}$/ // HH:MM format

export default function AvailabilitySchedule({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'hours' | 'days' | 'time' | 'break'>('hours')

  useEffect(() => {
    const fetchSettings = async () => {
      setIsSaving(true)
      try {
        const response = await fetch('/api/availability/settings')
        if (!response.ok) throw new Error('Failed to fetch availability settings')
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        console.error('Fetch settings error:', err)
        setError('Failed to load availability settings')
      } finally {
        setIsSaving(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/availability/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings!),
      })

      if (!response.ok) {
        throw new Error('Failed to save availability settings')
      }

      const result = await response.json()

      // Show success message
      alert('✅ Availability settings saved!')
    } catch (err) {
      console.error('Save settings error:', err)
      setError('Failed to save availability settings')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleWorkingDay = (day: string) => {
    if (!settings) return

    const current = settings.workingHours[day]
    const newSettings = { ...settings.workingHours, [day]: { ...current, enabled: !current.enabled } }
    setSettings({ ...settings, workingHours: newSettings })
  }

  const toggleDayOff = (date: string) => {
    if (!settings) return

    const newDaysOff = settings.daysOff.includes(date)
      ? settings.daysOff.filter(d => d !== date)
      : [...settings.daysOff, date]

    setSettings({ ...settings, daysOff: newDaysOff })
  }

  const updateEnergyLevel = (timeSlot: string, level: string) => {
    if (!settings) return

    const newEnergyLevels = settings.timePreferences.energyLevels.map(el =>
      el.timeSlot === timeSlot && el.level === level
        ? { ...el, level }
        : el
    )

    setSettings({ ...settings, timePreferences: { ...settings.timePreferences, energyLevels: newEnergyLevels } })
  }

  const updateOptimalTime = (day: string, type: 'start' | 'end', value: string) => {
    if (!settings) return

    const newOptimalTimes = settings.timePreferences.optimalLearningTimes.map(ot =>
      ot.day === day && ot[type] === value
        ? { ...ot, [type]: value }
        : ot
    )

    setSettings({ ...settings, timePreferences: { ...settings.timePreferences, optimalLearningTimes: newOptimalTimes } })
  }

  const updateBreakPreference = (key: 'pomodoroEnabled' | 'pomodoroWorkMinutes' | 'pomodoroBreakMinutes' | 'sessionLengthMinutes', value: boolean | number) => {
    if (!settings) return

    setSettings({
      ...settings,
      breakPreferences: { ...settings.breakPreferences, [key]: value },
    })
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Availability Schedule
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Set when you can learn for optimal scheduling
                </p>
              </div>
              <Button onClick={onClose} variant="ghost" className="text-slate-600 dark:text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {settings && (
            <>
              {/* Settings Card */}
              <Card className="border-blue-200 bg-white dark:border-blue-900 dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Schedule Settings
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Configure your working hours and learning preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isSaving && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-3" />
                      <span className="text-slate-600 dark:text-slate-400">Saving...</span>
                    </div>
                  )}

                  {/* Working Hours */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Working Hours</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Enable/disable days and set times</p>
                    <div className="space-y-2">
                      {DAYS.map((day) => {
                        const hours = settings.workingHours[day]
                        return (
                          <div key={day} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <span className="w-24 text-base font-semibold text-slate-900 dark:text-slate-100">{day}</span>
                              <Switch
                                checked={hours?.enabled}
                                onCheckedChange={() => toggleWorkingDay(day)}
                                disabled={isSaving}
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {hours?.enabled
                                    ? `${hours.startTime} - ${hours.endTime}`
                                    : 'Off'}
                                </span>
                                <div className="flex gap-2">
                                  <input
                                    type="time"
                                    value={hours?.enabled ? hours.startTime : ''}
                                    onChange={(e) => {
                                      if (!settings) return
                                      const newHours = { ...settings.workingHours, [day]: { ...hours, startTime: e.target.value } }
                                      setSettings({ ...settings, workingHours: newHours })
                                    }}
                                    disabled={!hours?.enabled || isSaving}
                                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                  />
                                  <span className="text-slate-600 dark:text-slate-400">to</span>
                                  <input
                                    type="time"
                                    value={hours?.enabled ? hours.endTime : ''}
                                    onChange={(e) => {
                                      if (!settings) return
                                        const newHours = { ...settings.workingHours, [day]: { ...hours, endTime: e.target.value } }
                                        setSettings({ ...settings, workingHours: newHours })
                                      }}
                                    disabled={!hours?.enabled || isSaving}
                                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Days Off */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Days Off</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Select days when you&apos;re not available</p>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {Array.from({ length: 42 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - 41 + i) // Show last 6 weeks
                        const dateStr = date.toISOString().split('T')[0]
                        const isDayOff = settings.daysOff.includes(dateStr)

                        return (
                          <button
                            key={i}
                            onClick={() => toggleDayOff(dateStr)}
                            disabled={isSaving}
                            className={`h-20 w-full rounded-lg border-2 transition-all ${
                              isDayOff
                                ? 'bg-red-100 text-white border-red-300 dark:bg-red-900 dark:border-red-700'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 hover:border-slate-600 dark:text-slate-100'
                            }`}
                          >
                            <div className="text-sm">
                              <div>{date.getDate()}</div>
                              <div className="text-xs">
                                {['S', 'M', 'T', 'W', 'F'][date.getDay()]}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Select multiple days or click a day again to deselect
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings({ ...settings, daysOff: [] })}
                        disabled={isSaving}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Preferences Tab */}
              {activeTab === 'time' && (
                <Card className="border-blue-200 bg-white dark:border-blue-900 dark:bg-slate-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Time Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Set energy levels and optimal learning times
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Energy Levels</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">How energetic are you for each time of day?</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TIME_SLOTS.map((slot) => (
                          <div key={slot} className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{slot.charAt(0).toUpperCase() + slot.slice(1)}</h4>
                            <div className="flex items-center gap-2">
                              {ENERGY_LEVELS.map((level) => {
                                const currentLevel = settings.timePreferences.energyLevels.find(el => el.timeSlot === slot && el.level === level)

                                return (
                                  <Button
                                    key={level}
                                    onClick={() => updateEnergyLevel(slot, level)}
                                    disabled={isSaving}
                                    variant={currentLevel ? 'default' : 'outline'}
                                    className="w-full text-xs"
                                  >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </Button>
                                )
                              })}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {settings.timePreferences.energyLevels.filter(el => el.timeSlot === slot && el.level === 'high').length} High energy
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optimal Learning Times */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Optimal Learning Times</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">When do you learn best each day?</p>
                      <div className="space-y-3">
                        {DAYS.map((day) => {
                          const optimal = settings.timePreferences.optimalLearningTimes.find(ot => ot.day === day)
                          return (
                            <div key={day} className="flex items-center gap-2">
                              <span className="w-20 text-base font-semibold text-slate-900 dark:text-slate-100">{day}</span>
                              <div className="flex-1">
                                <input
                                  type="time"
                                  value={optimal?.startTime || ''}
                                  onChange={(e) => updateOptimalTime(day, 'start', e.target.value)}
                                  disabled={isSaving}
                                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                  placeholder="09:00"
                                />
                                <span className="text-slate-600 dark:text-slate-400">to</span>
                                <input
                                  type="time"
                                  value={optimal?.endTime || ''}
                                  onChange={(e) => updateOptimalTime(day, 'end', e.target.value)}
                                  disabled={isSaving}
                                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                  placeholder="17:00"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Break Preferences Tab */}
              {activeTab === 'break' && (
                <Card className="border-blue-200 bg-white dark:border-blue-900 dark:bg-slate-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Settings2 className="h-5 w-5 text-blue-600" />
                      Break Settings
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Pomodoro-style timer for focused learning sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={settings.breakPreferences.pomodoroEnabled}
                        onCheckedChange={(checked) => updateBreakPreference('pomodoroEnabled', checked)}
                        disabled={isSaving}
                      />
                      <label className="text-base text-slate-900 dark:text-slate-100">Enable Pomodoro Timer</label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Duration (minutes)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="15"
                            max="60"
                            value={settings.breakPreferences.pomodoroWorkMinutes}
                            onChange={(e) => updateBreakPreference('pomodoroWorkMinutes', parseInt(e.target.value))}
                            disabled={isSaving}
                            className="w-24 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          />
                          <div className="text-xs text-slate-600 dark:text-slate-400">Recommended: 25-50</div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Break Duration (minutes)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5"
                            max="30"
                            value={settings.breakPreferences.pomodoroBreakMinutes}
                            onChange={(e) => updateBreakPreference('pomodoroBreakMinutes', parseInt(e.target.value))}
                            disabled={isSaving}
                            className="w-24 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          />
                          <div className="text-xs text-slate-600 dark:text-slate-400">Recommended: 5</div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session Length (minutes)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="15"
                            max="180"
                            value={settings.breakPreferences.sessionLengthMinutes}
                            onChange={(e) => updateBreakPreference('sessionLengthMinutes', parseInt(e.target.value))}
                            disabled={isSaving}
                            className="w-24 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          />
                          <div className="text-xs text-slate-600 dark:text-slate-400">Recommended: 60</div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Card */}
                    <Card className="border-blue-200 bg-white dark:border-blue-900 dark:bg-slate-800 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                          <Info className="h-5 w-5 text-blue-600" />
                          Availability Preview
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Based on your settings, here&apos;s how your week looks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 border-2 border-green-200 flex items-center justify-center text-green-700 dark:text-green-100">
                              <span className="text-2xl font-bold">{settings.daysOff.length}</span>
                              <span className="text-xs">Days Off</span>
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Available Days</h4>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-900">{7 - settings.daysOff.length}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">out of 7 days/week</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-200 flex items-center justify-center text-blue-700 dark:text-blue-100">
                              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {DAYS.reduce((count, day) => count + (settings.workingHours[day]?.enabled ? 1 : 0), 0)}
                              </span>
                              <span className="text-xs">Working Days</span>
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Avg/Day</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {settings.workingHours.mon?.enabled ? 'Mon-Fri: 9AM-5PM' : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 border-2 border-purple-200 flex items-center justify-center text-purple-700 dark:text-purple-100">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-2xl font-bold">High Energy</span>
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Best Times</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {settings.timePreferences.energyLevels.filter(el => el.level === 'high').length > 0
                                {settings.timePreferences.energyLevels.filter(el => el.level === 'high').length > 0 ? ' high-energy slots' : 'N/A'}
                              </p>
                            </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="fixed right-4 top-4 z-50 max-w-md rounded-lg bg-red-50 border-2 border-red-200 px-6 py-4 text-red-900 shadow-lg">
                {p className="font-semibold text-red-900 mb-2">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Save Button */}
            <div className="fixed bottom-6 right-6">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
