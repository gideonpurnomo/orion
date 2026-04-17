'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from './theme-toggle'
import { LuminaryLogo } from './luminary-logo'

interface TopNavProps {
  theme?: 'light' | 'blue' | 'green' | 'dark'
}

export default function TopNav({ theme = 'light' }: TopNavProps) {
  const { data: session, status } = useSession()
  const isSignedIn = !!session?.user

  const wrapperClass =
    theme === 'blue'
      ? 'border-blue-900 bg-slate-900/85'
      : theme === 'green'
        ? 'border-emerald-900 bg-slate-900/85'
        : 'border-slate-700 bg-slate-900/85'

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur ${wrapperClass}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <LuminaryLogo size="sm" variant="gold" withWordmark />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Home</Link>
          <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Dashboard</Link>
          <Link href="/progress" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Progress</Link>
          <Link href="/library?next=/schedule" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Library</Link>
          <Link href="/schedule" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Schedule</Link>
          <Link href="/pomodoro" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Pomodoro</Link>
          <Link href="/availability" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Availability</Link>
          <Link href="/challenges" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Challenges</Link>
          <Link href="/leaderboard" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Leaderboard</Link>
          <Link href="/friends" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Friends</Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === 'loading' ? (
            <span className="text-xs text-slate-400">Loading...</span>
          ) : isSignedIn ? (
            <details className="relative">
              <summary className="list-none cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700">
                {session.user?.name || session.user?.email || 'Profile'}
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-800 p-2 shadow-lg">
                <p className="px-2 pb-2 text-xs text-slate-400">{session.user?.email}</p>
                <Link href="/settings" className="block rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-slate-700">
                  Settings & Profile
                </Link>
                <Link href="/progress" className="block rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-slate-700">
                  Progress & Analytics
                </Link>
                <Link href="/availability" className="block rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-slate-700">
                  Availability
                </Link>
                <Link href="/challenges" className="block rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-slate-700">
                  Challenges
                </Link>
                <Link href="/friends" className="block rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-slate-700">
                  Friends
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="mt-1 w-full rounded-md px-2 py-2 text-left text-sm text-red-400 hover:bg-red-950/30"
                >
                  Sign Out
                </button>
              </div>
            </details>
          ) : (
            <>
              <Link href="/auth/signin" className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">
                Sign In
              </Link>
              <Link href="/auth/signup" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
