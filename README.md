# 🏋️ Fitness-Tracker

A production-ready full-stack fitness tracking application built with Next.js 15, TypeScript, MongoDB, and NextAuth.js. Features a beautiful glassmorphism UI with dark mode, animated streaks, and comprehensive nutrition tracking.

---

## ✨ Features

- **Authentication** — Email/password + Google OAuth via NextAuth.js
- **Daily Dashboard** — Calories, macros, gym toggle, sleep, streaks at a glance
- **Nutrition Tracking** — Log meals with full macro/micro breakdown, set persistent daily targets
- **Sleep Tracking** — Log nightly sleep with quality rating and progress chart
- **Gym Streaks** — Track consecutive gym days with fire animations for hot streaks
- **Daily Completion Streaks** — Complete all 3 tasks (meals + sleep + gym) for a full day
- **Profile** — Height, weight, BMI auto-calc, body fat, activity level
- **History** — 30-day calorie trend, sleep chart, daily log table
- **Light/Dark Mode** — Toggleable with system preference detection
- **Confetti** — Fires on daily completion 🎉
- **Mobile-first** — Fully responsive with hamburger nav

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (100%) |
| Styling | Tailwind CSS + Glassmorphism |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 |
| Validation | Zod |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | Day.js |
| Confetti | canvas-confetti |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd fitness-tracker
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...       # optional
GOOGLE_CLIENT_SECRET=...   # optional
```

### 3. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret ≥32 chars (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | Base URL (`http://localhost:3000` in dev) |
| `GOOGLE_CLIENT_ID` | Optional | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | For Google OAuth |

---

## 🗄️ Database Setup

1. Create a [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
2. Create a database user with read/write permissions
3. Whitelist your IP (or use `0.0.0.0/0` for development)
4. Copy the connection string to `MONGODB_URI`

Collections created automatically by Mongoose:
- `users`
- `nutritiontargets`
- `mealentries`
- `sleepentries`
- `gymentries`

---

## 🔐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── auth/register/       # User registration
│   │   ├── dashboard/           # Dashboard data aggregation
│   │   ├── nutrition/           # Meal CRUD
│   │   ├── targets/             # Nutrition targets
│   │   ├── sleep/               # Sleep entries
│   │   ├── gym/                 # Gym entries
│   │   ├── profile/             # User profile
│   │   └── history/             # 30-day history
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── nutrition/
│   ├── profile/
│   ├── history/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Providers.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeProvider.tsx
│   ├── ui/
│   │   └── index.tsx            # Card, Modal, Input, etc.
│   ├── dashboard/
│   │   └── SleepForm.tsx
│   ├── nutrition/
│   │   ├── AddMealForm.tsx
│   │   ├── MealCard.tsx
│   │   └── SetTargetsForm.tsx
│   └── streaks/
│       └── StreakDisplay.tsx
├── lib/
│   ├── auth.ts                  # NextAuth config
│   ├── models.ts                # Mongoose models
│   ├── mongoose.ts              # DB connection pooling
│   ├── utils.ts                 # Helpers (BMI, streaks, etc.)
│   └── validations.ts           # Zod schemas
├── types/
│   ├── index.ts                 # All TypeScript interfaces
│   └── next-auth.d.ts           # Session type extension
└── middleware.ts                # Route protection
```

---

## 🎨 UI Design

- **Glassmorphism** — backdrop-blur cards with translucent backgrounds
- **Dark-first** — Beautiful in both dark and light mode
- **Framer Motion** — Page transitions, progress bar fills, modal animations
- **Fire effects** — Emoji + CSS animation for streaks > 4 days
- **Confetti** — canvas-confetti on daily completion
- **Fonts** — Outfit (display) + DM Sans (body) + JetBrains Mono (numbers)

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🤝 Contributing

PRs welcome! Please run `npm run lint` before submitting.
