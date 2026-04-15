'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import TopNav from '@/components/top-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { InviteCodeCard } from '@/components/friends/invite-code-card'
import { FriendList } from '@/components/friends/friend-list'
import { FriendRequests } from '@/components/friends/friend-requests'
import type { FriendRecord, FriendRequest, InviteCode } from '@/components/friends/types'
import { Loader2, Clock } from 'lucide-react'

interface FriendsPayload {
  friends: FriendRecord[]
  incomingRequests: FriendRequest[]
  outgoingRequests: FriendRequest[]
}

interface FriendScheduleItem {
  id: string
  scheduledFor: string
  duration?: number
  status: string
  activity?: {
    title: string
    duration?: number
    domain?: { name: string; icon?: string }
  }
}

export default function FriendsPage() {
  const [friendsData, setFriendsData] = useState<FriendsPayload>({
    friends: [],
    incomingRequests: [],
    outgoingRequests: [],
  })
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [scheduleFriendId, setScheduleFriendId] = useState('')
  const [scheduleFriendName, setScheduleFriendName] = useState('')
  const [friendSchedule, setFriendSchedule] = useState<FriendScheduleItem[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)

  const pendingCount = useMemo(
    () => friendsData.incomingRequests.length + friendsData.outgoingRequests.length,
    [friendsData.incomingRequests.length, friendsData.outgoingRequests.length]
  )

  const loadAll = async () => {
    setLoading(true)
    setMessage('')

    try {
      const [friendsRes, inviteRes] = await Promise.all([
        fetch('/api/friends', { cache: 'no-store' }),
        fetch('/api/friends/invite-code', { cache: 'no-store' }),
      ])

      if (!friendsRes.ok || !inviteRes.ok) {
        throw new Error('Failed to load friend data')
      }

      const friendsJson = await friendsRes.json()
      const inviteJson = await inviteRes.json()

      setFriendsData(friendsJson)
      setInviteCode(inviteJson.inviteCode)
    } catch (error) {
      console.error('Load friends error:', error)
      setMessage('Could not load friend data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const sendRequest = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!email.trim()) {
      setMessage('Enter an email first')
      return
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Failed to send friend request')
      }

      setEmail('')
      setMessage('Friend request sent')
      await loadAll()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send friend request')
    }
  }

  const redeemCode = async (inviteCodeToRedeem: string) => {
    setMessage('')

    try {
      const response = await fetch('/api/friends/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCodeToRedeem }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Failed to redeem invite code')
      }

      setMessage('Invite code redeemed. Request sent.')
      await loadAll()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to redeem invite code')
    }
  }

  const updateRequest = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    setActionLoadingId(requestId)
    setMessage('')

    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Failed to update request')
      }

      await loadAll()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update request')
    } finally {
      setActionLoadingId(null)
    }
  }

  const removeFriend = async (friendId: string) => {
    setActionLoadingId(friendId)
    setMessage('')

    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Failed to remove friend')
      }

      await loadAll()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to remove friend')
    } finally {
      setActionLoadingId(null)
    }
  }

  const regenerateCode = async () => {
    setMessage('')

    try {
      const response = await fetch('/api/friends/invite-code', {
        method: 'POST',
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Failed to regenerate code')
      }

      const data = await response.json()
      setInviteCode(data.inviteCode)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to regenerate code')
    }
  }

  const viewFriendSchedule = async (friendId: string, friendName: string) => {
    setScheduleFriendId(friendId)
    setScheduleFriendName(friendName)
    setScheduleDialogOpen(true)
    setScheduleLoading(true)
    setFriendSchedule([])

    try {
      const response = await fetch(`/api/friends/${friendId}/schedule`)
      if (!response.ok) throw new Error('Failed to load schedule')
      const data = await response.json()
      setFriendSchedule(data.schedule || [])
    } catch (error) {
      console.error('Load friend schedule error:', error)
      setMessage('Could not load friend schedule')
    } finally {
      setScheduleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200">
      <TopNav />

      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Friends</h1>
            <p className="text-slate-600">Manage your learning friends and requests.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-900 text-white">{pendingCount} pending</Badge>
            <Link href="/availability">
              <Button className="bg-slate-900 text-white hover:bg-slate-700">
                Find Mutual Time
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Send Friend Request</CardTitle>
              <CardDescription>Use a user email to send a request.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendRequest} className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="friend@example.com"
                />
                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-700">
                  Send Request
                </Button>
              </form>
            </CardContent>
          </Card>

          <InviteCodeCard
            inviteCode={inviteCode}
            onRegenerate={regenerateCode}
            onRedeem={redeemCode}
            onMessage={setMessage}
          />

        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <FriendRequests
            incoming={friendsData.incomingRequests}
            outgoing={friendsData.outgoingRequests}
            loading={loading}
            loadingId={actionLoadingId}
            onAction={updateRequest}
          />
          <FriendList
            friends={friendsData.friends}
            loading={loading}
            loadingId={actionLoadingId}
            onRemove={removeFriend}
            onViewSchedule={viewFriendSchedule}
          />
        </div>

        {message && (
          <p className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {message}
          </p>
        )}
      </div>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>{scheduleFriendName}'s Schedule</DialogTitle>
            <DialogDescription>Their activities for this week</DialogDescription>
          </DialogHeader>
          {scheduleLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : friendSchedule.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No activities scheduled this week.</p>
          ) : (
            <div className="max-h-[60vh] space-y-2 overflow-y-auto">
              {friendSchedule.map((item) => {
                const date = new Date(item.scheduledFor)
                const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                const statusColor =
                  item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  item.status === 'SKIPPED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'

                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.activity?.domain?.icon || '📚'}</span>
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.activity?.title || 'Untitled'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dayLabel} {timeLabel} &middot; {item.duration || item.activity?.duration || 0} min
                        </p>
                      </div>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
