'use client'

import { useEffect, useRef } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  delay: number
}

interface Connection {
  from: number
  to: number
  opacity: number
}

// Ascending star pattern (Solar Arch constellation)
const archStars: Star[] = [
  // Apex star (brightest)
  { id: 1, x: 50, y: 15, size: 5, opacity: 1, twinkleSpeed: 1.5, delay: 0 },
  // Left arm
  { id: 2, x: 35, y: 30, size: 3.5, opacity: 0.85, twinkleSpeed: 2, delay: 0.3 },
  { id: 3, x: 25, y: 50, size: 3, opacity: 0.75, twinkleSpeed: 2.2, delay: 0.6 },
  { id: 4, x: 20, y: 70, size: 2.5, opacity: 0.65, twinkleSpeed: 2.5, delay: 0.9 },
  { id: 5, x: 18, y: 85, size: 2, opacity: 0.55, twinkleSpeed: 2.8, delay: 1.2 },
  // Right arm
  { id: 6, x: 65, y: 30, size: 3.5, opacity: 0.85, twinkleSpeed: 2, delay: 0.4 },
  { id: 7, x: 75, y: 50, size: 3, opacity: 0.75, twinkleSpeed: 2.2, delay: 0.7 },
  { id: 8, x: 80, y: 70, size: 2.5, opacity: 0.65, twinkleSpeed: 2.5, delay: 1.0 },
  { id: 9, x: 82, y: 85, size: 2, opacity: 0.55, twinkleSpeed: 2.8, delay: 1.3 },
]

// Ascending connections
const archConnections: Connection[] = [
  { from: 1, to: 2, opacity: 0.5 },
  { from: 1, to: 6, opacity: 0.5 },
  { from: 2, to: 3, opacity: 0.4 },
  { from: 3, to: 4, opacity: 0.35 },
  { from: 4, to: 5, opacity: 0.3 },
  { from: 6, to: 7, opacity: 0.4 },
  { from: 7, to: 8, opacity: 0.35 },
  { from: 8, to: 9, opacity: 0.3 },
]

const generateBackgroundStars = (count: number): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 100,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    twinkleSpeed: Math.random() * 2 + 1,
    delay: Math.random() * 3,
  }))
}

export default function LuminaryStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const backgroundStars = generateBackgroundStars(150)

    const animate = () => {
      timeRef.current += 0.016

      ctx.fillStyle = 'rgba(5, 10, 30, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Background stars
      backgroundStars.forEach(star => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.delay) * 0.3 + 0.85
        ctx.beginPath()
        ctx.arc(
          (star.x / 100) * canvas.width,
          (star.y / 100) * canvas.height,
          star.size * twinkle,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * 1.5})`
        ctx.fill()
      })

      // Arch connections (gold-tinted)
      archConnections.forEach(conn => {
        const fromStar = archStars.find(s => s.id === conn.from)
        const toStar = archStars.find(s => s.id === conn.to)
        if (!fromStar || !toStar) return

        const gradient = ctx.createLinearGradient(
          (fromStar.x / 100) * canvas.width,
          (fromStar.y / 100) * canvas.height,
          (toStar.x / 100) * canvas.width,
          (toStar.y / 100) * canvas.height
        )
        gradient.addColorStop(0, `rgba(251, 191, 36, ${conn.opacity * 0.8})`)
        gradient.addColorStop(0.5, `rgba(245, 158, 11, ${conn.opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(251, 191, 36, ${conn.opacity * 0.8})`)

        ctx.beginPath()
        ctx.moveTo(
          (fromStar.x / 100) * canvas.width,
          (fromStar.y / 100) * canvas.height
        )
        ctx.lineTo(
          (toStar.x / 100) * canvas.width,
          (toStar.y / 100) * canvas.height
        )
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      // Arch stars (gold glow)
      archStars.forEach(star => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.delay) * 0.3 + 0.85
        const x = (star.x / 100) * canvas.width
        const y = (star.y / 100) * canvas.height
        const size = star.size * twinkle

        // Gold glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(0.3, `rgba(251, 191, 36, ${star.opacity * 0.6})`)
        gradient.addColorStop(0.7, `rgba(245, 158, 11, ${star.opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')

        ctx.beginPath()
        ctx.arc(x, y, size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Star core
        ctx.beginPath()
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.fill()
      })

      // Shooting stars
      if (Math.random() < 0.02) {
        drawShootingStar(ctx, canvas.width, canvas.height)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const drawShootingStar = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const startX = Math.random() * width
    const startY = Math.random() * height * 0.3
    const length = Math.random() * 100 + 50
    const angle = Math.PI / 4

    const gradient = ctx.createLinearGradient(
      startX, startY,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    )
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    )
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.stroke()
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: 'linear-gradient(to bottom, #050a1e, #0a1528)' }}
    />
  )
}
