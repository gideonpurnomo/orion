import { Button } from '@/components/ui/button'

interface RequestUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface FriendRequest {
  id: string
  createdAt: string
  message?: string | null
  sender?: RequestUser
  receiver?: RequestUser
}

interface FriendRequestRowProps {
  mode: 'incoming' | 'outgoing'
  request: FriendRequest
  onAccept?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onCancel?: (requestId: string) => void
  loading?: boolean
}

export function FriendRequestRow({
  mode,
  request,
  onAccept,
  onReject,
  onCancel,
  loading = false,
}: FriendRequestRowProps) {
  const user = mode === 'incoming' ? request.sender : request.receiver

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="font-medium text-slate-900">{user?.name || user?.email}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
        <p className="text-xs text-slate-400 mt-1">Requested {new Date(request.createdAt).toLocaleDateString()}</p>
        {request.message && <p className="text-xs text-slate-500 mt-2">{request.message}</p>}
      </div>

      {mode === 'incoming' ? (
        <div className="flex gap-2">
          <Button onClick={() => onAccept?.(request.id)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            Accept
          </Button>
          <Button variant="outline" onClick={() => onReject?.(request.id)} disabled={loading}>
            Reject
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => onCancel?.(request.id)} disabled={loading}>
          Cancel
        </Button>
      )}
    </div>
  )
}
