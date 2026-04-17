'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Lock, BarChart3, Calendar } from 'lucide-react'

interface Profile {
  name: string
  email: string
  image?: string | null
  xp: number
  level: number
  createdAt: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

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
      setMessageType('error')
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
      setMessageType('success')
      await loadProfile()
    } catch (err) {
      setMessage('Could not update profile')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setMessage('')
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      setMessageType('error')
      return
    }

    setSavingPassword(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to change password')
      }
      setMessage('Password changed successfully')
      setMessageType('success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not change password')
      setMessageType('error')
    } finally {
      setSavingPassword(false)
    }
  }

  const inputClass = "w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <TopNav />

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-100">Settings & Profile</h1>
          <p className="text-slate-400">Edit your personal details and account preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
              <CardDescription>Update how your account appears in Luminary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
                    <input value={profile?.email || ''} disabled className={`${inputClass} bg-slate-700 text-slate-400 cursor-not-allowed`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Profile Image URL</label>
                    <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={inputClass} />
                  </div>
                  <Button onClick={saveProfile} disabled={saving} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                  </div>
                  <Button onClick={changePassword} disabled={savingPassword} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                    {savingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Account Stats</CardTitle>
              <CardDescription>Your learning journey at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Level</span><span className="font-semibold text-slate-100">{profile?.level ?? 1}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total XP</span><span className="font-semibold text-slate-100">{profile?.xp?.toLocaleString() ?? 0}</span></div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Get the most out of Luminary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-400">
              <p>Use Library with <code className="rounded bg-slate-700 px-1">next=/schedule</code> to add activities and continue planning quickly.</p>
              <p>Copy activities in Schedule and paste to another week/month by selecting a target block.</p>
              <p>Use the Export button on the Schedule page to download your calendar as ICS, CSV, or JSON.</p>
              <p>Complete Pomodoro focus sessions to earn bonus XP toward your level.</p>
            </CardContent>
          </Card>
        </div>

        {message && (
          <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            messageType === 'error'
              ? 'border-red-800 bg-red-950/30 text-red-400'
              : 'border-emerald-800 bg-emerald-950/30 text-emerald-400'
          }`}>
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
