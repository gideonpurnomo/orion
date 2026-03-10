// XP and Leveling System

export interface LevelInfo {
  level: number
  xpRequired: number
  xpTotal: number
  title: string
  badge: string
}

// Level thresholds - XP needed to reach each level
const LEVEL_THRESHOLDS: Record<number, { xp: number; title: string; badge: string }> = {
  1: { xp: 0, title: 'Novice', badge: '🌱' },
  2: { xp: 100, title: 'Explorer', badge: '🌿' },
  3: { xp: 300, title: 'Apprentice', badge: '🌱' },
  4: { xp: 600, title: 'Scholar', badge: '📚' },
  5: { xp: 1000, title: 'Student', badge: '🎓' },
  6: { xp: 1500, title: 'Practitioner', badge: '✏️' },
  7: { xp: 2200, title: 'Enthusiast', badge: '⚡' },
  8: { xp: 3000, title: 'Dedicated', badge: '🔥' },
  9: { xp: 4000, title: 'Achiever', badge: '🏆' },
  10: { xp: 5200, title: 'Expert', badge: '🌟' },
  11: { xp: 6500, title: 'Specialist', badge: '🎯' },
  12: { xp: 8000, title: 'Master', badge: '👑' },
  13: { xp: 10000, title: 'Grandmaster', badge: '👑' },
  14: { xp: 12500, title: 'Legend', badge: '⭐' },
  15: { xp: 15000, title: 'Champion', badge: '🏆' },
  16: { xp: 18000, title: 'Elite', badge: '👑' },
  17: { xp: 22000, title: 'Virtuoso', badge: '🌟' },
  18: { xp: 26000, title: 'Pro', badge: '⚡' },
  19: { xp: 30000, title: 'Veteran', badge: '🏆' },
  20: { xp: 35000, title: 'Titan', badge: '⚔️' },
  21: { xp: 40000, title: 'Immortal', badge: '👑' },
  22: { xp: 46000, title: 'Celestial', badge: '🌟' },
  23: { xp: 52000, title: 'Divine', badge: '✨' },
  24: { xp: 60000, title: 'Supreme', badge: '👑' },
  25: { xp: 70000, title: 'Transcendent', badge: '🌟' },
  26: { xp: 80000, title: 'Infinite', badge: '♾️' },
  27: { xp: 95000, title: 'Omniscient', badge: '🔮' },
  28: { xp: 110000, title: 'Cosmic', badge: '🌌' },
  29: { xp: 130000, title: 'Eternal', badge: '♾️' },
  30: { xp: 150000, title: 'Legendary', badge: '🏆' },
  31: { xp: 180000, title: 'Mythic', badge: '⚔️' },
  32: { xp: 210000, title: 'Ascended', badge: '✨' },
  33: { xp: 250000, title: 'Transcended', badge: '🌟' },
  34: { xp: 300000, title: 'Enlightened', badge: '🔮' },
  35: { xp: 350000, title: 'Omnipotent', badge: '♾️' },
  36: { xp: 400000, title: 'Supreme Being', badge: '👑' },
  37: { xp: 460000, title: 'Beyond Mortal', badge: '⚡' },
  38: { xp: 530000, title: 'The One', badge: '🌟' },
  39: { xp: 600000, title: 'Infinity', badge: '♾️' },
  40: { xp: 700000, title: 'Beyond Time', badge: '🔮' },
  41: { xp: 800000, title: 'Reality Bender', badge: '⚔️' },
  42: { xp: 900000, title: 'Existence', badge: '✨' },
  43: { xp: 1000000, title: 'The Absolute', badge: '🌟' },
  44: { xp: 1200000, title: 'Void Walker', badge: '🌌' },
  45: { xp: 1400000, title: 'Time Lord', badge: '⏰' },
  46: { xp: 1600000, title: 'Multiverse', badge: '🌌' },
  47: { xp: 1800000, title: 'Dimension King', badge: '👑' },
  48: { xp: 2000000, title: 'Reality Architect', badge: '⚔️' },
  49: { xp: 2500000, title: 'Cosmic Architect', badge: '🌟' },
  50: { xp: 3000000, title: 'The Final', badge: '♾️' },
}

// Calculate level from total XP
export function calculateLevel(xp: number): LevelInfo {
  let level = 1
  let xpRequired = 0

  for (let l = 1; l <= 50; l++) {
    const threshold = LEVEL_THRESHOLDS[l]?.xp ?? LEVEL_THRESHOLDS[50].xp
    if (xp < threshold) {
      break
    }
    level = l
    xpRequired = threshold
  }

  const levelInfo = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[50]

  return {
    level,
    xpRequired: levelInfo.xp,
    xpTotal: xp,
    title: levelInfo.title,
    badge: levelInfo.badge,
  }
}

// XP rewards for completing activities
export function getXPReward(difficulty: number, duration: number): number {
  const difficultyMultiplier = 1 + (difficulty / 10) // 1.0x to 2.0x
  const durationMultiplier = Math.min(duration / 30, 3) // Max 3x for long sessions
  const baseXP = 10

  return Math.round(baseXP * difficultyMultiplier * durationMultiplier)
}

// Format XP for display
export function formatXP(xp: number): string {
  return xp.toLocaleString()
}

// Get progress percentage to next level
export function getLevelProgress(currentXP: number, currentLevel: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel]?.xp ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1]?.xp ?? currentThreshold
  const range = nextThreshold - currentThreshold
  const progress = currentXP - currentThreshold

  return Math.min(Math.max((progress / range) * 100, 0), 100)
}
