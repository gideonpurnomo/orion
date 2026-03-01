'use client'

import { useEffect, useRef, useState } from 'react'

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

interface TrailParticle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  velocityX: number
  velocityY: number
}

// Orion constellation stars
const orionStars: Star[] = [
  { id: 1, x: 30, y: 20, size: 4, opacity: 0.9, twinkleSpeed: 2, delay: 0 },
  { id: 2, x: 70, y: 25, size: 3.5, opacity: 0.85, twinkleSpeed: 2.5, delay: 0.5 },
  { id: 3, x: 45, y: 50, size: 3, opacity: 0.8, twinkleSpeed: 1.8, delay: 1 },
  { id: 4, x: 50, y: 50, size: 3, opacity: 0.8, twinkleSpeed: 1.8, delay: 1.2 },
  { id: 5, x: 55, y: 50, size: 3, opacity: 0.8, twinkleSpeed: 1.8, delay: 1.4 },
  { id: 6, x: 35, y: 75, size: 3.5, opacity: 0.85, twinkleSpeed: 2.2, delay: 0.8 },
  { id: 7, x: 65, y: 80, size: 4.5, opacity: 1, twinkleSpeed: 1.5, delay: 1.6 },
  { id: 8, x: 50, y: 10, size: 2.5, opacity: 0.7, twinkleSpeed: 3, delay: 0.3 },
]

const orionConnections: Connection[] = [
  { from: 8, to: 1, opacity: 0.3 },
  { from: 8, to: 2, opacity: 0.3 },
  { from: 1, to: 3, opacity: 0.4 },
  { from: 2, to: 5, opacity: 0.4 },
  { from: 3, to: 4, opacity: 0.4 },
  { from: 4, to: 5, opacity: 0.4 },
  { from: 3, to: 6, opacity: 0.3 },
  { from: 5, to: 7, opacity: 0.3 },
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

export default function InteractiveOrion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [targetMousePos, setTargetMousePos] = useState({ x: 0.5, y: 0.5 })
  const trailParticlesRef = useRef<TrailParticle[]>([])
  const particleIdRef = useRef(0)

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

    // Background stars - reduced from 200 to 100
    const backgroundStars = generateBackgroundStars(100)

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      setTargetMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop with frame rate control
    let lastFrameTime = 0
    const targetFPS = 60
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      // Limit frame rate
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = currentTime

      timeRef.current += 0.016

      // Smooth mouse movement (lerp)
      setMousePos(prev => ({
        x: prev.x + (targetMousePos.x - prev.x) * 0.1,
        y: prev.y + (targetMousePos.y - prev.y) * 0.1
      }))

      // Calculate galaxy offset - reduced from 50 to 30
      const offsetX = (mousePos.x - 0.5) * 30
      const offsetY = (mousePos.y - 0.5) * 30
      const rotation = (mousePos.x - 0.5) * 0.015

      // Clear with trail effect
      ctx.fillStyle = 'rgba(5, 10, 30, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw galaxy background - simplified
      drawGalaxyBackground(ctx, canvas.width, canvas.height, offsetX, offsetY, rotation)

      // Draw background stars with parallax - reduced calls
      drawBackgroundStars(ctx, canvas.width, canvas.height, offsetX, offsetY, backgroundStars)

      // Draw star trail - reduced from 50 to 20
      updateAndDrawTrail(ctx, canvas.width, canvas.height)

      // Draw Orion constellation with parallax
      drawOrionConstellation(ctx, canvas.width, canvas.height, offsetX, offsetY)

      // Draw mouse cursor glow - reduced radius from 150 to 100
      drawMouseGlow(ctx, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetMousePos, mousePos])

  const drawGalaxyBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
    rotation: number
  ) => {
    ctx.save()
    ctx.translate(width / 2 + offsetX, height / 2 + offsetY)
    ctx.rotate(rotation)

    // Draw simplified spiral galaxy (2 arms instead of 3)
    for (let i = 0; i < 2; i++) {
      const armOffset = (Math.PI * 2 / 2) * i
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 200)

      gradient.addColorStop(0, `rgba(100, 149, 237, ${0.06 - i * 0.02})`)
      gradient.addColorStop(0.5, `rgba(138, 180, 248, ${0.03 - i * 0.01})`)
      gradient.addColorStop(1, 'rgba(100, 149, 237, 0)')

      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5

      for (let angle = 0; angle < Math.PI * 3; angle += 0.1) {
        const r = angle * 12
        const x = Math.cos(angle + armOffset) * r
        const y = Math.sin(angle + armOffset) * r * 0.5

        if (angle === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    ctx.restore()
  }

  const drawBackgroundStars = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
    stars: Star[]
  ) => {
    const twinkle = Math.sin(timeRef.current * 1.5 + stars[0].delay) * 0.3 + 0.85

    stars.forEach(star => {
      const parallaxX = (star.x / 100 - 0.5) * 15 + offsetX * 0.2
      const parallaxY = (star.y / 100 - 0.5) * 15 + offsetY * 0.2
      const starTwinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.delay) * 0.3 + 0.85

      const x = (star.x / 100) * width + parallaxX
      const y = (star.y / 100) * height + parallaxY

      ctx.beginPath()
      ctx.arc(x, y, star.size * starTwinkle, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * starTwinkle * 1.2})`
      ctx.fill()
    })
  }

  const updateAndDrawTrail = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const particles = trailParticlesRef.current

    // Add new particle - reduced frequency
    particleIdRef.current++
    if (particleIdRef.current % 3 === 0) {
      particles.push({
        id: particleIdRef.current,
        x: mousePos.x * width,
        y: mousePos.y * height,
        size: Math.random() * 2 + 1,
        opacity: 1,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
      })
    }

    // Update and draw particles - limit to 20
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]

      // Update position
      p.x += p.velocityX
      p.y += p.velocityY
      p.velocityX *= 0.97
      p.velocityY *= 0.97
      p.opacity -= 0.02

      // Draw particle
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
      gradient.addColorStop(0, `rgba(100, 180, 248, ${p.opacity})`)
      gradient.addColorStop(0.5, `rgba(138, 180, 248, ${p.opacity * 0.5})`)
      gradient.addColorStop(1, 'rgba(100, 180, 248, 0)')

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Remove dead particles
      if (p.opacity <= 0) {
        particles.splice(i, 1)
      }
    }

    // Limit particle count
    if (particles.length > 20) {
      particles.splice(0, particles.length - 20)
    }
  }

  const drawOrionConstellation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offsetX: number,
    offsetY: number
  ) => {
    const parallax = 0.8

    // Draw connections
    orionConnections.forEach(conn => {
      const fromStar = orionStars.find(s => s.id === conn.from)
      const toStar = orionStars.find(s => s.id === conn.to)
      if (!fromStar || !toStar) return

      const x1 = (fromStar.x / 100) * width + offsetX * parallax
      const y1 = (fromStar.y / 100) * height + offsetY * parallax
      const x2 = (toStar.x / 100) * width + offsetX * parallax
      const y2 = (toStar.y / 100) * height + offsetY * parallax

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, `rgba(100, 149, 237, ${conn.opacity * 0.8})`)
      gradient.addColorStop(0.5, `rgba(138, 180, 248, ${conn.opacity * 0.5})`)
      gradient.addColorStop(1, `rgba(100, 149, 237, ${conn.opacity * 0.8})`)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Draw stars
    orionStars.forEach(star => {
      const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.delay) * 0.3 + 0.85
      const x = (star.x / 100) * width + offsetX * parallax
      const y = (star.y / 100) * height + offsetY * parallax
      const size = star.size * twinkle

      // Glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
      gradient.addColorStop(0.3, `rgba(100, 149, 237, ${star.opacity * 0.6})`)
      gradient.addColorStop(0.7, `rgba(138, 180, 248, ${star.opacity * 0.3})`)
      gradient.addColorStop(1, 'rgba(100, 149, 237, 0)')

      ctx.beginPath()
      ctx.arc(x, y, size * 3, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(x, y, size * 1.2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
      ctx.fill()
    })
  }

  const drawMouseGlow = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const x = mousePos.x * width
    const y = mousePos.y * height

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100)
    gradient.addColorStop(0, 'rgba(100, 149, 237, 0.08)')
    gradient.addColorStop(0.5, 'rgba(138, 180, 248, 0.04)')
    gradient.addColorStop(1, 'rgba(100, 149, 237, 0)')

    ctx.beginPath()
    ctx.arc(x, y, 100, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: 'radial-gradient(circle at 50% 50%, #0a1528 0%, #050a1e 100%)' }}
    />
  )
}
