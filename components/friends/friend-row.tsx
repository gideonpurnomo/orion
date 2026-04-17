import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface FriendUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface FriendRowProps {
  user: FriendUser
  createdAt: string
  onRemove: (friendId: string) => void
  onViewSchedule?: (friendId: string, friendName: string) => void
  isRemoving?: boolean
}

export function FriendRow({ user, createdAt, onRemove, onViewSchedule, isRemoving = false }: FriendRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div>
        <p className="font-medium text-slate-100">{user.name || user.email}</p>
        <p className="text-sm text-slate-400">{user.email}</p>
        <p className="text-xs text-slate-500 mt-1">Friends since {new Date(createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center gap-2">
        {onViewSchedule && (
          <Button
            variant="outline"
            onClick={() => onViewSchedule(user.id, user.name || user.email)}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <Calendar className="mr-1 h-4 w-4" />
            Schedule
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onRemove(user.id)}
          disabled={isRemoving}
          className="border-red-800 text-red-400 hover:bg-red-950/30"
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </Button>
      </div>
    </div>
  )
}
