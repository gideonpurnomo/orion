'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { ChevronDown } from 'lucide-react'

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
      <button className="rounded-md border border-slate-700 bg-slate-800 p-2 hover:bg-slate-700">
        <span className="inline-block h-5 w-5 rounded-full bg-amber-500" />
      </button>
    )
  }

  const currentTheme = THEMES.find(t => t.name === theme)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 hover:bg-slate-700"
        aria-label="Change theme"
      >
        <span
          className="inline-block h-4 w-4 rounded-full"
          style={{ background: `linear-gradient(135deg, ${currentTheme?.colors[0] || '#f59e0b'}, ${currentTheme?.colors[1] || '#fbbf24'})` }}
        />
        <span className="text-xs font-medium text-slate-200 hidden sm:inline">
          {currentTheme?.label || 'Luminary'}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-lg">
            {THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => { setTheme(t.name); setOpen(false) }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-700 ${
                  theme === t.name ? 'bg-slate-700 font-medium text-slate-100' : 'text-slate-300'
                }`}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full border border-slate-600"
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
