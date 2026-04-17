import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FriendRequestRow } from '@/components/friends/friend-request-row'
import type { FriendRequest } from '@/components/friends/types'

interface FriendRequestsProps {
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
  loading: boolean
  loadingId: string | null
  onAction: (requestId: string, action: 'accept' | 'reject' | 'cancel') => void
}

export function FriendRequests({ incoming, outgoing, loading, loadingId, onAction }: FriendRequestsProps) {
  return (
    <>
      <Card className="border-slate-700 bg-slate-800 lg:col-span-1">
        <CardHeader>
          <CardTitle>Incoming</CardTitle>
          <CardDescription>{incoming.length} requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!loading && incoming.length === 0 && <p className="text-sm text-slate-400">No incoming requests.</p>}
          {incoming.map((request) => (
            <FriendRequestRow
              key={request.id}
              mode="incoming"
              request={request}
              loading={loadingId === request.id}
              onAccept={(id) => onAction(id, 'accept')}
              onReject={(id) => onAction(id, 'reject')}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800 lg:col-span-1">
        <CardHeader>
          <CardTitle>Outgoing</CardTitle>
          <CardDescription>{outgoing.length} requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!loading && outgoing.length === 0 && <p className="text-sm text-slate-400">No outgoing requests.</p>}
          {outgoing.map((request) => (
            <FriendRequestRow
              key={request.id}
              mode="outgoing"
              request={request}
              loading={loadingId === request.id}
              onCancel={(id) => onAction(id, 'cancel')}
            />
          ))}
        </CardContent>
      </Card>
    </>
  )
}
