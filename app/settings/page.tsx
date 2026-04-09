'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Profile {
  name: string
  email: string
  image?: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to load profile')
      const data = await response.json()
      setProfile(data.user)
      setName(data.user?.name || '')
      setImage(data.user?.image || '')
    } catch (err) {
      setMessage('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      })
      if (!response.ok) throw new Error('Failed to save profile')
      setMessage('Profile updated')
      await loadProfile()
    } catch (err) {
      setMessage('Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
      <TopNav />

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Settings & Profile</h1>
          <p className="text-slate-600">Edit your personal details and account preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update how your account appears in Luminary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      value={profile?.email || ''}
                      disabled
                      className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Profile Image URL</label>
                    <input
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <Button onClick={saveProfile} disabled={saving} className="bg-slate-900 text-white hover:bg-slate-700">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Personalize your workflow and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Use the top navigation to move directly between Home, Dashboard, Library, and Schedule.</p>
              <p>Use Library `next=/schedule` flow to add activities and continue planning quickly.</p>
              <p>Copy activities in Schedule and paste to another week/month by selecting a target block.</p>
            </CardContent>
          </Card>
        </div>

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
      </div>
    </main>
  )
}
