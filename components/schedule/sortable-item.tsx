'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, Clock } from 'lucide-react'
import type { ScheduleItem } from '@/types/schedule'

interface SortableItemProps {
  item: ScheduleItem
  getStatusColor: (status: string) => string
  getItemIcon: (item: ScheduleItem) => string
  getItemTitle: (item: ScheduleItem) => string
  getItemDuration: (item: ScheduleItem) => number
  formatDuration: (minutes: number) => string
  onActivityClick: (item: ScheduleItem) => void
  onCopyActivity: (item: ScheduleItem) => void
  onContextMenu?: (e: React.MouseEvent, item: ScheduleItem) => void
}

export function SortableItem({
  item,
  getStatusColor,
  getItemIcon,
  getItemTitle,
  getItemDuration,
  formatDuration,
  onActivityClick,
  onCopyActivity,
  onContextMenu,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { item } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        onClick={() => onActivityClick(item)}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.preventDefault()
            onContextMenu(e, item)
          }
        }}
        className={`w-full rounded border p-3 text-left text-sm ${getStatusColor(item.status)} hover:opacity-90`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="truncate font-medium">{getItemIcon(item)} {getItemTitle(item)}</div>
          <span
            onClick={(e) => {
              e.stopPropagation()
              onCopyActivity(item)
            }}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-700/70 text-slate-400 hover:bg-slate-700"
          >
            <Copy className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
          <Clock className="h-3 w-3" />
          {new Date(item.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          {' · '}
          {formatDuration(getItemDuration(item))}
        </div>
      </button>
    </div>
  )
}
