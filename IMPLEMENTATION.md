# Learning Schedule Orchestrator - Implementation Plan

## 🎬 Visual Wireframes

### Main Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  ☰  Learning Schedule        [👤 John] [Settings] [Logout]  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │  🎯 Today's Progress - February 23, 2026        │  │
│  │  ████░░░░░░ 40% Complete | 🔥 5 Day Streak     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ⏰ Today's Schedule                              │  │
│  │                                                  │  │
│  │  9:00 AM  ✅  Morning meditation           [10m] │  │
│  │  9:30 AM  📋  Code review session            [30m] │  │
│  │  10:00 AM 💻  Learn Python: Lists         [45m] │  │
│  │  11:00 AM 🍳  Practice knife skills        [30m] │  │
│  │  2:00 PM  📋  Daily standup                [15m] │  │
│  │  3:00 PM  💻  Build Python project         [60m] │  │
│  │                                                  │  │
│  │  [+ Add Activity]  [View Week]  [View Month]  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │  📊 Quick Stats     │  │  🏆 Achievements    │      │
│  │  • 12/30 completed │  │  • First Week      │      │
│  │  • 6.5 hrs planned │  │  • 3-Day Streak    │      │
│  │  • 2 domains       │  │  • Code Master     │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🔍 Browse Library                               │  │
│  │  [Cooking] [Programming] [Music] [Fitness]       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Activity Library
```
┌─────────────────────────────────────────────────────────┐
│  ← Library                                              │
├─────────────────────────────────────────────────────────┤
│  🔍 Search activities...  [Filter] [Sort]               │
│                                                          │
│  📚 Domains                                              │
│  [🍳 Cooking] [💻 Programming] [🎸 Music] [🏋️ Fitness]    │
│                                                          │
│  🍳 Cooking - Italian Cuisine                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🍝 Pasta Carbonara                     ⭐⭐ [30m] │  │
│  │    Learn to make authentic Italian pasta...       │  │
│  │    [+ Add to Schedule]                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 🥖 Italian Bread Making                 ⭐⭐⭐ [60m] │  │
│  │    Master the art of Italian bread...            │  │
│  │    [+ Add to Schedule]                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 🍷 Wine Pairing Basics                   ⭐ [20m]  │  │
│  │    Understand Italian wines...                    │  │
│  │    [+ Add to Schedule]                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  💻 Programming - Python                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🐍 Hello World Program                   ⭐ [10m] │  │
│  │    Write your first Python program...            │  │
│  │    [+ Add to Schedule]                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 📊 Lists & Dictionaries                  ⭐⭐ [30m] │  │
│  │    Master Python data structures...              │  │
│  │    [+ Add to Schedule]                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Weekly Schedule
```
┌─────────────────────────────────────────────────────────┐
│  ← Schedule  Week of Feb 23-29, 2026                    │
├─────────────────────────────────────────────────────────┤
│  [Day] [Week] [Month]     [This Week] [Prev] [Next]     │
│                                                          │
│  ┌────┬──────────────────────────────────────────────┐  │
│  │Time│ Mon   Tue   Wed   Thu   Fri   Sat   Sun    │  │
│  ├────┼──────────────────────────────────────────────┤  │
│  │ 9am│🧘...  🧘...  🧘...  🧘...  🧘...  🏃...  💤..│  │
│  │10am│💻...  📋...  💻...  💻...  📋...  💻...  🎸..│  │
│  │11am│💻...  💻...  📋...  💻...  💻...  🍳...  🎸..│  │
│  │12pm│🍽️...  🍽️...  🍽️...  🍽️...  🍽️...  🍽️...  🍽️..│  │
│  │ 1pm│💤...  💤...  💤...  💤...  💤...  📚...  💤..│  │
│  │ 2pm│📋...  💻...  💻...  📋...  💻...  💻...  🎸..│  │
│  │ 3pm│💻...  💻...  💻...  💻...  💻...  🍳...  🎸..│  │
│  │ 4pm│💻...  💻...  💻...  💻...  💻...  💻...  💤..│  │
│  │ 5pm│📋...  🍳...  📋...  💻...  🍳...  💤...  💤..│  │
│  └────┴──────────────────────────────────────────────┘  │
│                                                          │
│  [+ Add Template]  [Copy Week]  [Clear Week]            │
└─────────────────────────────────────────────────────────┘
```

## 📋 Step-by-Step Implementation

### Phase 1: Project Setup (Days 1-2)

```bash
# 1. Create Next.js project
npx create-next-app@latest learning-schedule --typescript --tailwind --app

# 2. Install dependencies
npm install prisma @prisma/client next-auth@beta
npm install @dnd-kit/core @dnd-kit/sortable react-big-calendar
npm install zustand @tanstack/react-query date-fns
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react recharts framer-motion
npm install -D prisma

# 3. Set up Prisma
npx prisma init

# 4. Initialize shadcn/ui
npx shadcn-ui@latest init
```

### Phase 2: Database Setup (Days 2-3)

```bash
# 1. Create database schema (see ARCHITECTURE.md)
# 2. Generate Prisma client
npx prisma generate

# 3. Create migrations
npx prisma migrate dev --name init

# 4. Seed initial data (domains, activities)
```

### Phase 3: Authentication (Days 3-4)

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
})
```

### Phase 4: Core Components (Days 4-7)

**1. UI Components (shadcn/ui)**
```bash
npx shadcn-ui@latest add button card calendar dialog
npx shadcn-ui@latest add dropdown-menu input label
npx shadcn-ui@latest add progress select tabs
npx shadcn-ui@latest add avatar badge separator
```

**2. Dashboard Layout**
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}
```

**3. Activity Card Component**
```typescript
// components/ActivityCard.tsx
export function ActivityCard({ activity, onAdd }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge>{activity.difficulty}/10</Badge>
          <span>{activity.duration}m</span>
        </div>
        <CardTitle>{activity.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{activity.description}</p>
        <Button onClick={() => onAdd(activity)}>
          + Add to Schedule
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Phase 5: Schedule Management (Days 7-10)

**1. Calendar View**
```typescript
// components/ScheduleCalendar.tsx
export function ScheduleCalendar({ schedule, onUpdate }) {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Calendar
        localizer={localizer}
        events={schedule.items}
        onEventDrop={onUpdate}
        resizable
        selectable
      />
    </DndContext>
  )
}
```

**2. Schedule State (Zustand)**
```typescript
// store/schedule.ts
import { create } from 'zustand'

interface ScheduleState {
  currentSchedule: Schedule
  addItem: (item: ScheduleItem) => void
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void
  deleteItem: (id: string) => void
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  currentSchedule: { items: [] },
  addItem: (item) => set((state) => ({
    currentSchedule: {
      ...state.currentSchedule,
      items: [...state.currentSchedule.items, item]
    }
  })),
  // ... more actions
}))
```

### Phase 6: Progress Tracking (Days 10-12)

```typescript
// components/ProgressChart.tsx
export function ProgressChart({ progress }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={progress}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="completion" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Phase 7: API Routes (Days 12-14)

```typescript
// app/api/schedules/route.ts
export async function GET() {
  const session = await auth()
  const schedules = await prisma.schedule.findMany({
    where: { userId: session?.user.id },
    include: { items: true }
  })
  return Response.json(schedules)
}

export async function POST(req: Request) {
  const data = await req.json()
  const schedule = await prisma.schedule.create({ data })
  return Response.json(schedule)
}
```

### Phase 8: Testing & Polish (Days 14-16)

```bash
# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## 🎯 MVP Checklist

- [ ] User authentication (Google + email/password)
- [ ] Domain browsing (cooking, programming)
- [ ] Activity library (20-30 items)
- [ ] Daily schedule creation
- [ ] Drag & drop scheduling
- [ ] Progress tracking (basic)
- [ ] Dashboard with today's view
- [ ] Activity completion marking
- [ ] Responsive design
- [ ] Dark mode support

## 🚀 Deployment Steps

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Deploy to Vercel
vercel login
vercel

# 3. Set environment variables
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET

# 4. Deploy database (Neon/Supabase)
# Get connection string and add to env vars

# 5. Run migrations on production
npx prisma migrate deploy
```

## 📊 Timeline

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 1 | Setup + Auth | Working auth system |
| 2 | Database + API | CRUD for activities |
| 3 | UI Components | Activity library |
| 4 | Schedule View | Calendar with drag-drop |
| 5 | Progress Tracking | Dashboard with stats |
| 6 | Testing + Polish | MVP ready for testing |

## 💡 Next Steps

After MVP complete:
1. Gather user feedback
2. Prioritize Phase 2 features
3. Design mobile app (React Native)
4. Plan multi-tenant architecture
5. Add AI recommendations
