'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LuminaryLogo } from './luminary-logo'

export default function LuminaryHero() {
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [heroOpacity, setHeroOpacity] = useState(1)
  const [contentOpacity, setContentOpacity] = useState(0)
  const [textRevealed, setTextRevealed] = useState(false)
  const [logoRevealed, setLogoRevealed] = useState(false)
  const [scrollHintVisible, setScrollHintVisible] = useState(true)

  useEffect(() => {
    const timer1 = setTimeout(() => setLogoRevealed(true), 500)
    const timer2 = setTimeout(() => setTextRevealed(true), 1500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const progress = Math.min(scrollY / windowHeight, 1)

      setScrollProgress(progress)
      setHeroOpacity(1 - progress * 1.2)
      setContentOpacity(Math.max(0, progress - 0.2) * 1.3)

      if (scrollY > 50) {
        setScrollHintVisible(false)
      } else {
        setScrollHintVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Hero Section */}
      <div
        className="fixed inset-0 flex items-center justify-center transition-all duration-700 ease-out"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${scrollProgress * -30}px) scale(${1 - scrollProgress * 0.1})`
        }}
      >
        <div className="text-center z-10 px-6">
          {/* Logo */}
          <div
            className={`mb-8 transition-all duration-1000 ${
              logoRevealed
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <LuminaryLogo size="lg" variant="gold" animate />
          </div>

          {/* Title */}
          <h1
            className={`text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight transition-all duration-1000 delay-300 ${
              textRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="block mb-2">Illuminate your</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              learning journey
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl text-gray-300 mb-8 transition-all duration-1000 delay-500 ${
              textRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Become the light that guides your path to mastery
          </p>

          {/* Email Input + CTA */}
          <div
            className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto transition-all duration-1000 delay-700 ${
              textRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-12 text-base backdrop-blur-sm"
            />
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0 h-12 px-8 whitespace-nowrap shadow-lg shadow-amber-500/30">
              <Link href={session ? "/dashboard" : "/auth/signup"}>
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div
            className={`flex items-center justify-center gap-6 text-sm text-gray-400 mt-6 transition-all duration-1000 delay-900 ${
              textRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Free forever
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              No credit card
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Cancel anytime
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 text-white/60 transition-all duration-500 ${
          scrollHintVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </div>

      {/* Overlay for scroll transition */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-700 z-20"
        style={{
          opacity: Math.max(0, 1 - contentOpacity * 1.5),
          background: 'linear-gradient(to bottom, rgba(5, 10, 30, 0.2), rgba(10, 21, 40, 0.3))'
        }}
      />
    </>
  )
}
