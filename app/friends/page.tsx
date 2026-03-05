'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import TopNav from '@/components/top-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { InviteCodeCard } from '@/components/friends/invite-code-card'
import { FriendList } from '@/components/friends/friend-list'
import { FriendRequests } from '@/components/friends/friend-requests'
import type { FriendRecord, FriendRequest, InviteCode } from '@/components/friends/types'

interface FriendsPayload {
  friends: FriendRecord[]
  incomingRequests: FriendRequest[]
  outgoingRequests: FriendRequest[]
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
          />
        </div>

        {message && (
          <p className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
