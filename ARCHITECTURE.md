# Learning Schedule Orchestrator - Architecture Design

## 🎯 App Overview

A multi-tenant learning and task orchestration platform that helps individuals, teams, educators, and organizations plan and track daily, weekly, and monthly learning schedules across multiple domains (cooking, programming, etc.).

## 🏗️ System Architecture

### Core Principles
1. **Multi-tenant** - Support individuals, teams, educators, and organizations
2. **Cross-platform** - Web, mobile (iOS/Android), desktop
3. **Scalable** - Start simple, grow complex
4. **Flexible** - Adaptable to different use cases

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Web (React/Next.js)  │  Mobile (React Native)  │  Desktop (Electron)  │
└───────────────────────┴────────────────────────┴─────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
│                    (REST + GraphQL + WebSocket)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ↓                       ↓                       ↓
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Core Service│      │  Auth Service│      │ Scheduler Svc│
│  (CRUD)      │      │  (Multi-tenant)│     │  (Time-based) │
└──────────────┘      └──────────────┘      └──────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
│      PostgreSQL (Main)  │  Redis (Cache)  │  S3 (Media)          │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Recommended Tech Stack

### Phase 1: MVP (Individual Users, Web Only)
- **Frontend**: Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (Neon or Supabase) via Prisma ORM
- **Auth**: NextAuth.js (v5)
- **State Management**: React Context + Zustand (if needed)

### Phase 2: Multi-tenant + Mobile
- **Backend**: Separate Node.js/Express or FastAPI (Python) service
- **Mobile**: React Native (Expo) sharing core logic with web
- **Multi-tenant**: Row-level security in Postgres + custom RBAC
- **Real-time**: WebSockets for team collaboration

### Phase 3: Desktop + Advanced Features
- **Desktop**: Electron with shared React components
- **AI/ML**: Recommendation engine for learning paths
- **Analytics**: Custom dashboard + integrations

### Alternative: Modern T3 Stack (Recommended for Speed)
```
Next.js + tRPC + Prisma + TypeScript + Tailwind
```
This provides full-stack type safety from database to frontend.

## 📊 Data Models

### Core Entities

```prisma
// Multi-tenancy
model Organization {
  id          String   @id @default(cuid())
  name        String
  type        OrgType  // INDIVIDUAL, TEAM, EDUCATOR, ORGANIZATION
  settings    Json?
  members     Member[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Member {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  role           MemberRole // OWNER, ADMIN, MEMBER, STUDENT
  organization   Organization @relation(fields: [organizationId])
  createdAt      DateTime @default(now())
}

// Learning Content
model Domain {
  id          String    @id @default(cuid())
  name        String    // "Cooking", "Programming", "Music"
  description String?
  categories  Category[]
  activities  Activity[]
}

model Category {
  id          String   @id @default(cuid())
  domainId    String
  name        String   // "Italian Cuisine", "Python", "Guitar"
  description String?
  domain      Domain   @relation(fields: [domainId])
  activities  Activity[]
}

model Activity {
  id           String   @id @default(cuid())
  domainId     String?
  categoryId   String?
  title        String   // "Pasta Carbonara", "Hello World", "Basic Chords"
  description  String?
  difficulty   Int      // 1-10
  duration     Int      // minutes
  prerequisites String[] // array of activity IDs
  tags         String[]
  domain       Domain?  @relation(fields: [domainId])
  category     Category? @relation(fields: [categoryId])
  scheduleItems ScheduleItem[]
}

// Scheduling
model Schedule {
  id             String    @id @default(cuid())
  organizationId String
  userId         String?
  name           String
  type           ScheduleType // DAILY, WEEKLY, MONTHLY
  startDate      DateTime
  endDate        DateTime?
  items          ScheduleItem[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model ScheduleItem {
  id           String    @id @default(cuid())
  scheduleId   String
  activityId   String
  scheduledFor DateTime
  status       ItemStatus // PLANNED, IN_PROGRESS, COMPLETED, SKIPPED
  notes        String?
  schedule     Schedule  @relation(fields: [scheduleId])
  activity     Activity  @relation(fields: [activityId])
}

// Progress & Analytics
model Progress {
  id          String   @id @default(cuid())
  userId      String
  activityId  String
  completedAt DateTime
  notes       String?
}

// User Management
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  members   Member[]
  createdAt DateTime @default(now())
}

// Enums
enum OrgType {
  INDIVIDUAL
  TEAM
  EDUCATOR
  ORGANIZATION
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  STUDENT
}

enum ScheduleType {
  DAILY
  WEEKLY
  MONTHLY
}

enum ItemStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  SKIPPED
}
```

## 🎨 Key Features by Phase

### Phase 1: MVP (Individual, Web)
✅ User registration & authentication
✅ Browse domains, categories, activities
✅ Create daily/weekly/monthly schedules
✅ Track progress
✅ Basic activity library (cooking, programming starter)
✅ Simple dashboard

### Phase 2: Multi-tenant & Mobile
✅ Team/organization workspaces
✅ Role-based access control
✅ Real-time collaboration
✅ Mobile app (iOS/Android)
✅ Share schedules
✅ Activity templates & learning paths

### Phase 3: Advanced
✅ Desktop app
✅ AI recommendations
✅ Analytics dashboard
✅ Custom domains branding
✅ Integrations (Google Calendar, Outlook)
✅ Progress streaks & gamification
✅ Export to calendar

## 🚀 Implementation Plan

### Week 1-2: Foundation
- Set up Next.js + Prisma + PostgreSQL
- Database schema & migrations
- Authentication with NextAuth
- Basic UI components (shadcn/ui)

### Week 3-4: Core Features
- Activity browsing & filtering
- Schedule creation UI
- Calendar view
- Progress tracking
- User dashboard

### Week 5-6: Polish & Testing
- Responsive design
- Error handling
- Testing (unit + E2E)
- Performance optimization
- Deployment

### Phase 2: Expand
- Multi-tenant architecture
- Mobile app setup
- Real-time features
- Advanced scheduling

## 📱 UI/UX Overview

### Main Views
1. **Dashboard** - Today's schedule, progress overview, quick actions
2. **Library** - Browse domains, categories, activities
3. **Schedule** - Calendar view (day/week/month), drag-drop scheduling
4. **Progress** - Activity history, streaks, analytics
5. **Settings** - Profile, preferences, integrations

### Key Interactions
- **Quick Add**: Add activity to schedule with one click
- **Drag & Drop**: Move activities between time slots
- **Smart Suggestions**: Recommend activities based on progress
- **Batch Operations**: Schedule multiple days at once
- **Templates**: Reusable schedule templates

## 🔒 Security Considerations

- Row-level security for multi-tenancy
- Secure session management
- Input validation & sanitization
- Rate limiting
- Audit logging for organizations

## 📈 Scalability Path

1. **Start**: Single Postgres instance
2. **Grow**: Read replicas, connection pooling
3. **Scale**: Separate microservices, message queue
4. **Optimize**: CDN for static assets, database sharding

## 🎯 Success Metrics

- User engagement (daily active users)
- Schedule completion rate
- Time spent planning vs. time spent doing
- Feature adoption rate
