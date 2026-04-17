'use client'

import { useDroppable } from '@dnd-kit/core'
import React from 'react'

interface DroppableCellProps {
  cellId: string
  isOver: boolean
  isDragging: boolean
  isEmpty: boolean
  onClick: () => void
  children: React.ReactNode
}

export function DroppableCell({
  cellId,
  isOver,
  isDragging,
  isEmpty,
  onClick,
  children,
}: DroppableCellProps) {
  const { setNodeRef } = useDroppable({ id: cellId })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`relative min-h-[72px] rounded-lg border p-2 transition-all ${
        isOver
          ? 'ring-2 ring-blue-400 bg-blue-950/40 border-blue-500'
          : isDragging
            ? 'ring-1 ring-blue-300/40 border-slate-700'
            : 'border-slate-700'
      } ${
        isEmpty
          ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-950/30'
          : 'hover:border-blue-500 hover:bg-blue-950/30'
      }`}
    >
      {children}
    </div>
  )
}
