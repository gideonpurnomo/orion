'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Calendar as CalendarIcon, FileSpreadsheet, FileJson, Loader2, CheckCircle } from 'lucide-react'

interface CalendarExportProps {
  isOpen: boolean
  onClose: () => void
}

const FORMATS = [
  { value: 'ics', label: 'iCalendar (.ics)', icon: '📅', description: 'Best for Google Calendar, Apple Calendar, Outlook', color: 'text-blue-400 bg-blue-950/50' },
  { value: 'csv', label: 'CSV (.csv)', icon: '📊', description: 'Best for Excel, Google Sheets, Numbers', color: 'text-green-400 bg-green-950/50' },
  { value: 'json', label: 'JSON (.json)', icon: '📋', description: 'Best for backups and custom imports', color: 'text-purple-400 bg-purple-950/50' },
]

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
]

const INTEGRATIONS = [
  { value: 'google', label: 'Google Calendar', icon: '📅', color: 'text-blue-400 hover:bg-blue-950/50' },
  { value: 'outlook', label: 'Outlook', icon: '📧', color: 'text-purple-400 hover:bg-purple-950/50' },
  { value: 'apple', label: 'Apple Calendar', icon: '🍎', color: 'text-slate-400 hover:bg-slate-700' },
]

export default function CalendarExport({ isOpen, onClose }: CalendarExportProps) {
  const [format, setFormat] = useState<'ics' | 'csv' | 'json'>('ics')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('month')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const getFormatConfig = (formatValue: string) => {
    return FORMATS.find(f => f.value === formatValue) || FORMATS[0]
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      const params = new URLSearchParams()
      params.set('format', format)

      if (dateRange === 'custom') {
        if (startDate) params.set('startDate', startDate.toISOString())
        if (endDate) params.set('endDate', endDate.toISOString())
      } else {
        params.set('range', dateRange)
      }

      const response = await fetch(`/api/calendar/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || `luminary-export.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setExportSuccess(true)

      // Show success message for 3 seconds
      setTimeout(() => {
        setExportSuccess(false)
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleIntegration = (integration: string) => {
    const params = new URLSearchParams()
    params.set('format', 'ics')
    params.set('range', 'month')

    window.open(`/api/calendar/export?${params.toString()}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Export Your Schedule
          </DialogTitle>
          <DialogDescription>
            Choose a format and date range, then download or sync with your calendar app.
          </DialogDescription>
        </DialogHeader>

        {exportSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-400 mb-2">Export Successful!</h3>
            <p className="text-slate-400">Your schedule has been downloaded.</p>
          </div>
        ) : (
          <>
            {/* Format Selection */}
            <div className="space-y-4 py-4">
              <Label className="text-base font-semibold text-slate-100">
                Choose Export Format
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {FORMATS.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setFormat(fmt.value as 'ics' | 'csv' | 'json')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      format === fmt.value
                        ? `${fmt.color} ring-2 ring-offset-2`
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900'
                    }`}
                  >
                    <div className="text-3xl mb-2">{fmt.icon}</div>
                    <div className="font-semibold text-sm">{fmt.label}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {fmt.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-3 py-4 border-t border-slate-700">
              <Label className="text-base font-semibold text-slate-100">
                Date Range
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setDateRange(range.value as typeof dateRange)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      dateRange === range.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-700 hover:border-blue-500 bg-slate-900'
                    }`}
                  >
                    <div className="text-sm font-semibold">{range.label}</div>
                  </button>
                ))}
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-sm text-slate-300">Start Date</Label>
                    <input
                      type="date"
                      value={startDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-300">End Date</Label>
                    <input
                      type="date"
                      value={endDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Integrations */}
            <div className="space-y-4 py-4 border-t border-slate-700">
              <Label className="text-base font-semibold text-slate-100">
                Calendar Integrations
              </Label>
              <p className="text-sm text-slate-400 mb-3">
                Click to open your schedule in external calendar apps
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INTEGRATIONS.map((integration) => (
                  <button
                    key={integration.value}
                    onClick={() => handleIntegration(integration.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${integration.color}`}
                  >
                    <div className="text-3xl mb-2">{integration.icon}</div>
                    <div className="font-semibold text-sm text-center">
                      {integration.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <DialogFooter>
              <Button
                onClick={handleExport}
                disabled={isExporting || (dateRange === 'custom' && (!startDate || !endDate))}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Schedule
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
