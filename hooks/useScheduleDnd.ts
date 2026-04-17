'use client'

import { useState, useCallback } from 'react'
import {
  DndContextProps,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core'
import type { ScheduleItem } from '@/types/schedule'

function parseCellId(cellId: string): Date | null {
  if (!cellId.startsWith('cell-')) return null
  const iso = cellId.slice(5)
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function useScheduleDnd(
  scheduleItems: ScheduleItem[],
  onDrop: (itemId: string, targetDate: Date) => Promise<void>,
  fetchSchedule: () => Promise<void>,
) {
  const [activeItem, setActiveItem] = useState<ScheduleItem | null>(null)
  const [overCellId, setOverCellId] = useState<string | null>(null)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = scheduleItems.find((s) => s.id === event.active.id)
    setActiveItem(item ?? null)
  }, [scheduleItems])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverCellId(over?.id as string ?? null)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)
    setOverCellId(null)

    if (!over) return

    const targetDate = parseCellId(over.id as string)
    if (!targetDate) return

    const itemId = active.id as string
    const item = scheduleItems.find((s) => s.id === itemId)
    if (!item) return

    const sourceDate = new Date(item.scheduledFor)
    if (sourceDate.getTime() === targetDate.getTime()) return

    await onDrop(itemId, targetDate)
  }, [scheduleItems, onDrop])

  const handleDragCancel = useCallback(() => {
    setActiveItem(null)
    setOverCellId(null)
  }, [])

  const dndContextProps: Pick<DndContextProps, 'sensors' | 'collisionDetection' | 'onDragStart' | 'onDragOver' | 'onDragEnd' | 'onDragCancel'> = {
    sensors,
    collisionDetection: pointerWithin,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  }

  return {
    dndContextProps,
    activeItem,
    overCellId,
    isDragging: activeItem !== null,
  }
}
