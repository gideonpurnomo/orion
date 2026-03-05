import Leaderboard from '@/components/leaderboard'
import TopNav from '@/components/top-nav'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopNav theme="light" />
      <Leaderboard />
    </div>
  )
}
