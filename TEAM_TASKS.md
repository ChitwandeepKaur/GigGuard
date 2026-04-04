# GigGuard — Team Task Division

## Team Structure

| Member | Role | Owns |
|---|---|---|
| Dev 1 | Frontend Lead | Onboarding + Dashboard layout + component library |
| Dev 2 | Features Dev | Survival Mode + financial calculations |
| Dev 3 | AI/Integrations | Claude API + PDF parsing + Insurance Hub |
| Dev 4 | UI/Polish + Demo | Design system + animations + demo prep + presentation |

---

## Shared Setup (First 30 minutes — everyone together)

Do this once before splitting:

```bash
# One person creates the repo, everyone clones
npm create vite@latest gigshield -- --template react
cd gigshield
npm install react-router-dom zustand recharts lucide-react axios pdfjs-dist
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- Set up folder structure (see TECH_STACK.md)
- Add `.env` with Claude API key
- Push to GitHub, everyone pulls
- Agree on: branch per person, merge to main when feature is done

---

## Dev 1 — Frontend Lead

**Owns:** Onboarding flow, Dashboard layout, shared UI components

### Hour 1–2: Project foundation + UI components
- [ ] Set up `tailwind.config.js` with brand colors and fonts
- [ ] Add Google Fonts import to `index.html` (Syne + DM Sans + DM Mono)
- [ ] Build `src/components/ui/` shared components:
  - `Card.jsx` — base card with variants (default, hero, warning, danger)
  - `Button.jsx` — primary / secondary / danger variants
  - `Badge.jsx` — state badge component
  - `ProgressBar.jsx` — animated fill bar
- [ ] Set up React Router in `App.jsx`
- [ ] Build `Landing.jsx` — simple hero page with "Get Started" CTA

### Hour 3–5: Onboarding flow
- [ ] Build `Onboarding.jsx` — step wizard shell with progress dots
- [ ] Build `IncomeProfiler.jsx` — Step 1 form (gig type multi-select, frequency, weekly range slider, worst/best week inputs)
- [ ] Build `ExpenseSetup.jsx` — Step 2 form (three-tier expense inputs)
- [ ] Wire onboarding to `useUserStore` (Zustand)
- [ ] Build `InsuranceStep.jsx` — Step 3 placeholder (Dev 3 will wire AI recommendation)
- [ ] Navigate to Dashboard on complete

### Hour 6–8: Dashboard layout
- [ ] Build `Dashboard.jsx` page with responsive card grid
- [ ] Build `SafeToSpend.jsx` — hero card, large number, state color (wire to Dev 2's calculations)
- [ ] Build `BufferHealth.jsx` — X.X bad weeks gauge
- [ ] Build `TaxTracker.jsx` — SE tax running total + quarterly deadline
- [ ] Build `WindfallAlert.jsx` — triggered card with split breakdown
- [ ] Add nav between Dashboard and Insurance Hub

**Handoff to Dev 2:** Export `useFinanceStore` shape so Dev 2 can write calculations into it
**Handoff to Dev 3:** `InsuranceStep.jsx` stub ready to receive recommendation data
**Handoff to Dev 4:** Component library ready to consume, report any design inconsistencies

---

## Dev 2 — Features Dev

**Owns:** All financial calculations, Survival Mode, state management

### Hour 1–2: Calculations module
- [ ] Build `src/utils/calculations.js` — all financial math functions (see TECH_STACK.md for full list):
  - `calcFloorIncome`
  - `calcAverageIncome`
  - `calcVolatilityScore`
  - `calcWeeklySurvivalNumber`
  - `calcSEtaxReserve`
  - `calcSafeToSpend`
  - `getSafeToSpendState`
  - `calcBufferWeeks`
  - `calcWindfall`
- [ ] Write unit tests for each function (even just console.assert — this is hackathon speed)
- [ ] Build `useFinanceStore.js` and `useInsuranceStore.js` Zustand stores

### Hour 3–5: Wire calculations to dashboard
- [ ] Connect `SafeToSpend.jsx` to real calculated value from store
- [ ] Connect `BufferHealth.jsx` to `calcBufferWeeks`
- [ ] Connect `TaxTracker.jsx` — calculate quarterly tax owed, compute next deadline date
- [ ] Connect `WindfallAlert.jsx` — watch for income entry > good_week_threshold, trigger alert
- [ ] Add income entry input to dashboard (simple field: "Log this week's income: $___")

### Hour 6–8: Survival Mode
- [ ] Build `SurvivalBanner.jsx` — top-of-dashboard warning bar with mode indicator
- [ ] Build `SurvivalPlans.jsx` — 3 plan tabs (minimum damage / balanced / aggressive)
- [ ] Build `ShockEventPlanner.jsx` — event selector + instant revised plan output
- [ ] Build `RecoveryPlan.jsx` — post-crisis recovery steps
- [ ] Wire survival mode trigger: when logged income < floor_income → activate survival UI
- [ ] Wire dashboard color theme to survival state

**Handoff to Dev 1:** Tell Dev 1 which store values to read in Dashboard cards
**Handoff to Dev 4:** Survival mode has distinct color state — coordinate animation with Dev 4

---

## Dev 3 — AI/Integrations

**Owns:** Claude API, PDF parsing, Insurance Hub, AI chatbot

### Hour 1–2: Claude API + PDF parser
- [ ] Build `src/api/claude.js` with all API functions (see TECH_STACK.md):
  - `callClaude` (base function)
  - `summarizePolicy`
  - `generateQuizQuestions`
  - `chatWithContext`
  - `getInsuranceRecommendation`
- [ ] Build `src/utils/pdfParser.js` using pdfjs-dist
- [ ] Test both with sample insurance PDF — confirm text extraction works before building UI

### Hour 3–5: Insurance Hub
- [ ] Build `InsuranceHub.jsx` page with 3-tab layout (Recommendation / My Policy / Quiz)
- [ ] Build `PDFUpload.jsx` — drag-and-drop zone, trigger text extraction on upload
- [ ] Build `PolicySummary.jsx` — display summary card after Claude processes the PDF
  - Covered items list
  - NOT covered items list (highlighted — most important)
  - Deductible + limits + renewal date
- [ ] Build `InsuranceRecommendation.jsx` — display 3 product recommendations from Claude
- [ ] Wire `InsuranceStep.jsx` in onboarding (Dev 1's stub) to `getInsuranceRecommendation`

### Hour 6–8: Gamified quiz + chatbot
- [ ] Build `QuizGame.jsx`:
  - Show scenario question
  - 3 answer buttons: Covered / Not covered / Partial
  - Reveal: correct answer + policy clause
  - Score tracker
  - End screen with blind spots
  - Replay button
- [ ] Build `ChatbotPanel.jsx` — scrollable message list + input field
- [ ] Build `ChatbotButton.jsx` — fixed bottom-right FAB, opens/closes panel
- [ ] Build `ChatMessage.jsx` — user vs assistant message styles
- [ ] Wire chatbot to `chatWithContext` — pass PDF text + user profile as context
- [ ] Add starter prompt chips that pre-fill the input

**Handoff to Dev 1:** Chatbot button is a global overlay — coordinate z-index and positioning
**Handoff to Dev 4:** Quiz game has animations — coordinate reveal transitions

---

## Dev 4 — UI/Polish + Demo

**Owns:** Design consistency, animations, demo data, presentation prep

### Hour 1–3: Design system enforcement + demo data
- [ ] Create `src/data/demoUser.js` — pre-filled demo profile (Marcus, DoorDash driver, fills all store values realistically)
- [ ] Add a "Load demo" button on landing page — one click pre-fills everything for judges
- [ ] Audit every component from Dev 1 as it's built — check spacing, font, color against DESIGN_SPECS.md
- [ ] Add CSS transitions to all state changes (safe → warning → danger)
- [ ] Implement dark mode toggle (optional but impressive)

### Hour 4–6: Animations + polish
- [ ] Safe-to-Spend number: count-up animation on page load
- [ ] Buffer Health tracker: animated progress bar fill on mount
- [ ] Windfall Alert: slide-down entrance animation
- [ ] Survival Mode activation: background color sweep, banner slide-in
- [ ] Chatbot panel: slide-up open animation
- [ ] Quiz answer reveal: flip or fade transition
- [ ] Loading states for all Claude API calls — skeleton cards, not blank screens
- [ ] Error states — what shows if Claude API fails

### Hour 7–8: Demo prep + presentation
- [ ] Walk through full app flow end-to-end, note any bugs to fix
- [ ] Prepare demo script (see PRD.md — Demo Script section)
- [ ] Create a real insurance PDF to upload during demo (find a sample State Farm auto policy online)
- [ ] Test the quiz with the real PDF — make sure Claude generates good questions
- [ ] Prepare 2-sentence answer for each judging criterion:
  - Innovation: "No existing tool addresses gig workers' actual irregular income structure..."
  - Technical execution: "React + Claude API + PDF parsing, deployed on Vercel..."
  - Accessibility: "73 million gig workers in the US are ignored by every existing budgeting tool..."
  - Real-world impact: "The #1 financial crisis for gig workers — the April tax surprise — is preventable..."
- [ ] Time the demo: target 3–4 minutes

---

## Sync Points (Everyone)

| Time | Sync |
|---|---|
| Hour 2 end | Quick 10-min check-in. Confirm stores are shaped correctly, no blockers. |
| Hour 5 end | Integration check. Dev 1 + Dev 2 wire dashboard. Dev 3 tests Claude API live. |
| Hour 8 end | Full end-to-end run. Dev 4 reports everything that's broken. Fix together. |
| 1 hour before demo | Freeze code. Dev 4 runs demo 3× with demo data. No new features. |

---

## If You Fall Behind — Cut Priority

Cut in this order (lowest value to demo first):

1. Recovery Plan Generator — mention verbally, don't build
2. Dark mode toggle
3. Expense timing optimizer (already cut from spec)
4. Quarterly tax penalty calculator
5. Windfall Stabilizer — keep the concept, simplify to just a banner
6. Shock Event Planner — simplify to just Survival Mode plans, no event selector

**Never cut:**
- Safe-to-Spend hero widget — it's the entire pitch
- Insurance PDF → summary — State Farm judges need to see this
- Gamified quiz — most memorable feature for judges
- AI chatbot — highest wow factor in demo

---

## Git Workflow

```bash
# Each person works on their branch
git checkout -b dev1-onboarding
git checkout -b dev2-survival
git checkout -b dev3-ai
git checkout -b dev4-polish

# Commit often, push to your branch
git add .
git commit -m "feat: add income profiler step"
git push origin dev1-onboarding

# When a feature is ready, PR to main
# One person reviews quickly, merge
```

Merge conflicts will happen on `App.jsx` and the store files — communicate before touching shared files.
