import { Progress } from '@/components/ui/progress'
import { type LevelInfo } from '@/lib/xp'

interface LevelBadgeProps {
  levelInfo: LevelInfo
  progressToNext: number
  xp: number
  formattedXP: string
}

export function LevelBadge({ levelInfo, progressToNext, xp, formattedXP }: LevelBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 shadow-lg dark:from-amber-900/30 dark:to-orange-900/30 dark:border dark:border-amber-700/50">
      {/* Badge & Level */}
      <div className="flex items-center gap-3">
        <div className="text-4xl">{levelInfo.badge}</div>
        <div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Level {levelInfo.level}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">{levelInfo.title}</div>
        </div>
      </div>

      {/* XP & Progress */}
      <div className="flex-1 min-w-[150px]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-300">Total XP</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formattedXP}</span>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Next: Level {levelInfo.level + 1}
            </span>
            <span className="text-slate-700 dark:text-slate-200">
              {progressToNext}%
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>
      </div>
    </div>
  )
}
