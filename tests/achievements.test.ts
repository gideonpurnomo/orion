import { checkAchievements, getAchievementById, ACHIEVEMENTS, UserStats } from '@/lib/achievements'

const baseStats: UserStats = {
  totalCompleted: 0,
  totalScheduled: 0,
  streak: 0,
  xp: 0,
  level: 1,
  completedByDomain: {},
}

describe('checkAchievements', () => {
  it('returns first_step for 1 completed activity', () => {
    const stats = { ...baseStats, totalCompleted: 1 }
    const newAchievements = checkAchievements(stats, [])
    const firstStep = newAchievements.find((a) => a.id === 'first_activity')
    expect(firstStep).toBeDefined()
    expect(firstStep!.xpReward).toBe(50)
  })

  it('excludes already earned achievements', () => {
    const stats = { ...baseStats, totalCompleted: 1 }
    const newAchievements = checkAchievements(stats, ['first_activity'])
    expect(newAchievements.find((a) => a.id === 'first_activity')).toBeUndefined()
  })

  it('returns streak achievements when streak is high enough', () => {
    const stats = { ...baseStats, streak: 7 }
    const newAchievements = checkAchievements(stats, [])
    const streak3 = newAchievements.find((a) => a.id === 'streak_3')
    const streak7 = newAchievements.find((a) => a.id === 'streak_7')
    expect(streak3).toBeDefined()
    expect(streak7).toBeDefined()
  })

  it('returns no achievements for fresh user', () => {
    const newAchievements = checkAchievements(baseStats, [])
    expect(newAchievements).toHaveLength(0)
  })

  it('returns level achievements', () => {
    const stats = { ...baseStats, level: 10 }
    const newAchievements = checkAchievements(stats, [])
    const level5 = newAchievements.find((a) => a.id === 'level_5')
    const level10 = newAchievements.find((a) => a.id === 'level_10')
    expect(level5).toBeDefined()
    expect(level10).toBeDefined()
  })

  it('returns XP achievements', () => {
    const stats = { ...baseStats, xp: 5000 }
    const newAchievements = checkAchievements(stats, [])
    const xp1k = newAchievements.find((a) => a.id === 'xp_1000')
    const xp5k = newAchievements.find((a) => a.id === 'xp_5000')
    expect(xp1k).toBeDefined()
    expect(xp5k).toBeDefined()
  })

  it('returns completion rate achievements', () => {
    const stats: UserStats = { ...baseStats, totalCompleted: 18, totalScheduled: 20 }
    const newAchievements = checkAchievements(stats, [])
    const rate80 = newAchievements.find((a) => a.id === 'completion_rate_80')
    expect(rate80).toBeDefined()
  })

  it('does not return completion rate when totalScheduled < minimum', () => {
    const stats: UserStats = { ...baseStats, totalCompleted: 9, totalScheduled: 9 }
    const newAchievements = checkAchievements(stats, [])
    const rate80 = newAchievements.find((a) => a.id === 'completion_rate_80')
    expect(rate80).toBeUndefined()
  })

  it('returns domain achievements', () => {
    const stats: UserStats = { ...baseStats, completedByDomain: { programming: 10 } }
    const newAchievements = checkAchievements(stats, [])
    const codeMaster = newAchievements.find((a) => a.id === 'code_master')
    expect(codeMaster).toBeDefined()
  })
})

describe('getAchievementById', () => {
  it('returns the correct achievement', () => {
    const achievement = getAchievementById('first_activity')
    expect(achievement).toBeDefined()
    expect(achievement!.title).toBe('First Step')
  })

  it('returns undefined for unknown id', () => {
    expect(getAchievementById('nonexistent')).toBeUndefined()
  })
})

describe('ACHIEVEMENTS', () => {
  it('has unique IDs', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all achievements have required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy()
      expect(a.title).toBeTruthy()
      expect(a.description).toBeTruthy()
      expect(a.icon).toBeTruthy()
      expect(typeof a.xpReward).toBe('number')
      expect(typeof a.check).toBe('function')
    }
  })
})
