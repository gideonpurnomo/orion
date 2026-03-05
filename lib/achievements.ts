// Achievement definitions and checking logic

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  check: (userStats: UserStats) => boolean
}

export interface UserStats {
  totalCompleted: number
  totalScheduled: number
  streak: number
  xp: number
  level: number
  // Domain stats
  completedByDomain: Record<string, number>
}

// Achievement definitions
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // First Steps
  {
    id: 'first_activity',
    title: 'First Step',
    description: 'Complete your first activity',
    icon: '👣',
    xpReward: 50,
    check: (stats) => stats.totalCompleted >= 1,
  },
  {
    id: 'first_5_activities',
    title: 'Getting Started',
    description: 'Complete 5 activities',
    icon: '🌱',
    xpReward: 100,
    check: (stats) => stats.totalCompleted >= 5,
  },
  {
    id: 'first_week',
    title: 'First Week',
    description: 'Complete activities on 7 different days',
    icon: '📅',
    xpReward: 200,
    check: (stats) => {
      const daysWithActivity = new Set<string>()
      // This would need actual activity dates, for now using completed count
      return stats.totalCompleted >= 7
    },
  },

  // Streak achievements
  {
    id: 'streak_3',
    title: '3-Day Streak',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xpReward: 150,
    check: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    xpReward: 500,
    check: (stats) => stats.streak >= 7,
  },
  {
    id: 'streak_14',
    title: 'Fortnight Champion',
    description: 'Maintain a 14-day streak',
    icon: '🏆',
    xpReward: 1000,
    check: (stats) => stats.streak >= 14,
  },
  {
    id: 'streak_30',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpReward: 2500,
    check: (stats) => stats.streak >= 30,
  },

  // Activity count achievements
  {
    id: 'activities_10',
    title: 'Dedicated',
    description: 'Complete 10 activities',
    icon: '✏️',
    xpReward: 200,
    check: (stats) => stats.totalCompleted >= 10,
  },
  {
    id: 'activities_25',
    title: 'Committed',
    description: 'Complete 25 activities',
    icon: '📚',
    xpReward: 500,
    check: (stats) => stats.totalCompleted >= 25,
  },
  {
    id: 'activities_50',
    title: 'Enthusiast',
    description: 'Complete 50 activities',
    icon: '⚡',
    xpReward: 1000,
    check: (stats) => stats.totalCompleted >= 50,
  },
  {
    id: 'activities_100',
    title: 'Achiever',
    description: 'Complete 100 activities',
    icon: '🎯',
    xpReward: 2500,
    check: (stats) => stats.totalCompleted >= 100,
  },
  {
    id: 'activities_250',
    title: 'Master',
    description: 'Complete 250 activities',
    icon: '🌟',
    xpReward: 5000,
    check: (stats) => stats.totalCompleted >= 250,
  },

  // Level achievements
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '🌟',
    xpReward: 100,
    check: (stats) => stats.level >= 5,
  },
  {
    id: 'level_10',
    title: 'Expert',
    description: 'Reach level 10',
    icon: '🎓',
    xpReward: 500,
    check: (stats) => stats.level >= 10,
  },
  {
    id: 'level_20',
    title: 'Grandmaster',
    description: 'Reach level 20',
    icon: '🏆',
    xpReward: 2000,
    check: (stats) => stats.level >= 20,
  },
  {
    id: 'level_30',
    title: 'Legend',
    description: 'Reach level 30',
    icon: '⚔️',
    xpReward: 5000,
    check: (stats) => stats.level >= 30,
  },

  // XP achievements
  {
    id: 'xp_1000',
    title: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    icon: '💎',
    xpReward: 200,
    check: (stats) => stats.xp >= 1000,
  },
  {
    id: 'xp_5000',
    title: 'XP Master',
    description: 'Earn 5,000 total XP',
    icon: '💰',
    xpReward: 500,
    check: (stats) => stats.xp >= 5000,
  },
  {
    id: 'xp_10000',
    title: 'XP Legend',
    description: 'Earn 10,000 total XP',
    icon: '🏆',
    xpReward: 1000,
    check: (stats) => stats.xp >= 10000,
  },
  {
    id: 'xp_50000',
    title: 'XP Titan',
    description: 'Earn 50,000 total XP',
    icon: '🌟',
    xpReward: 5000,
    check: (stats) => stats.xp >= 50000,
  },

  // Completion rate achievements
  {
    id: 'completion_rate_80',
    title: 'Consistent',
    description: 'Complete 80% of scheduled activities (min 10)',
    icon: '📊',
    xpReward: 300,
    check: (stats) => {
      if (stats.totalScheduled < 10) return false
      return (stats.totalCompleted / stats.totalScheduled) >= 0.8
    },
  },
  {
    id: 'completion_rate_90',
    title: 'Dedicated',
    description: 'Complete 90% of scheduled activities (min 20)',
    icon: '📈',
    xpReward: 500,
    check: (stats) => {
      if (stats.totalScheduled < 20) return false
      return (stats.totalCompleted / stats.totalScheduled) >= 0.9
    },
  },

  // Domain-specific achievements (examples)
  {
    id: 'code_master',
    title: 'Code Master',
    description: 'Complete 10 programming activities',
    icon: '💻',
    xpReward: 300,
    check: (stats) => {
      return (stats.completedByDomain['programming'] || 0) >= 10
    },
  },
  {
    id: 'language_learner',
    title: 'Polyglot',
    description: 'Complete 5 language learning activities',
    icon: '🌍',
    xpReward: 250,
    check: (stats) => {
      const langDomains = ['languages', 'programming'] // Assuming programming covers languages too
      const total = langDomains.reduce((sum, domain) => sum + (stats.completedByDomain[domain] || 0), 0)
      return total >= 5
    },
  },
  {
    id: 'fitness fanatic',
    title: 'Fitness Fanatic',
    description: 'Complete 15 fitness activities',
    icon: '🏋️',
    xpReward: 500,
    check: (stats) => {
      return (stats.completedByDomain['fitness'] || 0) >= 15
    },
  },
]

// Get achievements user qualifies for
export function checkAchievements(userStats: UserStats, earnedAchievementTypes: string[]): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(achievement => {
    // Skip if already earned
    if (earnedAchievementTypes.includes(achievement.id)) {
      return false
    }
    // Check if user qualifies
    return achievement.check(userStats)
  })
}

// Get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}
