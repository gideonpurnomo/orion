'use client'

import React, { useEffect, useRef } from 'react'
import {
  CheckCircle2,
  Copy,
  CalendarClock,
  Trash2,
  Plus,
  ClipboardPaste,
} from 'lucide-react'
import type { ScheduleItem, ClipboardActivity } from '@/types/schedule'

export interface ContextMenuTarget {
  x: number
  y: number
  item?: ScheduleItem
  cellDate?: Date
}

interface ScheduleContextMenuProps {
  target: ContextMenuTarget
  clipboardActivity: ClipboardActivity | null
  onActivityAction: (action: 'complete' | 'copy' | 'moveToday' | 'delete', item: ScheduleItem) => void
  onCellAction: (action: 'add' | 'paste', date: Date) => void
  onClose: () => void
}

export function ScheduleContextMenu({
  target,
  clipboardActivity,
  onActivityAction,
  onCellAction,
  onClose,
}: ScheduleContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleScroll = () => onClose()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Position: ensure menu stays within viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(target.x, window.innerWidth - 200),
    top: Math.min(target.y, window.innerHeight - 250),
    zIndex: 100,
  }

  if (target.item) {
    const item = target.item
    return (
      <div ref={menuRef} style={style} className="w-48 rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl animate-fade-slide-in">
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-slate-700"
          onClick={() => { onActivityAction('complete', item); onClose() }}
        >
          <CheckCircle2 className="h-4 w-4" /> Complete
        </button>
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
          onClick={() => { onActivityAction('copy', item); onClose() }}
        >
          <Copy className="h-4 w-4" /> Copy
        </button>
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700"
          onClick={() => { onActivityAction('moveToday', item); onClose() }}
        >
          <CalendarClock className="h-4 w-4" /> Move to Today
        </button>
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700"
          onClick={() => { onActivityAction('delete', item); onClose() }}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    )
  }

  if (target.cellDate) {
    const date = target.cellDate
    return (
      <div ref={menuRef} style={style} className="w-48 rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl animate-fade-slide-in">
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
          onClick={() => { onCellAction('add', date); onClose() }}
        >
          <Plus className="h-4 w-4" /> Quick Add
        </button>
        {clipboardActivity && (
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700"
            onClick={() => { onCellAction('paste', date); onClose() }}
          >
            <ClipboardPaste className="h-4 w-4" /> Paste ({clipboardActivity.title})
          </button>
        )}
      </div>
    )
  }

  return null
}
