# GigGuard

> Your financial safety net for unpredictable income

Built for the **State Farm Financial Wellness** hackathon track.

---

## What It Is

GigGuard is a financial wellness app built specifically for gig workers — the 73 million Americans whose income is irregular, unpredictable, and completely ignored by every existing budgeting tool.

It solves three problems no other app addresses:

1. **You don't know how much you can safely spend right now** — GigGuard calculates a real-time "Safe-to-Spend" number based on your income volatility, not a static monthly budget
2. **The April tax surprise** — GigGuard tracks your self-employment tax obligation in real-time so you're never blindsided
3. **You're underinsured and don't know it** — GigGuard analyzes your insurance policy in plain English and gamifies learning what's actually covered

---

## Features

- **Income Volatility Profiler** — maps your floor, average, and good-week income
- **Safe-to-Spend This Week** — hero feature: a real-time number based on cash, bills, buffer, and tax reserves
- **Buffer Health Tracker** — "You can survive X.X bad weeks"
- **SE Tax Tracker** — real-time tax set-aside + quarterly deadline countdown
- **Windfall Stabilizer** — guides allocation when you have a great week
- **Survival Mode** — auto-triggered on low income weeks, generates 3 recovery plans
- **Shock Event Planner** — instant financial plan for car breakdowns, late payments, etc.
- **Recovery Plan Generator** — helps you rebuild after a crisis without panic
- **Insurance Recommendation** — personalized coverage suggestions from your profile
- **PDF Policy Summary** — upload your insurance doc, get plain-English breakdown
- **Gamified Quiz** — 5 scenario questions from your actual policy, reveals exact clauses
- **AI Chatbot** — answers insurance and budgeting questions using your profile + policy

---

## Architecture

```
frontend/ -> React + Vite (frontend)
backend/  -> Express + Prisma (backend API)
          -> Supabase (PostgreSQL + Auth + File Storage)
          -> Google Gemini API (AI features, proxied server-side)
```

The frontend never touches the Claude API or database directly. All sensitive operations go through the Express backend.

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand (client state)
- Recharts (data visualization)
- Lucide React (icons)
- React Router 6

### Backend
- Node.js + Express
- Prisma ORM
- Supabase (PostgreSQL + Auth + Storage)
- Anthropic Claude SDK
- pdfjs-dist (PDF text extraction)
- Multer (file upload handling)

### Hosting
- Frontend → Vercel
- Backend → Railway

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free at supabase.com)
- A Google Gemini API key

### 1. Clone and install

```bash
git clone https://github.com/your-team/GigGuard
cd GigGuard

cd frontend && npm install
cd ../backend && npm install
```

### 2. Set up Supabase
- Create a new project at supabase.com
- Copy your DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_ANON_KEY

### 3. Configure environment variables

backend/.env
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

frontend/.env
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Set up database

```bash
cd backend
npx prisma db push
npx prisma generate
```

### 5. Run the app

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

App runs at http://localhost:5173

---

## Demo

Click "Load Demo" on the landing page to pre-fill a realistic gig worker profile (Marcus, DoorDash driver) and see all features live without going through onboarding.

---

## Deployment

```bash
# Backend → Railway
cd backend && railway up

# Frontend → Vercel
cd frontend && vercel
# Set VITE_API_URL to your Railway backend URL in Vercel dashboard
```

---

## Docs

| File | Contents |
|---|---|
| PRD.md | Full product requirements, feature specs, user personas |
| DESIGN_SPECS.md | Colors, typography, component specs, layouts |
| TECH_STACK.md | Frontend stack, code patterns, Zustand stores, calculations |
| BACKEND.md | Backend architecture, API routes, DB schema, deployment |
| TEAM_TASKS.md | Hour-by-hour task division for all 4 team members |

---

## Team

| Member | Role |
|---|---|
| Dev 1 | Frontend Lead — Onboarding + Dashboard + UI components |
| Dev 2 | Features Dev — Financial calculations + Survival Mode |
| Dev 3 | AI/Integrations — Express backend + Claude API + Insurance Hub |
| Dev 4 | UI/Polish + Demo — Animations + design system + presentation |
