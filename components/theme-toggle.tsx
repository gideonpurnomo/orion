'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, ChevronDown } from 'lucide-react'

const THEMES = [
  { name: 'Luminary', label: 'Luminary', colors: ['#f59e0b', '#fbbf24'] },
  { name: 'Sunrise', label: 'Sunrise', colors: ['#f97316', '#fb923c'] },
  { name: 'Nebula', label: 'Nebula', colors: ['#8b5cf6', '#a78bfa'] },
  { name: 'Aurora', label: 'Aurora', colors: ['#06b6d4', '#22d3ee'] },
  { name: 'Forest', label: 'Forest', colors: ['#10b981', '#34d399'] },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)

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

  const isDark = theme === 'dark'
  const currentCustomTheme = THEMES.find(t => t.name === theme)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        aria-label="Change theme"
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-yellow-400" />
        ) : currentCustomTheme ? (
          <span
            className="inline-block h-4 w-4 rounded-full"
            style={{ background: `linear-gradient(135deg, ${currentCustomTheme.colors[0]}, ${currentCustomTheme.colors[1]})` }}
          />
        ) : (
          <Sun className="h-4 w-4 text-slate-600" />
        )}
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
          {currentCustomTheme?.label || (isDark ? 'Dark' : 'Light')}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {/* Light/Dark modes */}
            <button
              onClick={() => { setTheme('light'); setOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                theme === 'light' ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              onClick={() => { setTheme('dark'); setOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                theme === 'dark' ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>

            <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

            {/* Custom themes */}
            {THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => { setTheme(t.name); setOpen(false) }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  theme === t.name ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full border border-slate-200 dark:border-slate-600"
                  style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
                />
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
