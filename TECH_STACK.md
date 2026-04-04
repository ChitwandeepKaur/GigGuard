# GigGuard — Tech Stack

## Overview

### Frontend (client/)

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18 |
| Build tool | Vite | 5 |
| Styling | Tailwind CSS | 3 |
| State management | Zustand | 4 |
| Routing | React Router | 6 |
| Charts | Recharts | 2 |
| Icons | Lucide React | latest |
| HTTP client | Native fetch via api/index.js | — |

### Backend (server/)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 18+ |
| Framework | Express | 4 |
| ORM | Prisma | 5 |
| Database | PostgreSQL via Supabase | — |
| Auth | Supabase Auth (JWT) | — |
| File storage | Supabase Storage | — |
| AI | Anthropic Claude SDK | latest |
| PDF parsing | pdfjs-dist | 4 |
| File uploads | Multer | — |

### Hosting

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database + Auth + Storage | Supabase (free tier) |

---

## Project Setup

### Full monorepo structure

```
GigGuard/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js              # All fetch calls to the backend
│   │   ├── components/
│   │   │   ├── chatbot/
│   │   │   │   ├── ChatbotButton.jsx
│   │   │   │   ├── ChatbotPanel.jsx
│   │   │   │   └── ChatMessage.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SafeToSpend.jsx
│   │   │   │   ├── BufferHealth.jsx
│   │   │   │   ├── TaxTracker.jsx
│   │   │   │   └── WindfallAlert.jsx
│   │   │   ├── insurance/
│   │   │   │   ├── InsuranceRecommendation.jsx
│   │   │   │   ├── PDFUpload.jsx
│   │   │   │   ├── PolicySummary.jsx
│   │   │   │   └── QuizGame.jsx
│   │   │   ├── onboarding/
│   │   │   │   ├── IncomeProfiler.jsx
│   │   │   │   ├── ExpenseSetup.jsx
│   │   │   │   └── InsuranceStep.jsx
│   │   │   ├── survival/
│   │   │   │   ├── SurvivalBanner.jsx
│   │   │   │   ├── SurvivalPlans.jsx
│   │   │   │   ├── ShockEventPlanner.jsx
│   │   │   │   └── RecoveryPlan.jsx
│   │   │   └── ui/
│   │   │       ├── Card.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── Badge.jsx
│   │   │       └── ProgressBar.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── InsuranceHub.jsx
│   │   ├── store/
│   │   │   ├── useUserStore.js       # Auth + profile (synced from backend)
│   │   │   ├── useFinanceStore.js    # Dashboard data (fetched from backend)
│   │   │   └── useInsuranceStore.js  # Policy + quiz state
│   │   ├── data/
│   │   │   └── demoUser.js           # Pre-filled demo profile for judges
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/
    ├── src/
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── user.js
    │   │   ├── finance.js
    │   │   ├── insurance.js
    │   │   └── ai.js
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   └── errorHandler.js
    │   ├── services/
    │   │   ├── claude.js             # All Anthropic API calls
    │   │   ├── pdfParser.js          # PDF text extraction
    │   │   └── calculations.js       # All financial math
    │   ├── prisma/
    │   │   └── schema.prisma
    │   └── index.js
    ├── .env
    └── package.json
```

---

## Install Commands

### Frontend

```bash
cd client
npm create vite@latest . -- --template react
npm install react-router-dom zustand recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Backend

```bash
cd server
npm init -y
npm install express cors dotenv prisma @prisma/client @supabase/supabase-js \
            @anthropic-ai/sdk multer pdfjs-dist
npx prisma init
```

---

## Environment Variables

### client/.env

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### server/.env

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
PORT=3001
```

---

## Key Code Patterns

### Client API Layer

The frontend never calls Claude or Supabase directly.
Everything goes through one file — never fetch inside components.

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
    login: (email, password) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password) =>
      request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/api/auth/me')
  },
  user: {
    getProfile: () => request('/api/user/profile'),
    createProfile: (data) =>
      request('/api/user/profile', { method: 'POST', body: JSON.stringify(data) }),
    updateProfile: (data) =>
      request('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getDashboard: () => request('/api/user/dashboard')
  },
  finance: {
    getSummary: () => request('/api/finance/summary'),
    logIncome: (data) =>
      request('/api/finance/income', { method: 'POST', body: JSON.stringify(data) }),
    getIncome: () => request('/api/finance/income')
  },
  insurance: {
    getPolicy: () => request('/api/insurance/policy'),
    uploadPDF: (formData) =>
      request('/api/insurance/upload', { method: 'POST', body: formData, headers: {} }),
    getQuiz: () => request('/api/insurance/quiz'),
    generateQuiz: () =>
      request('/api/insurance/quiz/generate', { method: 'POST' }),
    saveScore: (score) =>
      request('/api/insurance/quiz/score', { method: 'POST', body: JSON.stringify({ score }) }),
    getRecommendation: () => request('/api/insurance/recommendation')
  },
  ai: {
    chat: (messages) =>
      request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) })
  }
}
```

### Zustand Stores (Client State)

Stores hold UI state and cache from backend. On mount, components call the api.* functions and hydrate the stores.

```js
// client/src/store/useUserStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(persist(
  (set) => ({
    token: null,
    user: null,
    profile: null,
    setToken: (token) => {
      localStorage.setItem('GigGuard_token', token)
      set({ token })
    },
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    logout: () => {
      localStorage.removeItem('GigGuard_token')
      set({ token: null, user: null, profile: null })
    }
  }),
  { name: 'GigGuard-user' }
))

// client/src/store/useFinanceStore.js
export const useFinanceStore = create((set) => ({
  safeToSpend: null,
  safeToSpendState: 'safe',
  bufferWeeks: 0,
  taxReserve: 0,
  totalTaxOwed: 0,
  windfall: null,
  isSurvivalMode: false,
  recentIncome: [],
  setSummary: (data) => set(data),
  addIncome: (entry) => set((s) => ({ recentIncome: [entry, ...s.recentIncome] }))
}))

// client/src/store/useInsuranceStore.js
export const useInsuranceStore = create((set) => ({
  policy: null,
  quizQuestions: [],
  lastScore: null,
  setPolicy: (policy) => set({ policy }),
  setQuiz: (questions) => set({ quizQuestions: questions }),
  setScore: (score) => set({ lastScore: score })
}))
```

### Financial Calculations (Server)

All math lives server-side in services/calculations.js.
These are the same functions as before, just running on the server now.

```js
// server/src/services/calculations.js

export function calcFloorIncome(worstWeek) {
  return worstWeek
}

export function calcAverageIncome(low, high) {
  return (low + high) / 2
}

export function calcVolatilityScore(low, high) {
  const avg = calcAverageIncome(low, high)
  return avg === 0 ? 0 : ((high - low) / avg) * 100
}

export function calcWeeklySurvivalNumber(nonNegotiableExpenses) {
  const total = Object.values(nonNegotiableExpenses).reduce((a, b) => a + b, 0)
  return total / 4.33
}

export function calcSEtaxReserve(weeklyIncome) {
  return weeklyIncome * 0.153 * 0.9
}

export function calcSafeToSpend({ availableCash, billsDueThisWeek, emergencyBufferTarget, currentBuffer, weeklyTaxReserve, volatilityScore }) {
  const bufferGap = Math.max(0, emergencyBufferTarget - currentBuffer)
  const volatilityCushion = availableCash * (volatilityScore / 1000)
  return availableCash - billsDueThisWeek - bufferGap - weeklyTaxReserve - volatilityCushion
}

export function getSafeToSpendState(safeAmount, survivalNumber, avgFlexible) {
  if (safeAmount > avgFlexible) return 'safe'
  if (safeAmount > 0) return 'warning'
  if (safeAmount > -survivalNumber) return 'risky'
  return 'danger'
}

export function calcBufferWeeks(currentBuffer, survivalNumber) {
  return currentBuffer / survivalNumber
}

export function calcWindfall(currentWeekIncome, goodWeekThreshold) {
  const excess = currentWeekIncome - goodWeekThreshold
  if (excess <= 0) return null
  return {
    excess,
    buffer: excess * 0.5,
    bills: excess * 0.2,
    essentials: excess * 0.2,
    flex: excess * 0.1
  }
}
```

### Claude Service (Server)

```js
// server/src/services/claude.js
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-4-20250514'

export async function summarizePolicy(pdfText) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: `You are a financial advisor helping gig workers understand their insurance.
Extract and summarize in plain English. Return JSON only with these exact keys:
covered (string array), not_covered (string array), deductible (string), limits (string), renewal_date (string).
No markdown, no preamble, no trailing text.`,
    messages: [{ role: 'user', content: `Summarize this policy:\n\n${pdfText.slice(0, 8000)}` }]
  })
  return JSON.parse(response.content[0].text)
}

export async function generateQuizQuestions(pdfText, gigType) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: `You are creating a quiz to help a ${gigType} worker understand their insurance.
Generate exactly 5 scenario questions based on the policy text.
Return JSON array only. Each item: { scenario, answer ("covered"|"not_covered"|"partial"), clause, explanation }.
No markdown, no preamble.`,
    messages: [{ role: 'user', content: `Policy text:\n\n${pdfText.slice(0, 8000)}` }]
  })
  return JSON.parse(response.content[0].text)
}

export async function getInsuranceRecommendation(userProfile) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: `You are a State Farm insurance advisor.
Based on the user's gig work profile, recommend exactly 3 insurance products.
Return JSON array only. Each item: { product, reason, priority ("high"|"medium"|"low"), gap_description }.
No markdown, no preamble.`,
    messages: [{ role: 'user', content: `User profile:\n${JSON.stringify(userProfile)}` }]
  })
  return JSON.parse(response.content[0].text)
}

export async function chatWithContext(messages, userProfile, policyText) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: `You are GigGuard's financial coach for a gig worker.
Profile: ${JSON.stringify(userProfile)}
${policyText ? `Insurance policy on file:\n${policyText.slice(0, 4000)}` : ''}
Be direct, plain English, under 150 words per response. No jargon.`,
    messages
  })
  return response.content[0].text
}
```

### PDF Parser (Server)

```js
// server/src/services/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js'

export async function extractPDFText(buffer) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }
  return fullText
}
```

---

## React Router Setup

```jsx
// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/useUserStore'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import InsuranceHub from './pages/InsuranceHub'
import ChatbotButton from './components/chatbot/ChatbotButton'

function ProtectedRoute({ children }) {
  const token = useUserStore(s => s.token)
  return token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/insurance" element={<ProtectedRoute><InsuranceHub /></ProtectedRoute>} />
      </Routes>
      <ChatbotButton />
    </BrowserRouter>
  )
}
```

---

## Tailwind Config

```js
// client/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0F6E56', light: '#1D9E75', surface: '#E1F5EE' },
        warn: { DEFAULT: '#EF9F27', surface: '#FAEEDA' },
        danger: { DEFAULT: '#D85A30', surface: '#FAECE7' },
        app: { bg: '#F8F7F2', card: '#FFFFFF', border: '#D3D1C7', text: '#2C2C2A', muted: '#5F5E5A' }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: { card: '12px', hero: '16px' }
    }
  }
}
```

---

## Deployment

### Backend → Railway

```bash
cd server
npm install -g @railway/cli
railway login
railway init
railway up
# Add all server/.env vars in Railway dashboard
```

### Frontend → Vercel

```bash
cd client
vercel
# In Vercel dashboard, set:
# VITE_API_URL = your Railway backend URL
# VITE_SUPABASE_URL = your Supabase URL
# VITE_SUPABASE_ANON_KEY = your Supabase anon key
```

---

## Demo Safety Net

Always keep a working demo mode. In `client/src/data/demoUser.js`:

```js
export const demoUser = {
  token: 'demo',
  profile: {
    gigTypes: ['rideshare', 'delivery'],
    incomeFrequency: 'weekly',
    weeklyLow: 800,
    weeklyHigh: 1800,
    worstWeek: 620,
    bestWeek: 2100,
    floorIncome: 620,
    averageIncome: 1300,
    volatilityScore: 76.9
  },
  finance: {
    safeToSpend: 340,
    safeToSpendState: 'warning',
    bufferWeeks: 1.7,
    taxReserve: 87,
    totalTaxOwed: 412,
    isSurvivalMode: false
  }
}
```

Load this in Landing.jsx with a "Load demo" button. If the backend is down during the demo, the app still works.
