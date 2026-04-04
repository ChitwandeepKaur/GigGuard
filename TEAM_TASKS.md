# GigGuard — Team Task Division

## Team Structure

| Member | Role | Owns |
|---|---|---|
| Dev 1 | Frontend Lead | Onboarding + Dashboard layout + UI component library |
| Dev 2 | Features Dev | Financial calculations (server) + Survival Mode (client) |
| Dev 3 | AI/Backend Lead | Express server setup + all backend routes + Claude API + Insurance Hub |
| Dev 4 | UI/Polish + Demo | Design system + animations + demo data + presentation |

---

## Shared Setup — First 45 minutes (everyone together)

Do this once before splitting. One person drives, everyone watches.

```bash
mkdir GigGuard && cd GigGuard
git init

# Create client
npm create vite@latest client -- --template react
cd client
npm install react-router-dom zustand recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..

# Create server
mkdir server && cd server
npm init -y
npm install express cors dotenv prisma @prisma/client @supabase/supabase-js \
            @anthropic-ai/sdk multer pdfjs-dist
npx prisma init
cd ..

# Push to GitHub, everyone clones
git add . && git commit -m "init: project scaffold"
```

Then together:
- Dev 3 creates the Supabase project, shares `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY` with team
- Everyone adds their `.env` files (client and server) — see TECH_STACK.md for values
- Dev 3 pastes the Prisma schema (from BACKEND.md) and runs `npx prisma db push`
- Confirm the server starts: `node server/src/index.js`
- Confirm the client starts: `cd client && npm run dev`
- Push, everyone pulls, everyone branches

**Only split once the server is confirmed running and the DB tables exist.**

---

## Dev 1 — Frontend Lead

**Owns:** All client-side UI. Calls `api.*` functions — never fetches directly.

### Hour 1–2: Foundation + UI components
- [x] Set up `tailwind.config.js` with brand colors and fonts (copy from TECH_STACK.md)
- [x] Add Google Fonts to `index.html` (Syne + DM Sans + DM Mono)
- [x] Build `src/components/ui/`:
  - `Card.jsx` — default / hero / warning / danger variants
  - `Button.jsx` — primary / secondary / danger
  - `Badge.jsx` — state badge (safe / warning / risky / danger)
  - `ProgressBar.jsx` — animated fill, takes `value` and `color` props
- [x] Set up React Router + `ProtectedRoute` in `App.jsx` (copy from TECH_STACK.md)
- [x] Build `Landing.jsx` — hero copy, "Get Started" → `/onboarding`, "Load Demo" button

### Hour 3–5: Onboarding flow
- [ ] Build `Onboarding.jsx` — step wizard shell, progress dots, step state
- [ ] Build `IncomeProfiler.jsx` — gig type multi-select, frequency radio, weekly range slider, worst/best week inputs
- [ ] Build `ExpenseSetup.jsx` — three-tier expense form, running survival number preview
- [ ] Build `InsuranceStep.jsx` — stub card: "Generating your recommendation..." with loading state (Dev 3 wires the real data)
- [ ] On complete: call `api.user.createProfile(data)`, store token, navigate to `/dashboard`

### Hour 6–8: Dashboard layout
- [ ] Build `Dashboard.jsx` — responsive card grid, calls `api.finance.getSummary()` on mount, hydrates `useFinanceStore`
- [ ] Build `SafeToSpend.jsx` — large hero number, state color border, state badge label
- [ ] Build `BufferHealth.jsx` — "X.X bad weeks" text, progress bar toward 3-week target
- [ ] Build `TaxTracker.jsx` — tax owed total, quarterly deadline countdown, "set aside" prompt
- [ ] Build `WindfallAlert.jsx` — slide-down card, shows split breakdown (only renders if `windfall !== null`)
- [ ] Add income entry input: "$___ this week" field, calls `api.finance.logIncome()`
- [ ] Add nav bar: Dashboard / Insurance links

**Handoffs:**
- Tell Dev 2 the exact store shape `useFinanceStore` needs so the summary endpoint maps cleanly
- Leave `InsuranceStep.jsx` as a stub — Dev 3 will complete it
- Tell Dev 4 which components are done so polish can start rolling

---

## Dev 2 — Features Dev

**Owns:** All financial logic on the server + Survival Mode UI on the client.

### Hour 1–2: Server calculations + finance routes
- [ ] Build `server/src/services/calculations.js` — all math functions (copy from TECH_STACK.md):
  - `calcFloorIncome`, `calcAverageIncome`, `calcVolatilityScore`
  - `calcWeeklySurvivalNumber`, `calcSEtaxReserve`
  - `calcSafeToSpend`, `getSafeToSpendState`
  - `calcBufferWeeks`, `calcWindfall`
- [ ] Build `server/src/routes/finance.js`:
  - `GET /api/finance/summary` — runs all calculations, returns full dashboard payload
  - `POST /api/finance/income` — saves income entry to DB
  - `GET /api/finance/income` — returns last 12 weeks of entries
- [ ] Register finance routes in `server/src/index.js`
- [ ] Test with Postman or curl: `POST /api/finance/income` and `GET /api/finance/summary`

### Hour 3–5: Wire calculations to client dashboard
- [ ] Build `client/src/store/useFinanceStore.js` (copy from TECH_STACK.md)
- [ ] In `Dashboard.jsx` (coordinate with Dev 1): on mount call `api.finance.getSummary()`, populate store
- [ ] Confirm `SafeToSpend.jsx` reads from store correctly
- [ ] Confirm `BufferHealth.jsx` reads `bufferWeeks` from store
- [ ] Confirm `TaxTracker.jsx` reads `totalTaxOwed` + computes next quarterly deadline date
- [ ] Confirm `WindfallAlert.jsx` renders only when `windfall !== null`

### Hour 6–8: Survival Mode (client)
- [ ] Build `SurvivalBanner.jsx` — top banner, amber/red, only renders when `isSurvivalMode === true`
- [ ] Build `SurvivalPlans.jsx` — 3 tab plans (minimum damage / balanced / aggressive), each shows weekly allowance + what to freeze
- [ ] Build `ShockEventPlanner.jsx` — event type selector (6 options), output card with revised plan
- [ ] Build `RecoveryPlan.jsx` — post-crisis steps: weeks to rebuild, extra to save, what to pay first
- [ ] Wire survival mode trigger: `isSurvivalMode` from finance summary → activates banner + plan UI
- [ ] Coordinate with Dev 4: survival mode shifts the dashboard color theme

**Handoffs:**
- Share exact response shape of `GET /api/finance/summary` with Dev 1 so dashboard components wire correctly
- Survival mode color state → tell Dev 4 which CSS class/variable to toggle

---

## Dev 3 — AI/Backend Lead

**Owns:** The entire Express server, all AI features, and the Insurance Hub.

### Hour 1–2 (during shared setup): Server foundation
- [ ] Create Supabase project, share credentials with team
- [ ] Paste Prisma schema (from BACKEND.md) into `server/src/prisma/schema.prisma`
- [ ] Run `npx prisma db push` and `npx prisma generate`
- [ ] Build `server/src/index.js` — Express app, CORS, middleware, route registration (copy from BACKEND.md)
- [ ] Build `server/src/middleware/auth.js` — Supabase JWT verification (copy from BACKEND.md)
- [ ] Build `server/src/middleware/errorHandler.js` — global error handler
- [ ] Build `server/src/routes/auth.js` — register, login, logout, me
- [ ] Build `server/src/routes/user.js` — profile CRUD, dashboard endpoint
- [ ] Confirm auth flow works: register → login → get JWT → call protected route

### Hour 3–5: Claude services + Insurance routes
- [ ] Build `server/src/services/claude.js` — all 4 Claude functions (copy from TECH_STACK.md):
  - `summarizePolicy`, `generateQuizQuestions`, `getInsuranceRecommendation`, `chatWithContext`
- [ ] Build `server/src/services/pdfParser.js` (copy from TECH_STACK.md)
- [ ] Build `server/src/routes/insurance.js`:
  - `POST /api/insurance/upload` — multer + Supabase Storage + PDF extract + Claude summary
  - `GET /api/insurance/policy` — return stored policy + summary
  - `POST /api/insurance/quiz/generate` — Claude quiz generation, save to DB
  - `GET /api/insurance/quiz` — return stored questions
  - `POST /api/insurance/quiz/score` — save score
  - `GET /api/insurance/recommendation` — Claude recommendation from profile
- [ ] Build `server/src/routes/ai.js` — chat proxy (copy from BACKEND.md)
- [ ] Test PDF upload end-to-end with a real insurance PDF

### Hour 6–8: Insurance Hub (client)
- [ ] Build `InsuranceHub.jsx` — 3-tab layout (Recommendation / My Policy / Quiz)
- [ ] Build `PDFUpload.jsx` — drag-and-drop zone, calls `api.insurance.uploadPDF(formData)`, shows loading state
- [ ] Build `PolicySummary.jsx` — covered list, NOT covered list (highlighted), deductible/limits/renewal
- [ ] Build `InsuranceRecommendation.jsx` — 3 product cards from `api.insurance.getRecommendation()`
- [ ] Complete `InsuranceStep.jsx` stub in onboarding (Dev 1's placeholder) — wire to recommendation endpoint
- [ ] Build `QuizGame.jsx`:
  - Fetch questions from `api.insurance.getQuiz()`
  - Show scenario → 3 answer buttons → reveal correct answer + policy clause
  - Score tracking, end screen with blind spots, replay button
- [ ] Build `ChatbotPanel.jsx` + `ChatbotButton.jsx` + `ChatMessage.jsx`
- [ ] Wire chatbot: send `messages` array to `api.ai.chat()`, append response to UI

**Handoffs:**
- Share auth flow (login → store token) with Dev 1 so onboarding wires correctly
- Chatbot button is a global overlay — coordinate z-index with Dev 1

---

## Dev 4 — UI/Polish + Demo

**Owns:** Everything the judges see and feel. No feature code — pure quality.

### Hour 1–3: Design system + demo data
- [ ] Build `client/src/data/demoUser.js` — realistic pre-filled profile for Marcus (DoorDash driver):
  - Income: low $800/week, high $1,800, worst $620, best $2,100
  - Expenses: rent $900/mo, car $320/mo, groceries $150/mo, phone $80/mo
  - Finance summary: safeToSpend $340, bufferWeeks 1.7, taxOwed $412, isSurvivalMode false
- [ ] Wire "Load Demo" button on `Landing.jsx` — skips auth, pre-fills all stores, navigates to dashboard
- [ ] Audit every component from Dev 1 as it's built — flag spacing, font, or color issues immediately
- [ ] Implement CSS variables for survival mode theme shift (coordinate with Dev 2)
- [ ] Add dark mode toggle (optional — attempt if ahead of schedule)

### Hour 4–6: Animations + polish
- [ ] Safe-to-Spend number: count-up animation on load (use CSS `@keyframes` or requestAnimationFrame)
- [ ] Buffer Health progress bar: animate fill on mount (CSS transition)
- [ ] Windfall Alert: slide-down entrance (`transform: translateY` transition)
- [ ] Survival Mode banner: background color sweep across dashboard on activation
- [ ] Chatbot panel: slide-up open / slide-down close
- [ ] Quiz answer reveal: fade + scale transition on reveal card
- [ ] Loading skeletons for ALL Claude API calls — animated gray placeholder cards, never blank screens
- [ ] Error states — what renders if any API call fails (don't leave it as a blank white card)
- [ ] Confirm all interactive elements have hover + focus states
- [ ] Mobile responsiveness check — open on phone or devtools mobile view

### Hour 7–8: Demo prep
- [ ] Full end-to-end run of the app using demo data — note every bug, triage with team
- [ ] Rehearse demo script (from PRD.md) — target 3.5 minutes
- [ ] Find or create a real-looking insurance PDF for the demo upload (search "sample auto insurance policy PDF")
- [ ] Run the PDF through the app — confirm summary looks good, quiz generates sensible questions
- [ ] Prepare spoken answers for each judging criterion:
  - **Innovation:** "No existing tool models irregular income. We built around floor income, not monthly averages."
  - **Technical execution:** "React frontend, Express backend, PostgreSQL via Supabase, Claude API for all AI features, deployed on Railway + Vercel."
  - **Accessibility:** "73 million gig workers in the US have no financial tools built for them. We built specifically for their income structure."
  - **Real-world impact:** "The April SE tax surprise destroys gig workers every year. Our tracker prevents it. The insurance quiz surfaces coverage gaps they didn't know existed."
- [ ] Time the full demo 3 times. Under 4 minutes is the target.
- [ ] One hour before judging: freeze all code, no new features.

---

## Sync Points

| Time | What to check |
|---|---|
| After shared setup (~45 min) | Server running, DB tables exist, everyone branched. Don't split until this is confirmed. |
| Hour 2 end | Dev 3: auth routes working. Dev 2: finance summary endpoint returning data. Dev 1: UI components built. |
| Hour 5 end | Full integration test. Dev 1 + Dev 2 wire dashboard to real API. Dev 3 tests PDF upload live. |
| Hour 8 end | End-to-end run. Dev 4 lists everything broken. Triage and fix together. |
| 1 hour before demo | Code freeze. Dev 4 runs demo 3× with demo data only. |

---

## Cut Priority (If Behind)

Cut in this order — lowest demo value first:

1. Recovery Plan Generator — mention in pitch, skip building
2. Dark mode toggle
3. Shock Event Planner — simplify to just showing 3 survival plans, no event selector
4. Quarterly tax penalty calculator
5. Windfall Stabilizer — just show the banner text, skip the split breakdown
6. Auth (login/register screens) — if backend is behind, use demo mode only for the demo

**Never cut:**
- Safe-to-Spend hero widget — it IS the product
- Insurance PDF → plain-English summary — State Farm judges need to see this
- Gamified quiz — most memorable moment for judges
- AI chatbot — highest wow factor

---

## Git Workflow

```bash
# Each person on their own branch
git checkout -b dev1-frontend
git checkout -b dev2-features
git checkout -b dev3-backend
git checkout -b dev4-polish

# Commit often
git add . && git commit -m "feat: safe-to-spend card"
git push origin dev1-frontend

# PR to main when a feature is done
# One other person does a quick review, merge
```

Files most likely to conflict: `App.jsx`, `server/src/index.js`, store files.
Communicate before touching any of these. Whoever touches them last wins and should re-merge carefully.
