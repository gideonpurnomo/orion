'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, TrendingUp, Zap, ArrowRight, Check, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import InteractiveOrion from "@/components/interactive-orion"
import OrionHero from "@/components/orion-hero"

export default function Home() {
  const { data: session } = useSession()
  const [contentRevealed, setContentRevealed] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard')

  const tabs = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'Library', label: 'Library' },
    { id: 'Schedule', label: 'Schedule' },
    { id: 'Analytics', label: 'Analytics' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      if (scrollY > 50 && !contentRevealed) {
        setContentRevealed(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [contentRevealed])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Interactive Orion Stars Animation Background */}
      <InteractiveOrion />

      {/* Hero Section with Animation */}
      <OrionHero />

      {/* Main Content - Reveals on scroll */}
      <div
        className={`relative z-30 transition-all duration-1000 ${
          contentRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                Orion
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Product</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Solutions</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Resources</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Book a demo
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                <Link href={session ? "/dashboard" : "/auth/signup"}>
                  {session ? "Dashboard" : "Get Started Free"}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero spacer for scroll effect */}
        <div className="h-screen" />

        {/* Navigation Tabs */}
        <div className="container mx-auto px-6 mb-8">
          <div className="flex justify-center">
            <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* App Preview Mockup */}
        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  </div>
                  <span className="text-white/80 text-sm ml-4">Orion - Dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/20 rounded text-xs text-white">Today</div>
                  <div className="px-3 py-1 bg-white/10 rounded text-xs text-white/60">Week</div>
                  <div className="px-3 py-1 bg-white/10 rounded text-xs text-white/60">Month</div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Sidebar */}
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm">Quick Stats</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-green-400">73%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Streak</span>
                          <span className="text-blue-400">7 days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Time</span>
                          <span className="text-purple-400">4.5h</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-white font-semibold text-sm mb-3">Domains</h3>
                      <div className="space-y-2">
                        {['Programming', 'Cooking', 'Music', 'Fitness'].map((domain) => (
                          <div key={domain} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            {domain}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Progress Card */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg p-5 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">Today's Progress</h3>
                        <span className="text-2xl font-bold text-blue-400">73%</span>
                      </div>
                      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[73%]"></div>
                      </div>
                    </div>

                    {/* Today's Schedule Preview */}
                    <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Today's Schedule</h3>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { time: '9:00 AM', title: 'Python Basics', domain: '💻', status: 'COMPLETED' },
                          { time: '11:00 AM', title: 'Italian Cuisine', domain: '🍳', status: 'IN_PROGRESS' },
                          { time: '2:00 PM', title: 'Guitar Practice', domain: '🎸', status: 'PLANNED' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="text-2xl">{item.domain}</div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">{item.title}</div>
                              <div className="text-gray-500 text-xs">{item.time}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                              item.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Why teams choose Orion</h2>
              <p className="text-xl text-gray-400">Everything you need to orchestrate your learning journey</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Browse Activities</CardTitle>
                  <CardDescription className="text-gray-400">
                    Discover curated activities across multiple domains with difficulty ratings
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Create Schedules</CardTitle>
                  <CardDescription className="text-gray-400">
                    Plan your daily, weekly, and monthly learning with drag & drop
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Track Progress</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor your streaks, completion rates, and growth metrics
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0 text-center p-12 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-4xl text-white mb-4">Ready to orchestrate your learning?</CardTitle>
                <CardDescription className="text-xl text-blue-100">
                  Join thousands of learners who are mastering new skills with Orion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0">
                    <Link href={session ? "/dashboard" : "/auth/signup"}>
                      Get Started Free
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10">
                    <Link href="/library">Browse Activities</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 backdrop-blur-sm bg-white/5">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-gray-400 text-sm">
                © 2026 Orion. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
