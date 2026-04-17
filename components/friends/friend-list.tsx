import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FriendRow } from '@/components/friends/friend-row'
import type { FriendRecord } from '@/components/friends/types'

interface FriendListProps {
  friends: FriendRecord[]
  loading: boolean
  loadingId: string | null
  onRemove: (friendId: string) => void
  onViewSchedule?: (friendId: string, friendName: string) => void
}

export function FriendList({ friends, loading, loadingId, onRemove, onViewSchedule }: FriendListProps) {
  return (
    <Card className="border-slate-700 bg-slate-800 lg:col-span-1">
      <CardHeader>
        <CardTitle>Friends</CardTitle>
        <CardDescription>{friends.length} total</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!loading && friends.length === 0 && <p className="text-sm text-slate-400">No friends yet.</p>}
        {friends.map((friend) => (
          <FriendRow
            key={friend.id}
            user={friend.user}
            createdAt={friend.createdAt}
            isRemoving={loadingId === friend.user.id}
            onRemove={onRemove}
            onViewSchedule={onViewSchedule}
          />
        ))}
      </CardContent>
    </Card>
  )
}
