'use client'

import { useEffect, useRef } from 'react'

interface KeyboardShortcutsProps {
  onSlash?: () => void
  onEscape?: () => void
}

export default function KeyboardShortcuts({ onSlash, onEscape }: KeyboardShortcutsProps) {
  const isActive = useRef(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === '/' && isActive.current && onSlash) {
        event.preventDefault()
        onSlash()
      }

      if (event.key === 'Escape' && isActive.current && onEscape) {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSlash, onEscape])

  return null
}
