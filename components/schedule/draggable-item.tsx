'use client'

import { useDraggable } from '@dnd-kit/core'
import { Copy, Clock } from 'lucide-react'
import type { ScheduleItem } from '@/types/schedule'

interface DraggableItemProps {
  item: ScheduleItem
  getStatusColor: (status: string) => string
  getItemIcon: (item: ScheduleItem) => string
  getItemTitle: (item: ScheduleItem) => string
  getItemDuration: (item: ScheduleItem) => number
  formatDuration: (minutes: number) => string
  onActivityClick: (item: ScheduleItem) => void
  onCopyActivity: (item: ScheduleItem) => void
  onContextMenu?: (e: React.MouseEvent, item: ScheduleItem) => void
  isDragging?: boolean
}

export function DraggableItem({
  item,
  getStatusColor,
  getItemIcon,
  getItemTitle,
  getItemDuration,
  formatDuration,
  onActivityClick,
  onCopyActivity,
  onContextMenu,
  isDragging,
}: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation()
        onActivityClick(item)
      }}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault()
          e.stopPropagation()
          onContextMenu(e, item)
        }
      }}
      className={`w-full rounded border p-2 text-left text-sm transition-opacity ${getStatusColor(item.status)} ${isDragging ? 'opacity-40' : 'hover:opacity-90'}`}
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
        {formatDuration(getItemDuration(item))}
      </div>
    </button>
  )
}
