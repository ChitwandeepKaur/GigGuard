# GigGuard — Backend Architecture

## Overview

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (via Supabase — free tier, no setup) |
| ORM | Prisma |
| Auth | Supabase Auth (JWT) |
| File storage | Supabase Storage (PDF uploads) |
| AI proxy | Express route → Anthropic Claude API |
| Hosting | Railway or Render (free tier, one-click deploy) |

Supabase is recommended because it gives you PostgreSQL + Auth + File Storage in one free dashboard. No need to manage separate services during a hackathon.

---

## Why a Backend Here

| Concern | Without backend | With backend |
|---|---|---|
| API key security | Exposed in browser | Hidden server-side |
| User data | Lost on browser clear | Persists in database |
| PDF storage | Gone on refresh | Stored in Supabase Storage |
| Multi-device | Impossible | Works anywhere |
| Demo robustness | Fragile | Survives a page refresh |

---

## Full Project Structure

```
GigGuard/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js           # All fetch calls to YOUR backend
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── vite.config.js
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js            # Login, register, session
│   │   │   ├── user.js            # Profile CRUD
│   │   │   ├── finance.js         # Income logs, expenses
│   │   │   ├── insurance.js       # PDF upload, summary, quiz
│   │   │   └── ai.js              # Claude API proxy
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Database schema
│   │   ├── services/
│   │   │   ├── claude.js          # Claude API calls
│   │   │   ├── pdfParser.js       # PDF text extraction
│   │   │   └── calculations.js    # Financial math (shared logic)
│   │   └── index.js               # Server entry point
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Database Schema (Prisma)

```prisma
// server/src/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile     UserProfile?
  incomeLog   IncomeEntry[]
  expenses    ExpenseProfile?
  insurance   InsurancePolicy?
}

model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  gigTypes          String[] // ["rideshare", "delivery", "freelance"]
  incomeFrequency   String   // "daily" | "weekly" | "random"
  weeklyLow         Float
  weeklyHigh        Float
  worstWeek         Float
  bestWeek          Float

  floorIncome       Float    // computed
  averageIncome     Float    // computed
  volatilityScore   Float    // computed

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ExpenseProfile {
  id              String  @id @default(uuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id])

  // Non-negotiable (weekly amounts)
  rent            Float   @default(0)
  utilities       Float   @default(0)
  debtMinimums    Float   @default(0)
  transport       Float   @default(0)
  groceries       Float   @default(0)
  insurance       Float   @default(0)

  // Semi-flexible
  phone           Float   @default(0)
  subscriptions   Float   @default(0)
  childcare       Float   @default(0)

  // Fully flexible
  eatingOut       Float   @default(0)
  shopping        Float   @default(0)
  entertainment   Float   @default(0)

  survivalNumber  Float   // computed: sum of non-negotiable / 4.33

  updatedAt       DateTime @updatedAt
}

model IncomeEntry {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  amount      Float
  weekOf      DateTime // start of the week this income belongs to
  source      String   // "doordash" | "uber" | "freelance" etc.
  note        String?

  createdAt   DateTime @default(now())
}

model InsurancePolicy {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])

  fileName        String
  fileUrl         String   // Supabase Storage URL
  extractedText   String   // raw PDF text (used for AI calls)

  // AI-generated summary (stored so we don't re-call Claude on every load)
  covered         String[] // plain-English covered items
  notCovered      String[] // plain-English NOT covered items
  deductible      String
  limits          String
  renewalDate     String

  // Quiz
  quizQuestions   Json?    // array of generated questions
  lastQuizScore   Int?
  lastQuizDate    DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## API Routes

### Auth — `/api/auth`

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account with email + password |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user from JWT |

### User Profile — `/api/user`

| Method | Route | Description |
|---|---|---|
| GET | `/api/user/profile` | Get income + expense profile |
| POST | `/api/user/profile` | Create profile (post-onboarding) |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/dashboard` | Get all dashboard data in one call |

### Finance — `/api/finance`

| Method | Route | Description |
|---|---|---|
| GET | `/api/finance/income` | Get income entries (last 12 weeks) |
| POST | `/api/finance/income` | Log a new income entry |
| DELETE | `/api/finance/income/:id` | Delete an income entry |
| GET | `/api/finance/summary` | Get computed: safe-to-spend, buffer, tax owed |

### Insurance — `/api/insurance`

| Method | Route | Description |
|---|---|---|
| GET | `/api/insurance/policy` | Get stored policy + summary |
| POST | `/api/insurance/upload` | Upload PDF → extract text → store |
| POST | `/api/insurance/summarize` | Trigger Claude summary generation |
| GET | `/api/insurance/quiz` | Get stored quiz questions |
| POST | `/api/insurance/quiz/generate` | Trigger Claude quiz generation |
| POST | `/api/insurance/quiz/score` | Save quiz score |
| GET | `/api/insurance/recommendation` | Get AI insurance recommendation |

### AI Proxy — `/api/ai`

| Method | Route | Description |
|---|---|---|
| POST | `/api/ai/chat` | Proxy chat message to Claude |

All AI logic goes through `/api/ai` — the frontend never touches Claude directly.

---

## Server Entry Point

```js
// server/src/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import financeRoutes from './routes/finance.js'
import insuranceRoutes from './routes/insurance.js'
import aiRoutes from './routes/ai.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json({ limit: '10mb' }))

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (JWT required)
app.use('/api/user', authenticate, userRoutes)
app.use('/api/finance', authenticate, financeRoutes)
app.use('/api/insurance', authenticate, insuranceRoutes)
app.use('/api/ai', authenticate, aiRoutes)

app.use(errorHandler)

app.listen(process.env.PORT || 3001, () => {
  console.log(`GigGuard server running on port ${process.env.PORT || 3001}`)
})
```

---

## Auth Middleware

```js
// server/src/middleware/auth.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })

  req.userId = data.user.id
  next()
}
```

---

## Key Route Examples

### Finance Summary (core dashboard endpoint)

```js
// server/src/routes/finance.js
import { PrismaClient } from '@prisma/client'
import { calcSafeToSpend, calcBufferWeeks, calcSEtaxReserve } from '../services/calculations.js'

const prisma = new PrismaClient()

// GET /api/finance/summary
router.get('/summary', async (req, res) => {
  const [profile, expenses, recentIncome] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: req.userId } }),
    prisma.expenseProfile.findUnique({ where: { userId: req.userId } }),
    prisma.incomeEntry.findMany({
      where: {
        userId: req.userId,
        weekOf: { gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { weekOf: 'desc' }
    })
  ])

  const thisWeekIncome = recentIncome
    .filter(e => isThisWeek(e.weekOf))
    .reduce((sum, e) => sum + e.amount, 0)

  const taxReserve = calcSEtaxReserve(thisWeekIncome)
  const safeToSpend = calcSafeToSpend({ ... })
  const bufferWeeks = calcBufferWeeks({ ... })
  const windfall = thisWeekIncome > profile.bestWeek
    ? calcWindfall(thisWeekIncome, profile.bestWeek) : null

  res.json({
    safeToSpend,
    safeToSpendState: getSafeToSpendState(safeToSpend, expenses.survivalNumber),
    bufferWeeks,
    taxReserve,
    totalTaxOwed: recentIncome.reduce((s, e) => s + e.amount * 0.153, 0),
    windfall,
    isSurvivalMode: thisWeekIncome < profile.floorIncome,
    recentIncome
  })
})
```

### PDF Upload + Text Extraction

```js
// server/src/routes/insurance.js
import multer from 'multer'
import { extractPDFText } from '../services/pdfParser.js'
import { summarizePolicy } from '../services/claude.js'
import { createClient } from '@supabase/supabase-js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// POST /api/insurance/upload
router.post('/upload', upload.single('pdf'), async (req, res) => {
  const fileBuffer = req.file.buffer

  // Upload to Supabase Storage
  const fileName = `${req.userId}-${Date.now()}.pdf`
  const { data: uploadData } = await supabase.storage
    .from('insurance-pdfs')
    .upload(fileName, fileBuffer, { contentType: 'application/pdf' })

  const { data: { publicUrl } } = supabase.storage
    .from('insurance-pdfs')
    .getPublicUrl(fileName)

  // Extract text server-side
  const extractedText = await extractPDFText(fileBuffer)

  // Generate summary via Claude
  const summary = await summarizePolicy(extractedText)

  // Save everything to DB
  const policy = await prisma.insurancePolicy.upsert({
    where: { userId: req.userId },
    create: { userId: req.userId, fileName: req.file.originalname, fileUrl: publicUrl, extractedText, ...summary },
    update: { fileName: req.file.originalname, fileUrl: publicUrl, extractedText, ...summary }
  })

  res.json(policy)
})
```

### AI Chat Proxy

```js
// server/src/routes/ai.js
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { messages } = req.body

  const [profile, expenses, policy] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: req.userId } }),
    prisma.expenseProfile.findUnique({ where: { userId: req.userId } }),
    prisma.insurancePolicy.findUnique({ where: { userId: req.userId } })
  ])

  const systemPrompt = `You are GigGuard's financial coach for a gig worker.
Profile: ${JSON.stringify(profile)}
Survival number: $${expenses?.survivalNumber}/week
${policy ? `Insurance policy on file: ${policy.extractedText.slice(0, 4000)}` : ''}
Be direct, plain English, under 150 words per response.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages
  })

  res.json({ message: response.content[0].text })
})
```

---

## Environment Variables

### Server `.env`

```env
DATABASE_URL=postgresql://...         # From Supabase dashboard
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...           # Service role key (keep secret)
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
PORT=3001
```

### Client `.env`

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...         # Anon key (safe to expose)
```

---

## Setup Commands

```bash
# Server setup
cd server
npm init -y
npm install express cors dotenv prisma @prisma/client @supabase/supabase-js \
            @anthropic-ai/sdk multer pdfjs-dist

# Init Prisma
npx prisma init
# Paste schema above into prisma/schema.prisma
# Add DATABASE_URL to .env (copy from Supabase dashboard)
npx prisma db push        # Creates tables in Supabase
npx prisma generate       # Generates Prisma client

# Run server
node src/index.js
```

---

## Client API Layer

All frontend fetch calls go through one file — never fetch directly in components:

```js
// client/src/api/index.js
const BASE = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const token = localStorage.getItem('GigGuard_token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  auth: {
    login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/api/auth/me')
  },
  user: {
    getProfile: () => request('/api/user/profile'),
    createProfile: (data) => request('/api/user/profile', { method: 'POST', body: JSON.stringify(data) }),
    getDashboard: () => request('/api/user/dashboard')
  },
  finance: {
    getSummary: () => request('/api/finance/summary'),
    logIncome: (data) => request('/api/finance/income', { method: 'POST', body: JSON.stringify(data) }),
    getIncome: () => request('/api/finance/income')
  },
  insurance: {
    getPolicy: () => request('/api/insurance/policy'),
    uploadPDF: (formData) => request('/api/insurance/upload', { method: 'POST', body: formData, headers: {} }),
    getQuiz: () => request('/api/insurance/quiz'),
    generateQuiz: () => request('/api/insurance/quiz/generate', { method: 'POST' }),
    saveScore: (score) => request('/api/insurance/quiz/score', { method: 'POST', body: JSON.stringify({ score }) }),
    getRecommendation: () => request('/api/insurance/recommendation')
  },
  ai: {
    chat: (messages) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) })
  }
}
```

---

## Deployment

**Backend → Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
cd server
railway init
railway up
# Add env variables in Railway dashboard
```

**Frontend → Vercel**
```bash
cd client
vercel
# Set VITE_API_URL to your Railway backend URL
```

Both have free tiers, both deploy in under 5 minutes.

---

## Revised Team Task Impact

| Member | Change |
|---|---|
| Dev 1 (Frontend) | Replace direct Zustand calls with `api.*` calls. Auth login/register screens needed. |
| Dev 2 (Features) | Financial calculations move to `server/src/services/calculations.js` — same logic, different location |
| Dev 3 (AI/Integrations) | Claude calls move entirely to server. Frontend just calls `/api/ai/chat` and `/api/insurance/*` |
| Dev 4 (Polish) | No change — UI/demo work stays the same |

A new task is needed: **one person spends the first hour setting up the server, Supabase project, and Prisma schema** before the team splits. Dev 3 is the best fit since they own the AI routes anyway.
