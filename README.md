# Orion

A multi-tenant learning and task orchestration platform for planning and tracking daily, weekly, and monthly learning schedules across multiple domains (cooking, programming, music, fitness, etc.).

## 🎯 Features

- **Multi-Domain Learning**: Cooking, Programming, Music, Fitness, and more
- **Flexible Scheduling**: Daily, Weekly, and Monthly views with drag-and-drop
- **Multi-Tenant**: Support for individuals, teams, educators, and organizations
- **Progress Tracking**: Streaks, completion rates, and detailed analytics
- **Activity Library**: Curated activities with difficulty levels and duration
- **Cross-Platform**: Web, Mobile (React Native), and Desktop (Electron)

## 🛠️ Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)
- React Query (data fetching)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon/Supabase)
- NextAuth.js v5 (authentication)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (recommended: Neon or Supabase)
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/gideonpurnomo/orion.git
cd orion
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npx prisma db seed
```

5. **Initialize shadcn/ui**
```bash
npx shadcn-ui@latest init
```

6. **Add required UI components**
```bash
npx shadcn-ui@latest add button card calendar dialog
npx shadcn-ui@latest add dropdown-menu input label
npx shadcn-ui@latest add progress select tabs
npx shadcn-ui@latest add avatar badge separator
```

7. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
orion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── library/           # Activity library pages
│   └── schedule/          # Schedule management pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ActivityCard.tsx  # Activity display component
│   ├── ScheduleCalendar.tsx # Calendar view
│   └── ProgressChart.tsx # Progress visualization
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding
├── store/                # Zustand stores
│   └── schedule.ts       # Schedule state management
└── public/               # Static assets
```

## 🎨 UI Components

- **Dashboard**: Today's schedule, progress overview, quick stats
- **Library**: Browse domains, categories, and activities
- **Schedule**: Calendar view with drag-and-drop scheduling
- **Progress**: Activity history, streaks, analytics

## 📊 Database Schema

The app uses a multi-tenant architecture with the following core entities:

- **Organization**: Multi-tenancy support (individuals, teams, educators)
- **Domain**: Learning domains (cooking, programming, etc.)
- **Category**: Sub-categories within domains
- **Activity**: Individual learning tasks
- **Schedule**: User schedules (daily/weekly/monthly)
- **ScheduleItem**: Items in a schedule
- **Progress**: User progress tracking

See `prisma/schema.prisma` for the complete schema.

## 🔐 Authentication

The app uses NextAuth.js v5 with Google OAuth support. To enable:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy credentials to `.env`

## 📱 Multi-Platform Support

### Web
Current implementation runs on web with full functionality.

### Mobile (Phase 2)
- React Native with Expo
- Shared components and logic with web
- Native UI patterns

### Desktop (Phase 3)
- Electron with shared React components
- Desktop-specific features (system tray, etc.)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
vercel login
vercel
```

### Database Deployment

Using Neon (recommended):

```bash
# Create Neon project and get connection string
# Add DATABASE_URL to Vercel environment variables

# Run production migrations
npx prisma migrate deploy
```

## 📈 Roadmap

### Phase 1: MVP (Current)
- ✅ User authentication
- ✅ Activity library
- ✅ Schedule creation
- ✅ Progress tracking
- 🚧 UI polishing
- 🚧 Testing

### Phase 2: Multi-Tenant
- Team workspaces
- Role-based access control
- Real-time collaboration
- Mobile app

### Phase 3: Advanced Features
- AI recommendations
- Analytics dashboard
- Calendar integrations
- Gamification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
