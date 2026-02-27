'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, TrendingUp, Zap, ArrowRight } from "lucide-react";
import SearchBar from "@/components/search-bar";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import { useRef } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession()
  const searchRef = useRef<{ focus: () => void }>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <KeyboardShortcuts
        onSlash={() => searchRef.current?.focus()}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mb-8 shadow-2xl shadow-purple-500/30 animate-bounce">
              <span className="text-4xl font-black text-white">Pt</span>
            </div>
            <h1 className="text-7xl font-black text-white mb-4 tracking-tight">
              Proterm
            </h1>
            <p className="text-3xl text-purple-200 font-bold mb-4">
              Procrastinate less, terminate more.
            </p>
            <p className="text-lg text-gray-400 mb-12">
              Automated schedule orchestrator. Fix your habits. Master any skill.
            </p>

            {/* Interactive Search Bar */}
            <div className="mb-8">
              <SearchBar
                variant="hero"
                placeholder="What do you want to learn today?"
                autoFocus
              />
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {['Programming', 'Languages', 'Math', 'Music'].map((suggestion) => (
                <Link
                  key={suggestion}
                  href="/schedule"
                  className="group inline-flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/20 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:border-purple-400 hover:text-white transition-all duration-300"
                >
                  {suggestion}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="group border-2 border-purple-500/30 bg-white/5 backdrop-blur-sm hover:border-purple-400 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-purple-400 mb-2 group-hover:text-purple-300 transition-colors" />
                <CardTitle className="text-white">Browse Activities</CardTitle>
                <CardDescription className="text-gray-400">
                  Discover activities across multiple domains
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 border-pink-500/30 bg-white/5 backdrop-blur-sm hover:border-pink-400 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 cursor-pointer">
              <CardHeader>
                <Calendar className="h-10 w-10 text-pink-400 mb-2 group-hover:text-pink-300 transition-colors" />
                <CardTitle className="text-white">Create Schedules</CardTitle>
                <CardDescription className="text-gray-400">
                  Plan your daily, weekly, and monthly learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 border-cyan-500/30 bg-white/5 backdrop-blur-sm hover:border-cyan-400 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors" />
                <CardTitle className="text-white">Track Progress</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor your streaks and completion rates
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Features List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">Why Proterm?</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Multi-domain learning (programming, languages, school topics, music, fitness)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Automated schedule orchestrator</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Fix your habits, decrease procrastination</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Flexible scheduling (daily, weekly, monthly)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Progress tracking & streaks</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Drag & drop scheduling</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Activity difficulty ratings</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">✓</div>
                <span className="text-gray-300">Responsive design for all devices</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
              <Link href={session ? "/dashboard" : "/auth/signup"}>
                {session ? "Go to Dashboard" : "Get Started Free"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300">
              <Link href="/library">Browse Activities</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
