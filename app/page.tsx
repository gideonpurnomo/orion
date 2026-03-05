import Link from "next/link"
import { auth } from "@/lib/auth"
import TopNav from "@/components/top-nav"

export default async function Home() {
  const session = await auth()
  const isSignedIn = !!session?.user

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-sky-50 to-orange-50 text-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-slate-100">
      <TopNav theme="light" />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-14 pt-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            Learn With Structure
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Build a weekly learning plan you can actually follow
          </h1>
          <p className="mb-7 max-w-xl text-slate-600 dark:text-slate-300">
            Browse activities, add them to your schedule, and drag sessions into the exact day and time you want.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/library?next=/schedule" className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:opacity-90">
              Library
            </Link>
            <Link href="/schedule" className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:opacity-90">
              Schedule
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 hover:opacity-90">
              Dashboard
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {isSignedIn
              ? `Signed in as ${session?.user?.email ?? "user"}`
              : "Tip: sign in first so added activities open directly in your schedule."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/60">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Fast Start</h2>
          <div className="space-y-3">
            <Link href="/library?next=/schedule" className="block rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-700 dark:hover:border-orange-500 dark:hover:bg-orange-950/30">
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">1. Library</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Pick activities by domain and add them to your plan.</p>
            </Link>
            <Link href="/schedule" className="block rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-700 dark:hover:border-sky-500 dark:hover:bg-sky-950/30">
              <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">2. Schedule</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Drag activities into the right day and time slot.</p>
            </Link>
            <Link href="/dashboard" className="block rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">3. Dashboard</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Check progress, streak, and what&apos;s due today.</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="routes" className="border-y border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-800/70">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Core Routes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/library?next=/schedule" className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500 dark:hover:bg-orange-950/30">
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Library</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Discover activities and send them straight to schedule.</p>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Browse and Add</p>
            </Link>
            <Link href="/schedule" className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-500 dark:hover:bg-sky-950/30">
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Schedule</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Plan sessions in day, week, and month views.</p>
              <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Plan and Drag</p>
            </Link>
            <Link href="/dashboard" className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30">
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Dashboard</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Review today&apos;s plan and completion metrics.</p>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Track Progress</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-slate-100">Workflow</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Step 1</p>
            <p className="text-slate-600 dark:text-slate-300">Sign in or create account</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Step 2</p>
            <p className="text-slate-600 dark:text-slate-300">Browse by domain in library</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Step 3</p>
            <p className="text-slate-600 dark:text-slate-300">Add and drag in weekly schedule</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Step 4</p>
            <p className="text-slate-600 dark:text-slate-300">Track progress on dashboard</p>
          </div>
        </div>
      </section>

      <section id="launch" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white dark:border-slate-600">
          <h2 className="mb-2 text-2xl font-bold">Ready to plan your next learning week?</h2>
          <p className="mb-5 text-slate-200">Start from the library and move activities into your schedule in seconds.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/library?next=/schedule" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              Start In Library
            </Link>
            <Link href="/schedule" className="rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Open Schedule
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
