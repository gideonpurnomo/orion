'use client'

import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'
type LogoVariant = 'gold' | 'nebula' | 'aurora' | 'sunrise' | 'forest'

interface LuminaryLogoProps {
  size?: LogoSize
  variant?: LogoVariant
  withWordmark?: boolean
  animate?: boolean
  className?: string
}

const sizeMap: Record<LogoSize, {
  container: number
  outerR: number
  innerR: number
  rayLen: number
  rayWidth: number
  arcStroke: number
  dotR: number
  glowRingR: number
  glowStroke: number
}> = {
  sm: { container: 32, outerR: 5, innerR: 2.2, rayLen: 3, rayWidth: 1, arcStroke: 2, dotR: 1.5, glowRingR: 7, glowStroke: 0.6 },
  md: { container: 56, outerR: 9, innerR: 3.8, rayLen: 5, rayWidth: 1.2, arcStroke: 2.5, dotR: 2, glowRingR: 12, glowStroke: 0.8 },
  lg: { container: 96, outerR: 15, innerR: 6, rayLen: 8, rayWidth: 1.5, arcStroke: 3.5, dotR: 3, glowRingR: 20, glowStroke: 1 },
}

const variantColors: Record<LogoVariant, { arc: string; star: string; glow: string; dots: string; ray: string }> = {
  gold:    { arc: '#f59e0b', star: '#fbbf24', glow: '#f59e0b', dots: '#d97706', ray: '#fcd34d' },
  sunrise: { arc: '#f97316', star: '#fb923c', glow: '#ea580c', dots: '#c2410c', ray: '#fdba74' },
  nebula:  { arc: '#8b5cf6', star: '#a78bfa', glow: '#7c3aed', dots: '#6d28d9', ray: '#c4b5fd' },
  aurora:  { arc: '#06b6d4', star: '#22d3ee', glow: '#0891b2', dots: '#0e7490', ray: '#67e8f9' },
  forest:  { arc: '#10b981', star: '#34d399', glow: '#059669', dots: '#047857', ray: '#6ee7b7' },
}

/** Build a 4-point star polygon points string centered at (cx, cy) */
function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2 // start from top
    const r = i % 2 === 0 ? outerR : innerR
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return points.join(' ')
}

export function LuminaryLogo({
  size = 'md',
  variant = 'gold',
  withWordmark = false,
  animate = false,
  className,
}: LuminaryLogoProps) {
  const s = sizeMap[size]
  const c = variantColors[variant]
  const midX = s.container / 2
  const starCY = s.container * 0.28
  const arcWidth = s.container * 0.7

  // Ray endpoints: 8 rays at 0°, 45°, 90° ... but skip those overlapping the arc bottom
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => (deg * Math.PI) / 180)

  return (
    <div className={cn('inline-flex items-center gap-2', animate && 'luminary-logo-animate', className)}>
      <svg
        width={s.container}
        height={s.container}
        viewBox={`0 0 ${s.container} ${s.container}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${variant}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={animate ? 2.5 : 1.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`arc-grad-${variant}-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.dots} />
            <stop offset="50%" stopColor={c.arc} />
            <stop offset="100%" stopColor={c.star} />
          </linearGradient>
        </defs>

        {/* Outer glow ring (only when animating) */}
        {animate && (
          <circle
            cx={midX}
            cy={starCY}
            r={s.glowRingR}
            stroke={c.glow}
            strokeWidth={s.glowStroke}
            fill="none"
            opacity={0.3}
            filter={`url(#glow-${variant}-${size})`}
          />
        )}

        {/* Radiating rays */}
        {rayAngles.map((angle, i) => {
          const innerStart = s.outerR + 1
          const outerEnd = innerStart + s.rayLen
          const x1 = midX + innerStart * Math.cos(angle)
          const y1 = starCY + innerStart * Math.sin(angle)
          const x2 = midX + outerEnd * Math.cos(angle)
          const y2 = starCY + outerEnd * Math.sin(angle)
          return (
            <line
              key={`ray-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={c.ray}
              strokeWidth={s.rayWidth}
              strokeLinecap="round"
              opacity={0.6}
            />
          )
        })}

        {/* 4-point star */}
        <polygon
          points={starPoints(midX, starCY, s.outerR, s.innerR)}
          fill={c.star}
          filter={`url(#glow-${variant}-${size})`}
        />

        {/* Parabolic arc (Solar Arch) */}
        <path
          d={`M ${midX - arcWidth / 2} ${s.container * 0.85} Q ${midX} ${s.container * 0.15} ${midX + arcWidth / 2} ${s.container * 0.85}`}
          stroke={`url(#arc-grad-${variant}-${size})`}
          strokeWidth={s.arcStroke}
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${variant}-${size})`}
        />

        {/* Milestone dots along the arc */}
        {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
          const x = midX - arcWidth / 2 + t * arcWidth
          const p0 = { x: midX - arcWidth / 2, y: s.container * 0.85 }
          const p1 = { x: midX, y: s.container * 0.15 }
          const p2 = { x: midX + arcWidth / 2, y: s.container * 0.85 }
          const mt = 1 - t
          const dotY = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={dotY}
              r={s.dotR}
              fill={c.dots}
              opacity={0.7}
            />
          )
        })}
      </svg>

      {withWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight text-slate-900 dark:text-slate-100',
            size === 'sm' && 'text-base',
            size === 'md' && 'text-xl',
            size === 'lg' && 'text-3xl',
          )}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Luminary
        </span>
      )}
    </div>
  )
}
