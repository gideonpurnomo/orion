import { formatDuration, getDifficultyColor, getDifficultyLabel } from '@/lib/utils'

describe('formatDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(15)).toBe('15m')
    expect(formatDuration(59)).toBe('59m')
  })

  it('formats exact hours', () => {
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats hours with minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(75)).toBe('1h 15m')
  })
})

describe('getDifficultyColor', () => {
  it('returns green for easy (1-3)', () => {
    expect(getDifficultyColor(1)).toContain('green')
    expect(getDifficultyColor(3)).toContain('green')
  })

  it('returns yellow for intermediate (4-6)', () => {
    expect(getDifficultyColor(4)).toContain('yellow')
    expect(getDifficultyColor(6)).toContain('yellow')
  })

  it('returns orange for advanced (7-8)', () => {
    expect(getDifficultyColor(7)).toContain('orange')
    expect(getDifficultyColor(8)).toContain('orange')
  })

  it('returns red for expert (9-10)', () => {
    expect(getDifficultyColor(9)).toContain('red')
    expect(getDifficultyColor(10)).toContain('red')
  })
})

describe('getDifficultyLabel', () => {
  it('returns Beginner for 1-3', () => {
    expect(getDifficultyLabel(1)).toBe('Beginner')
    expect(getDifficultyLabel(3)).toBe('Beginner')
  })

  it('returns Intermediate for 4-6', () => {
    expect(getDifficultyLabel(4)).toBe('Intermediate')
    expect(getDifficultyLabel(6)).toBe('Intermediate')
  })

  it('returns Advanced for 7-8', () => {
    expect(getDifficultyLabel(7)).toBe('Advanced')
    expect(getDifficultyLabel(8)).toBe('Advanced')
  })

  it('returns Expert for 9-10', () => {
    expect(getDifficultyLabel(9)).toBe('Expert')
    expect(getDifficultyLabel(10)).toBe('Expert')
  })
})
