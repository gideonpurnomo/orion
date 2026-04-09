'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

      alert('Availability settings saved!')
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
      el.timeSlot === timeSlot
        ? { ...el, level }
        : el
    )

    setSettings({ ...settings, timePreferences: { ...settings.timePreferences, energyLevels: newEnergyLevels } })
  }

  const updateOptimalTime = (day: string, type: 'start' | 'end', value: string) => {
    if (!settings) return

    const newOptimalTimes = settings.timePreferences.optimalLearningTimes.map(ot =>
      ot.day === day
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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Availability Schedule...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Availability Schedule
          </DialogTitle>
          <DialogDescription>
            Set when you can learn for optimal scheduling
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b pb-2">
          {(['hours', 'time', 'break'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Working Hours Tab */}
        {activeTab === 'hours' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Working Hours
              </CardTitle>
              <CardDescription>Enable/disable days and set times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DAYS.map((day) => {
                const hours = settings.workingHours[day]
                return (
                  <div key={day} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-base font-semibold">{day}</span>
                      <Switch
                        checked={hours?.enabled}
                        onCheckedChange={() => toggleWorkingDay(day)}
                        disabled={isSaving}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours?.enabled ? hours.startTime : ''}
                          onChange={(e) => {
                            if (!settings) return
                            const newHours = { ...settings.workingHours, [day]: { ...hours, startTime: e.target.value } }
                            setSettings({ ...settings, workingHours: newHours })
                          }}
                          disabled={!hours?.enabled || isSaving}
                          className="w-20 rounded border border-input px-2 py-1 text-sm bg-background"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={hours?.enabled ? hours.endTime : ''}
                          onChange={(e) => {
                            if (!settings) return
                            const newHours = { ...settings.workingHours, [day]: { ...hours, endTime: e.target.value } }
                            setSettings({ ...settings, workingHours: newHours })
                          }}
                          disabled={!hours?.enabled || isSaving}
                          className="w-20 rounded border border-input px-2 py-1 text-sm bg-background"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Days Off */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Days Off</h3>
                <p className="text-sm text-muted-foreground mb-2">Select days when you&apos;re not available</p>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {Array.from({ length: 42 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - 41 + i)
                    const dateStr = date.toISOString().split('T')[0]
                    const isDayOff = settings.daysOff.includes(dateStr)

                    return (
                      <button
                        key={i}
                        onClick={() => toggleDayOff(dateStr)}
                        disabled={isSaving}
                        className={`h-16 w-full rounded-lg border-2 transition-all text-sm ${
                          isDayOff
                            ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200'
                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                        }`}
                      >
                        <div>{date.getDate()}</div>
                        <div className="text-xs">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}</div>
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2 mt-2">
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
        )}

        {/* Time Preferences Tab */}
        {activeTab === 'time' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Time Preferences
              </CardTitle>
              <CardDescription>Set energy levels and optimal learning times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Energy Levels</h3>
                <p className="text-sm text-muted-foreground mb-2">How energetic are you for each time of day?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const currentLevel = settings.timePreferences.energyLevels.find(el => el.timeSlot === slot)
                    return (
                      <div key={slot} className="space-y-2">
                        <h4 className="text-sm font-semibold capitalize">{slot}</h4>
                        <div className="flex items-center gap-1">
                          {ENERGY_LEVELS.map((level) => (
                            <Button
                              key={level}
                              onClick={() => updateEnergyLevel(slot, level)}
                              disabled={isSaving}
                              variant={currentLevel?.level === level ? 'default' : 'outline'}
                              className="flex-1 text-xs"
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Optimal Learning Times */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Optimal Learning Times</h3>
                <p className="text-sm text-muted-foreground mb-2">When do you learn best each day?</p>
                <div className="space-y-3">
                  {DAYS.map((day) => {
                    const optimal = settings.timePreferences.optimalLearningTimes.find(ot => ot.day === day)
                    return (
                      <div key={day} className="flex items-center gap-2">
                        <span className="w-20 text-base font-semibold">{day}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={optimal?.startTime || ''}
                            onChange={(e) => updateOptimalTime(day, 'start', e.target.value)}
                            disabled={isSaving}
                            className="w-20 rounded border border-input px-2 py-1 text-sm bg-background"
                            placeholder="09:00"
                          />
                          <span className="text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={optimal?.endTime || ''}
                            onChange={(e) => updateOptimalTime(day, 'end', e.target.value)}
                            disabled={isSaving}
                            className="w-20 rounded border border-input px-2 py-1 text-sm bg-background"
                            placeholder="17:00"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Break Preferences Tab */}
        {activeTab === 'break' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Break Settings
              </CardTitle>
              <CardDescription>Pomodoro-style timer for focused learning sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={settings.breakPreferences.pomodoroEnabled}
                  onCheckedChange={(checked) => updateBreakPreference('pomodoroEnabled', checked)}
                  disabled={isSaving}
                />
                <label className="text-base">Enable Pomodoro Timer</label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Work Duration (minutes)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="15"
                      max="60"
                      value={settings.breakPreferences.pomodoroWorkMinutes}
                      onChange={(e) => updateBreakPreference('pomodoroWorkMinutes', parseInt(e.target.value))}
                      disabled={isSaving}
                      className="w-24 rounded border border-input px-3 py-2 text-sm bg-background"
                    />
                    <div className="text-xs text-muted-foreground">Recommended: 25-50</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Break Duration (minutes)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={settings.breakPreferences.pomodoroBreakMinutes}
                      onChange={(e) => updateBreakPreference('pomodoroBreakMinutes', parseInt(e.target.value))}
                      disabled={isSaving}
                      className="w-24 rounded border border-input px-3 py-2 text-sm bg-background"
                    />
                    <div className="text-xs text-muted-foreground">Recommended: 5</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Session Length (minutes)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="15"
                      max="180"
                      value={settings.breakPreferences.sessionLengthMinutes}
                      onChange={(e) => updateBreakPreference('sessionLengthMinutes', parseInt(e.target.value))}
                      disabled={isSaving}
                      className="w-24 rounded border border-input px-3 py-2 text-sm bg-background"
                    />
                    <div className="text-xs text-muted-foreground">Recommended: 60</div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4 text-primary" />
                    Availability Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 border-2 border-green-200 flex flex-col items-center justify-center text-green-700 dark:text-green-200">
                        <span className="text-lg font-bold">{7 - settings.daysOff.length}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">Available Days</h4>
                        <p className="text-sm text-muted-foreground">{7 - settings.daysOff.length} out of 7 days/week</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-200 flex items-center justify-center text-blue-700 dark:text-blue-200">
                        <span className="text-lg font-bold">
                          {DAYS.reduce((count, day) => count + (settings.workingHours[day]?.enabled ? 1 : 0), 0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">Working Days</h4>
                        <p className="text-sm text-muted-foreground">
                          {DAYS.reduce((count, day) => count + (settings.workingHours[day]?.enabled ? 1 : 0), 0)} days with set hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-200 flex items-center justify-center text-purple-700 dark:text-purple-200">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">High Energy Times</h4>
                        <p className="text-sm text-muted-foreground">
                          {settings.timePreferences.energyLevels.filter(el => el.level === 'high').length} high-energy slots
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
