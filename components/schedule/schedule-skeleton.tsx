'use client'

export function WeekSkeleton() {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="hidden md:block">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 gap-2">
          <div className="py-2 text-sm font-semibold text-slate-500">Time</div>
          {days.map((label) => (
            <div key={label} className="rounded bg-slate-700/50 py-2 text-center text-sm font-semibold text-slate-400 animate-pulse">
              {label}
            </div>
          ))}

          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="py-3 pr-2 text-right text-sm text-slate-500">{hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? 'PM' : 'AM'}</div>
              {days.map((label) => (
                <div
                  key={`${hour}-${label}`}
                  className="min-h-[72px] rounded-lg border border-slate-700 bg-slate-800/50 p-2 animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DaySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-700" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-slate-700" />
              <div className="h-3 w-24 rounded bg-slate-700" />
            </div>
          </div>
          <div className="h-6 w-16 rounded bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

export function MonthSkeleton() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((label) => (
        <div key={label} className="py-2 text-center text-sm font-semibold text-slate-500">{label}</div>
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="min-h-[90px] rounded-lg border border-slate-700 bg-slate-800/50 p-2 animate-pulse"
        >
          <div className="h-4 w-6 rounded bg-slate-700" />
        </div>
      ))}
    </div>
  )
}
