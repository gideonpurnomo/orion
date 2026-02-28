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

// Orion constellation stars (relative positions)
const orionStars: Star[] = [
  // Betelgeuse (top left shoulder)
  { id: 1, x: 30, y: 20, size: 4, opacity: 0.9, twinkleSpeed: 2, delay: 0 },
  // Bellatrix (top right shoulder)
  { id: 2, x: 70, y: 25, size: 3.5, opacity: 0.85, twinkleSpeed: 2.5, delay: 0.5 },
  // Belt stars (Alnitak, Alnilam, Mintaka)
  { id: 3, x: 45, y: 50, size: 3, opacity: 0.8, twinkleSpeed: 1.8, delay: 1 },
  { id: 4, x: 50, y: 50, size: 3, opacity: 0.8, twinkleSpeed: 1.8, delay: 1.2 },
  { id: 5, x: 55, y: 50, size: 3, opacity: 0.8, twinkleSpeed: 1.8, delay: 1.4 },
  // Saiph (left knee)
  { id: 6, x: 35, y: 75, size: 3.5, opacity: 0.85, twinkleSpeed: 2.2, delay: 0.8 },
  // Rigel (right foot - bright blue star)
  { id: 7, x: 65, y: 80, size: 4.5, opacity: 1, twinkleSpeed: 1.5, delay: 1.6 },
  // Meissa (head)
  { id: 8, x: 50, y: 10, size: 2.5, opacity: 0.7, twinkleSpeed: 3, delay: 0.3 },
]

// Constellation connections
const orionConnections: Connection[] = [
  { from: 8, to: 1, opacity: 0.3 }, // Meissa to Betelgeuse
  { from: 8, to: 2, opacity: 0.3 }, // Meissa to Bellatrix
  { from: 1, to: 3, opacity: 0.4 }, // Betelgeuse to Belt
  { from: 2, to: 5, opacity: 0.4 }, // Bellatrix to Belt
  { from: 3, to: 4, opacity: 0.4 }, // Belt stars
  { from: 4, to: 5, opacity: 0.4 }, // Belt stars
  { from: 3, to: 6, opacity: 0.3 }, // Belt to Saiph
  { from: 5, to: 7, opacity: 0.3 }, // Belt to Rigel
]

// Background random stars
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

export default function OrionStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Background stars
    const backgroundStars = generateBackgroundStars(150)

    // Animation loop
    const animate = () => {
      timeRef.current += 0.016

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(5, 10, 30, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw background stars
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

      // Draw constellation connections
      orionConnections.forEach(conn => {
        const fromStar = orionStars.find(s => s.id === conn.from)
        const toStar = orionStars.find(s => s.id === conn.to)
        if (!fromStar || !toStar) return

        const gradient = ctx.createLinearGradient(
          (fromStar.x / 100) * canvas.width,
          (fromStar.y / 100) * canvas.height,
          (toStar.x / 100) * canvas.width,
          (toStar.y / 100) * canvas.height
        )
        gradient.addColorStop(0, `rgba(100, 149, 237, ${conn.opacity * 0.8})`)
        gradient.addColorStop(0.5, `rgba(138, 180, 248, ${conn.opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(100, 149, 237, ${conn.opacity * 0.8})`)

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

      // Draw Orion constellation stars
      orionStars.forEach(star => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.delay) * 0.3 + 0.85
        const x = (star.x / 100) * canvas.width
        const y = (star.y / 100) * canvas.height
        const size = star.size * twinkle

        // Glow effect - larger and brighter
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(0.3, `rgba(100, 149, 237, ${star.opacity * 0.6})`)
        gradient.addColorStop(0.7, `rgba(138, 180, 248, ${star.opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(100, 149, 237, 0)')

        ctx.beginPath()
        ctx.arc(x, y, size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Star core - brighter
        ctx.beginPath()
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.fill()
      })

      // Draw shooting stars occasionally
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
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

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
