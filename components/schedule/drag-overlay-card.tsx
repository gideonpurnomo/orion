'use client'

import { Copy, Clock } from 'lucide-react'
import type { ScheduleItem } from '@/types/schedule'

interface DragOverlayCardProps {
  item: ScheduleItem
  getItemIcon: (item: ScheduleItem) => string
  getItemTitle: (item: ScheduleItem) => string
  getItemDuration: (item: ScheduleItem) => number
  formatDuration: (minutes: number) => string
  getStatusColor: (status: string) => string
}

export function DragOverlayCard({
  item,
  getItemIcon,
  getItemTitle,
  getItemDuration,
  formatDuration,
  getStatusColor,
}: DragOverlayCardProps) {
  return (
    <div
      className={`w-48 rounded-lg border p-3 text-sm shadow-xl ring-2 ring-blue-400 ${getStatusColor(item.status)}`}
      style={{
        transform: 'scale(1.05) rotate(1deg)',
        opacity: 0.95,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="truncate font-medium">{getItemIcon(item)} {getItemTitle(item)}</div>
        <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
        <Clock className="h-3 w-3" />
        {formatDuration(getItemDuration(item))}
      </div>
    </div>
  )
}
