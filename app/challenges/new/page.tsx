'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/top-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewChallengePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'XP_COLLECTED' | 'ACTIVITIES_COMPLETED' | 'STREAK_HIGHEST' | 'DOMAIN_MASTERY'>('XP_COLLECTED')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Failed to create challenge')

      router.push(`/challenges/${data.challenge.id}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create challenge')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav theme="blue" />

      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Create Challenge</CardTitle>
            <CardDescription>Set challenge type, date range, and rules.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly XP Sprint" required />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  rows={4}
                  placeholder="Compete to earn the most XP this week"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="XP_COLLECTED">XP Collected</option>
                  <option value="ACTIVITIES_COMPLETED">Activities Completed</option>
                  <option value="STREAK_HIGHEST">Highest Streak</option>
                  <option value="DOMAIN_MASTERY">Domain Mastery</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Start Date</label>
                  <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">End Date</label>
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              {message && <p className="text-sm text-red-600">{message}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-slate-900 text-white hover:bg-slate-700">
                  {saving ? 'Creating...' : 'Create Challenge'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/challenges')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
