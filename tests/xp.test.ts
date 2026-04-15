import { calculateLevel, getXPReward, formatXP, getLevelProgress } from '@/lib/xp'

describe('calculateLevel', () => {
  it('returns level 1 for 0 XP', () => {
    const info = calculateLevel(0)
    expect(info.level).toBe(1)
    expect(info.title).toBe('Novice')
  })

  it('returns level 2 for 100 XP', () => {
    const info = calculateLevel(100)
    expect(info.level).toBe(2)
    expect(info.title).toBe('Explorer')
  })

  it('returns level 5 for 1000 XP', () => {
    const info = calculateLevel(1000)
    expect(info.level).toBe(5)
    expect(info.title).toBe('Student')
  })

  it('returns level 10 for 5200 XP', () => {
    const info = calculateLevel(5200)
    expect(info.level).toBe(10)
    expect(info.title).toBe('Expert')
  })

  it('returns level 20 for 35000 XP', () => {
    const info = calculateLevel(35000)
    expect(info.level).toBe(20)
    expect(info.title).toBe('Titan')
  })

  it('caps at max defined level for very high XP', () => {
    const info = calculateLevel(99999999)
    expect(info.level).toBeLessThanOrEqual(50)
  })
})

describe('getXPReward', () => {
  it('returns base XP for difficulty 0, 30 min', () => {
    expect(getXPReward(0, 30)).toBe(10) // 10 * 1.0 * 1.0
  })

  it('scales with difficulty', () => {
    const easy = getXPReward(2, 30)
    const hard = getXPReward(8, 30)
    expect(hard).toBeGreaterThan(easy)
  })

  it('scales with duration up to 3x', () => {
    const short = getXPReward(5, 15)
    const long = getXPReward(5, 60)
    expect(long).toBeGreaterThan(short)
  })

  it('caps duration multiplier at 3x', () => {
    const veryLong = getXPReward(5, 999)
    const long = getXPReward(5, 90)
    expect(veryLong).toBe(long)
  })
})

describe('formatXP', () => {
  it('formats small numbers', () => {
    expect(formatXP(0)).toBe('0')
    expect(formatXP(500)).toBe('500')
  })

  it('formats large numbers with commas', () => {
    expect(formatXP(1000)).toBe('1,000')
    expect(formatXP(50000)).toBe('50,000')
  })
})

describe('getLevelProgress', () => {
  it('returns 0 at level start', () => {
    expect(getLevelProgress(0, 1)).toBe(0)
  })

  it('returns 100 at max level', () => {
    expect(getLevelProgress(99999999, 50)).toBe(100)
  })

  it('returns percentage between levels', () => {
    // Level 1 threshold: 0, Level 2 threshold: 100
    const progress = getLevelProgress(50, 1)
    expect(progress).toBe(50)
  })
})
