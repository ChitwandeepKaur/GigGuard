# GigGuard

> Your financial safety net for unpredictable income

Built for the **State Farm Financial Wellness** track at [Hackathon Name].

## Team: Delta Force
**Members:**
- Satwik Mazumdar
- Chitwandeep Kaur Palne
- Aditya Deshpande
- Deep Sharma

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
- **Safe-to-Spend This Week** — the hero feature: a real-time number based on cash, bills, buffer, and tax reserves
- **Buffer Health Tracker** — "You can survive X.X bad weeks"
- **SE Tax Tracker** — real-time tax set-aside + quarterly deadline countdown
- **Windfall Stabilizer** — guides allocation when you have a great week
- **Survival Mode** — auto-triggered on low income weeks, generates 3 recovery plans
- **Shock Event Planner** — instant financial plan for car breakdowns, late payments, etc.
- **Insurance Recommendation** — personalized coverage suggestions from your profile
- **PDF Policy Summary** — upload your insurance doc, get plain-English breakdown
- **Gamified Quiz** — 5 scenario questions from your actual policy, reveals exact clauses
- **AI Chatbot** — answers insurance and budgeting questions using your profile + policy doc

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Zustand (state management)
- Recharts (data visualization)
- Claude API (AI features)
- pdfjs-dist (PDF parsing)
- React Router 6
- Vercel (hosting)

---

## Getting Started

```bash
git clone https://github.com/ChitwandeepKaur/GigGuard.git
cd GigGuard
npm install
```

Create `.env`:
```
VITE_ANTHROPIC_API_KEY=your_key_here
```

```bash
npm run dev
```

---

## Team

| Member | Role |
|---|---|
| Dev 1 | Frontend Lead — Onboarding + Dashboard |
| Dev 2 | Features Dev — Calculations + Survival Mode |
| Dev 3 | AI/Integrations — Claude API + Insurance Hub |
| Dev 4 | UI/Polish + Demo |

---

## Demo

Click "Load Demo" on the landing page to pre-fill a realistic gig worker profile (Marcus, DoorDash driver) and see all features live.

---

## Docs

- [PRD.md](./PRD.md) — Full product requirements
- [DESIGN_SPECS.md](./DESIGN_SPECS.md) — Colors, typography, component specs
- [TECH_STACK.md](./TECH_STACK.md) — Stack details, code patterns, setup
- [TEAM_TASKS.md](./TEAM_TASKS.md) — Task division and build order
