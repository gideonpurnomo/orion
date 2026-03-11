'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

// Map custom themes to next-themes values
const THEME_MAP: Record<string, 'light' | 'dark'> = {
  'Sunrise': 'light',
  'Forest': 'light',
  'Nebula': 'light',
  'Aurora': 'light',
  // Default to dark for our custom themes
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50">
        <Sun className="h-5 w-5 text-slate-600" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(THEME_MAP[theme] || (theme === 'dark' ? 'light' : 'dark'))}
      className="rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      aria-label="Toggle theme"
    >
      {theme === 'dark' || THEME_MAP[theme] === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </button>
  )
}
