'use client'

import React from 'react'
import { DroppableCell } from './droppable-cell'
import { DraggableItem } from './draggable-item'
import type { ScheduleItem } from '@/types/schedule'

interface WeekGridProps {
  hours: number[]
  weekDays: Date[]
  weekDayLabels: string[]
  scheduleItems: ScheduleItem[]
  isDragging: boolean
  overCellId: string | null
  currentTime: Date | null
  getStatusColor: (status: string) => string
  getItemIcon: (item: ScheduleItem) => string
  getItemTitle: (item: ScheduleItem) => string
  getItemDuration: (item: ScheduleItem) => number
  formatDuration: (minutes: number) => string
  formatHour: (hour24: number) => string
  toCellDate: (baseDate: Date, hour: number, minute?: number) => Date
  onActivityClick: (item: ScheduleItem) => void
  onCopyActivity: (item: ScheduleItem) => void
  onAddToCell: (targetDate: Date) => void
}

export function WeekGrid({
  hours,
  weekDays,
  weekDayLabels,
  scheduleItems,
  isDragging,
  overCellId,
  currentTime,
  getStatusColor,
  getItemIcon,
  getItemTitle,
  getItemDuration,
  formatDuration,
  formatHour,
  toCellDate,
  onActivityClick,
  onCopyActivity,
  onAddToCell,
}: WeekGridProps) {
  // Compute time indicator position
  const timeIndicator = currentTime
    ? (() => {
        const todayStr = currentTime.toDateString()
        const todayIdx = weekDays.findIndex((d) => d.toDateString() === todayStr)
        if (todayIdx === -1) return null
        const h = currentTime.getHours()
        const m = currentTime.getMinutes()
        if (h < hours[0] || h > hours[hours.length - 1]) return null
        const rowIdx = h - hours[0]
        return { colIdx: todayIdx + 1, rowIdx, fraction: m / 60 }
      })()
    : null

  return (
    <div className="hidden md:block overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 gap-2">
          <div className="py-2 text-sm font-semibold text-slate-500">Time</div>
          {weekDays.map((day, index) => (
            <div key={day.toISOString()} className="rounded bg-blue-950/50 py-2 text-center text-sm font-semibold text-blue-300">
              {weekDayLabels[index]}<br />
              <span className="text-xs text-slate-400">{day.getMonth() + 1}/{day.getDate()}</span>
            </div>
          ))}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="py-3 pr-2 text-right text-sm text-slate-500">{formatHour(hour)}</div>
              {weekDays.map((dayDate) => {
                const targetDate = toCellDate(dayDate, hour)
                const cellId = `cell-${targetDate.toISOString()}`
                const itemsInCell = scheduleItems.filter((s) => {
                  const d = new Date(s.scheduledFor)
                  return d.toDateString() === targetDate.toDateString() && d.getHours() === hour
                })

                const isTimeIndicatorCell = timeIndicator
                  && timeIndicator.colIdx === weekDays.indexOf(dayDate) + 1
                  && timeIndicator.rowIdx === hour - hours[0]

                return (
                  <DroppableCell
                    key={cellId}
                    cellId={cellId}
                    isOver={overCellId === cellId}
                    isDragging={isDragging}
                    isEmpty={itemsInCell.length === 0}
                    onClick={() => {
                      if (itemsInCell.length === 0) {
                        onAddToCell(targetDate)
                      }
                    }}
                  >
                    {isTimeIndicatorCell && timeIndicator && (
                      <div
                        className="pointer-events-none absolute left-0 right-0 z-10"
                        style={{ top: `${timeIndicator.fraction * 100}%` }}
                      >
                        <div className="h-[2px] w-full bg-red-500" />
                        <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-red-500" />
                      </div>
                    )}
                    {itemsInCell.length === 0 && (
                      <div className="mt-4 text-center text-[11px] text-slate-400">Click to add</div>
                    )}
                    {itemsInCell.length > 0 && (
                      <div className="space-y-1">
                        {itemsInCell.slice(0, 2).map((item) => (
                          <DraggableItem
                            key={item.id}
                            item={item}
                            getStatusColor={getStatusColor}
                            getItemIcon={getItemIcon}
                            getItemTitle={getItemTitle}
                            getItemDuration={getItemDuration}
                            formatDuration={formatDuration}
                            onActivityClick={onActivityClick}
                            onCopyActivity={onCopyActivity}
                          />
                        ))}
                        {itemsInCell.length > 2 && (
                          <div className="px-1 text-[10px] text-blue-700">+{itemsInCell.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </DroppableCell>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
