'use client'

import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
  onCycleView: () => void
  onToday: () => void
  onToggleHelp: () => void
  onClose: () => void
}

export function useKeyboardShortcuts({
  onCycleView,
  onToday,
  onToggleHelp,
  onClose,
}: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement).isContentEditable) return

      switch (e.key) {
        case 'v':
          e.preventDefault()
          onCycleView()
          break
        case 't':
          e.preventDefault()
          onToday()
          break
        case '?':
          e.preventDefault()
          onToggleHelp()
          break
        case 'Escape':
          onClose()
          break
      }
    },
    [onCycleView, onToday, onToggleHelp, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
