# GigGuard — Tech Stack

## Stack Overview

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18 |
| Build tool | Vite | 5 |
| Styling | Tailwind CSS | 3 |
| State management | Zustand | 4 |
| Routing | React Router | 6 |
| Charts | Recharts | 2 |
| Icons | Lucide React | latest |
| AI / LLM | Anthropic Claude API | claude-sonnet-4-20250514 |
| PDF parsing | pdfjs-dist | 4 |
| Income data | Manual input (Plaid as roadmap) | — |
| Hosting | Vercel | — |
| Package manager | npm | — |

---

## Project Setup

```bash
npm create vite@latest gigshield -- --template react
cd gigshield
npm install

# Core dependencies
npm install react-router-dom zustand recharts lucide-react

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# PDF parsing
npm install pdfjs-dist

# HTTP client (for Claude API calls)
npm install axios
```

---

## Environment Variables

Create `.env` in project root:

```env
VITE_ANTHROPIC_API_KEY=your_key_here
```

In code:
```js
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
```

**Important:** For a hackathon, calling Claude API directly from the browser is fine. In production you would proxy through a backend to protect the key.

---

## Folder Structure

```
gigshield/
├── public/
├── src/
│   ├── api/
│   │   └── claude.js          # All Claude API calls
│   ├── components/
│   │   ├── chatbot/
│   │   │   ├── ChatbotButton.jsx
│   │   │   ├── ChatbotPanel.jsx
│   │   │   └── ChatMessage.jsx
│   │   ├── dashboard/
│   │   │   ├── SafeToSpend.jsx
│   │   │   ├── BufferHealth.jsx
│   │   │   ├── TaxTracker.jsx
│   │   │   └── WindfallAlert.jsx
│   │   ├── insurance/
│   │   │   ├── InsuranceRecommendation.jsx
│   │   │   ├── PDFUpload.jsx
│   │   │   ├── PolicySummary.jsx
│   │   │   └── QuizGame.jsx
│   │   ├── onboarding/
│   │   │   ├── IncomeProfiler.jsx
│   │   │   ├── ExpenseSetup.jsx
│   │   │   └── InsuranceStep.jsx
│   │   ├── survival/
│   │   │   ├── SurvivalBanner.jsx
│   │   │   ├── SurvivalPlans.jsx
│   │   │   ├── ShockEventPlanner.jsx
│   │   │   └── RecoveryPlan.jsx
│   │   └── ui/
│   │       ├── Card.jsx
│   │       ├── Button.jsx
│   │       ├── Badge.jsx
│   │       ├── ProgressBar.jsx
│   │       └── StateBadge.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Dashboard.jsx
│   │   └── InsuranceHub.jsx
│   ├── store/
│   │   ├── useUserStore.js     # Profile, income, expenses
│   │   ├── useFinanceStore.js  # Calculations, safe-to-spend
│   │   └── useInsuranceStore.js # PDF text, quiz state
│   ├── utils/
│   │   ├── calculations.js     # All financial math
│   │   └── pdfParser.js        # PDF text extraction
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── tailwind.config.js
└── vite.config.js
```

---

## Key Code Patterns

### Zustand Store (User Profile)

```js
// src/store/useUserStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(persist(
  (set) => ({
    gigType: [],
    incomeFrequency: '',
    weeklyLow: 0,
    weeklyHigh: 0,
    worstWeek: 0,
    bestWeek: 0,
    expenses: {
      nonNegotiable: {},
      semiFlexible: {},
      fullyFlexible: {}
    },
    setIncomeProfile: (data) => set(data),
    setExpenses: (expenses) => set({ expenses }),
  }),
  { name: 'gigshield-user' }
))
```

### Financial Calculations

```js
// src/utils/calculations.js

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
  return weeklyIncome * 0.153 * 0.9 // 15.3% SE tax, 90% net
}

export function calcSafeToSpend({
  availableCash,
  billsDueThisWeek,
  emergencyBufferTarget,
  currentBuffer,
  weeklyTaxReserve,
  volatilityScore
}) {
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

export function calcBufferWeeks(currentBuffer, floorIncome, survivalNumber) {
  const weeklyNeed = survivalNumber
  return currentBuffer / weeklyNeed
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

### Claude API Helper

```js
// src/api/claude.js

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export async function callClaude(systemPrompt, userMessage) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  return data.content[0].text
}

export async function summarizePolicy(pdfText) {
  const system = `You are a financial advisor helping gig workers understand their insurance policy.
  Extract and summarize in plain English. Return JSON only with keys:
  covered (array of strings), not_covered (array of strings), deductible (string), limits (string), renewal_date (string).
  No markdown, no preamble.`
  return JSON.parse(await callClaude(system, `Summarize this policy:\n\n${pdfText.slice(0, 8000)}`))
}

export async function generateQuizQuestions(pdfText, gigType) {
  const system = `You are creating a quiz to help a ${gigType} worker understand their insurance.
  Generate exactly 5 scenario questions based on the policy text.
  Return JSON array only. Each item: { scenario, answer ("covered"|"not_covered"|"partial"), clause, explanation }.
  No markdown, no preamble.`
  return JSON.parse(await callClaude(system, `Policy text:\n\n${pdfText.slice(0, 8000)}`))
}

export async function chatWithContext(messages, pdfText, userProfile) {
  const system = `You are GigShield's financial coach helping a gig worker.
  User profile: ${JSON.stringify(userProfile)}
  ${pdfText ? `Insurance policy on file:\n${pdfText.slice(0, 4000)}` : ''}
  Answer questions about their finances and insurance in plain English. Be direct and specific.
  Never use financial jargon. Keep responses under 150 words.`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system,
      messages
    })
  })
  const data = await response.json()
  return data.content[0].text
}

export async function getInsuranceRecommendation(userProfile) {
  const system = `You are a State Farm insurance advisor.
  Based on the user's gig work profile, recommend exactly 3 insurance products.
  Return JSON array only. Each item: { product, reason, priority ("high"|"medium"|"low"), gap_description }.
  No markdown, no preamble.`
  return JSON.parse(await callClaude(system, `User profile:\n${JSON.stringify(userProfile)}`))
}
```

### PDF Parser

```js
// src/utils/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`

export async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return fullText
}
```

---

## React Router Setup

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import InsuranceHub from './pages/InsuranceHub'
import ChatbotButton from './components/chatbot/ChatbotButton'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insurance" element={<InsuranceHub />} />
      </Routes>
      <ChatbotButton />
    </BrowserRouter>
  )
}
```

---

## Tailwind Config

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F6E56',
          light: '#1D9E75',
          surface: '#E1F5EE',
        },
        warn: {
          DEFAULT: '#EF9F27',
          surface: '#FAEEDA',
        },
        danger: {
          DEFAULT: '#D85A30',
          surface: '#FAECE7',
        },
        app: {
          bg: '#F8F7F2',
          card: '#FFFFFF',
          border: '#D3D1C7',
          text: '#2C2C2A',
          muted: '#5F5E5A',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        hero: '16px',
      }
    }
  }
}
```

---

## Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# VITE_ANTHROPIC_API_KEY = your_key
```

One command, live URL in 60 seconds.

---

## Hackathon Tips

- Build onboarding first — everything downstream depends on the user profile data
- Use hardcoded demo data as fallback so the demo never breaks
- Keep a `src/data/demoUser.js` with a pre-filled profile for the demo
- Test the Claude API calls early — PDF parsing + Claude is the highest-risk integration
- The chatbot is the easiest thing to build last and has the highest visual wow factor for judges
