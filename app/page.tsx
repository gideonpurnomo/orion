import Link from "next/link"
import { auth } from "@/lib/auth"
import TopNav from "@/components/top-nav"
import { LuminaryLogo } from "@/components/luminary-logo"

export default async function Home() {
  const session = await auth()
  const isSignedIn = !!session?.user

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopNav theme="light" />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-14 pt-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Become the Light
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Illuminate your learning journey
          </h1>
          <p className="mb-7 max-w-xl text-muted-foreground">
            Master any skill with Luminary&apos;s intelligent scheduling. Browse activities, plan sessions, and track your path to mastery.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/library?next=/schedule" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90">
              Library
            </Link>
            <Link href="/schedule" className="rounded-lg bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-md hover:opacity-90">
              Schedule
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90">
              Dashboard
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {isSignedIn
              ? `Signed in as ${session?.user?.email ?? "user"}`
              : "Tip: sign in first so added activities open directly in your schedule."}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <LuminaryLogo size="sm" variant="gold" />
            <h2 className="text-lg font-semibold text-card-foreground">Fast Start</h2>
          </div>
          <div className="space-y-3">
            <Link href="/library?next=/schedule" className="block rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5">
              <p className="text-sm font-semibold text-primary">1. Library</p>
              <p className="text-sm text-muted-foreground">Pick activities by domain and add them to your plan.</p>
            </Link>
            <Link href="/schedule" className="block rounded-xl border border-border bg-card p-4 hover:border-border hover:bg-secondary">
              <p className="text-sm font-semibold text-foreground">2. Schedule</p>
              <p className="text-sm text-muted-foreground">Drag activities into the right day and time slot.</p>
            </Link>
            <Link href="/dashboard" className="block rounded-xl border border-border bg-card p-4 hover:border-emerald-400/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">3. Dashboard</p>
              <p className="text-sm text-muted-foreground">Check progress, streak, and what&apos;s due today.</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="routes" className="border-y border-border bg-card/70">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Core Routes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/library?next=/schedule" className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:bg-primary/5">
              <h3 className="mb-1 font-semibold text-card-foreground">Library</h3>
              <p className="mb-4 text-sm text-muted-foreground">Discover activities and send them straight to schedule.</p>
              <p className="text-sm font-semibold text-primary">Browse and Add</p>
            </Link>
            <Link href="/schedule" className="block rounded-xl border border-border bg-card p-5 transition hover:border-border hover:bg-secondary">
              <h3 className="mb-1 font-semibold text-card-foreground">Schedule</h3>
              <p className="mb-4 text-sm text-muted-foreground">Plan sessions in day, week, and month views.</p>
              <p className="text-sm font-semibold text-foreground">Plan and Drag</p>
            </Link>
            <Link href="/dashboard" className="block rounded-xl border border-border bg-card p-5 transition hover:border-emerald-400/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <h3 className="mb-1 font-semibold text-card-foreground">Dashboard</h3>
              <p className="mb-4 text-sm text-muted-foreground">Review today&apos;s plan and completion metrics.</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Track Progress</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2 className="mb-5 text-2xl font-bold text-foreground">Workflow</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-semibold text-card-foreground">Step 1</p>
            <p className="text-muted-foreground">Sign in or create account</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-semibold text-card-foreground">Step 2</p>
            <p className="text-muted-foreground">Browse by domain in library</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-semibold text-card-foreground">Step 3</p>
            <p className="text-muted-foreground">Add and drag in weekly schedule</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-semibold text-card-foreground">Step 4</p>
            <p className="text-muted-foreground">Track progress on dashboard</p>
          </div>
        </div>
      </section>

      <section id="launch" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border border-primary/30 bg-primary p-8 text-primary-foreground">
          <h2 className="mb-2 text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to illuminate your learning?
          </h2>
          <p className="mb-5 text-primary-foreground/80">Start from the library and move activities into your schedule in seconds.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/library?next=/schedule" className="rounded-md bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-foreground/90">
              Start In Library
            </Link>
            <Link href="/schedule" className="rounded-md border border-primary-foreground/40 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10">
              Open Schedule
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
