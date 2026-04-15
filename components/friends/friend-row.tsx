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
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="font-medium text-slate-900">{user.name || user.email}</p>
        <p className="text-sm text-slate-500">{user.email}</p>
        <p className="text-xs text-slate-400 mt-1">Friends since {new Date(createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center gap-2">
        {onViewSchedule && (
          <Button
            variant="outline"
            onClick={() => onViewSchedule(user.id, user.name || user.email)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Calendar className="mr-1 h-4 w-4" />
            Schedule
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onRemove(user.id)}
          disabled={isRemoving}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </Button>
      </div>
    </div>
  )
}
