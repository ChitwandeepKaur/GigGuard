# GigGuard — Product Requirements Document

## Overview

| Field | Detail |
|---|---|
| Product name | GigGuard |
| Tagline | Your financial safety net for unpredictable income |
| Hackathon track | State Farm — Financial Wellness |
| Target user | Gig workers aged 18–40 (rideshare, delivery, freelance, tips-based) |
| Core problem | Every financial tool assumes a fixed salary. Gig workers earn irregularly and are massively underinsured. |

---

## Track Alignment

The State Farm Financial Wellness track asks for projects that:

- Improve financial literacy → Insurance Hub (PDF summary, gamified quiz, chatbot)
- Help people plan for the unexpected → Survival Mode, Shock Event Planner
- Make financial products more accessible for underserved communities → Gig workers are 73M strong and ignored by every existing tool
- Examples mentioned on slide: budgeting tools, insurance education, risk calculators, emergency planning apps → GigGuard covers all four

Judging criteria: Innovation, technical execution, accessibility, real-world impact

---

## Problem Statement

Gig workers are failed by every existing financial tool because they were all designed for salaried people. A budget app that assumes you make $3,200/month is useless when you made $4,100 in March and $1,800 in February.

Three specific crises no existing tool solves:

1. They don't know how much they can safely spend right now
2. They get blindsided by a 15.3% self-employment tax bill every April
3. They are massively underinsured — personal auto insurance doesn't cover you while DoorDashing

---

## User Personas

**Primary: Marcus, 26, DoorDash + Uber driver**
- Earns $800–$2,200/week depending on demand
- No employer benefits, no 401k, no health insurance
- Got hit with a $3,400 tax bill last April, didn't see it coming
- Doesn't understand the difference between his personal and commercial insurance coverage

**Secondary: Priya, 31, freelance graphic designer**
- Monthly income varies wildly — $1,500 to $6,000
- Has a mortgage, uses personal savings as a buffer
- Never uploaded or read her renters insurance policy in full

---

## User Flow

```
Landing page
    ↓
Onboarding Step 1 — Income Pattern Profiler
    ↓
Onboarding Step 2 — Expense Setup + Survival Number
    ↓
Onboarding Step 3 — Insurance Recommendation
    ↓
Dashboard (main view)
    ├── Normal mode
    └── Survival mode (auto-triggered)
    ↓
Insurance Hub (tab/section)
    ├── PDF upload → Quick summary
    ├── Gamified quiz
    └── Coverage gap score
    ↓
AI Chatbot (persistent, bottom-right corner)
```

---

## Feature Specifications

### Module 1 — Onboarding

**Step 1: Income Pattern Profiler**

Inputs:
- How do you earn? (multi-select: rideshare, delivery, freelance, tips, part-time shifts, other)
- How often does income arrive? (daily / weekly / randomly)
- Typical week range: low end $ — high end $ (dual slider)
- Worst week in last 3 months: $ (input)
- Best week in last 3 months: $ (input)

Outputs computed:
- `floor_income` = worst week input
- `average_income` = (low + high) / 2
- `volatility_score` = (high - low) / average × 100
- `good_week_threshold` = best week input

**Step 2: Expense Setup + Survival Number**

Three expense tiers, user inputs weekly amounts:

| Tier | Examples |
|---|---|
| Non-negotiable | Rent, utilities, debt minimums, transport, groceries, insurance |
| Semi-flexible | Phone, subscriptions, childcare |
| Fully flexible | Eating out, shopping, entertainment |

Output: `weekly_survival_number` = sum of non-negotiable expenses ÷ 4.33

**Step 3: Insurance Recommendation**

Logic: based on gig_type + income_volatility + existing_coverage answers, rank 3 insurance products with plain-English explanation. Flag coverage gaps specific to their gig type.

State Farm products to surface: occupational accident insurance, commercial auto rider, renters liability.

---

### Module 2 — Dashboard

**Hero widget: Safe-to-Spend This Week**

Formula:
```
safe_to_spend = available_cash
              - bills_due_this_week
              - (emergency_buffer_target - current_buffer)
              - weekly_tax_reserve
              - volatility_cushion
```

Four visual states:

| State | Color | Condition |
|---|---|---|
| Confidently safe | Teal | safe_to_spend > average_weekly_flex |
| Safe if income arrives | Amber | safe_to_spend > 0 but relies on expected income |
| Risky | Orange | safe_to_spend < survival_number |
| Overspending danger | Red | safe_to_spend < 0 |

**Buffer Health Tracker**

- Visual: "Your buffer covers X.X bad weeks"
- Progress bar toward target (3 bad weeks = fully protected)
- Contextual tip when below target: "Save $X extra this week to reach safety"

Tiers:
- 🔴 Vulnerable: < 1 bad week covered
- 🟡 Building: 1–2 bad weeks covered
- 🟢 Protected: 3+ bad weeks covered

**Self-Employment Tax Tracker**

- Running total of estimated SE tax owed (15.3% of net earnings)
- Quarterly deadline countdown (Jan 15, Apr 15, Jun 15, Sep 15)
- Per-income-entry prompt: "Set aside $X from this payment"
- What-if display: "If you don't pay quarterly, estimated penalty: $X"

**Windfall Stabilizer**

Triggered when: current week income > good_week_threshold

Display:
```
You made $420 more than your usual week.

Suggested split:
  50% → Shock buffer         $210
  20% → Overdue bills        $84
  20% → Next week essentials $84
  10% → Flexible spending    $42
```

---

### Module 3 — Survival Mode

Auto-triggered when logged income < floor_income. Dashboard shifts to a focused warning UI.

**Low Week Survival Mode**

Generates 3 plans:

| Plan | Description |
|---|---|
| Minimum damage | Pay only non-negotiables, defer everything else |
| Balanced survival | Reduce semi-flexible, protect essentials |
| Aggressive cutback | Eliminate all flexible spend, accelerate recovery |

Each plan shows:
- Revised weekly allowance
- List of what to freeze
- Days until next income expected
- Projected shortfall if any

**Shock Event Planner**

User selects event type:
- No shifts this week
- Client paid late
- Car breakdown
- Medical expense
- Device repair
- Temporary job loss

Instant output:
- New safe-spend number
- Revised survival timeline (days)
- Bill priority order (what to pay first)
- Cash gap amount
- Suggested action: gig to pick up, expense to cut, buffer to tap

**Recovery Plan Generator**

Post-crisis mode — activated after a bad week ends.

Output:
- How much extra to save in next good week
- Estimated weeks to rebuild buffer to pre-crisis level
- Expenses to temporarily reduce
- Missed obligations needing urgent attention (ranked)

---

### Module 4 — Insurance Hub

**Insurance Recommendation Card**

Generated from onboarding profile. Shows:
- Coverage gap score: 🔴 Vulnerable / 🟡 Partial / 🟢 Protected
- Top 3 recommended products with plain-English explanation
- One-line reason each product matters for their gig type
- Link/CTA to learn more (State Farm tie-in)

**PDF Quick Summary**

User uploads their policy PDF. Output card shows:

- What IS covered (3–5 bullets, plain English)
- What is NOT covered (most critical for gig workers)
- Deductible amount
- Coverage limits
- Renewal date

This is a separate static card, not the chatbot. User can re-upload at any time.

**Gamified Quiz**

Triggered once automatically on PDF upload. Replayable anytime.

Format:
- 5 scenario questions generated from their actual uploaded policy
- Each question: scenario description + "Covered" / "Not covered" / "Partially covered" buttons
- Reveal: shows the exact clause from their policy doc that answers it
- Score shown at end (e.g. 3/5)
- "Coverage blind spots" section: scenarios they got wrong = gaps to fix
- Replay button always visible

Example question:
> "You're delivering food and rear-end another car. Your personal auto policy — covered or not covered?"

**AI Chatbot**

Persistent floating button, bottom-right corner. Slide-up panel.

Two modes (auto-detected):
- Insurance mode: uses uploaded PDF as context, answers what-if scenarios
- Budgeting mode: uses financial profile, answers income/expense questions

Starter prompts shown on open:
- "What if I get injured on the job?"
- "Does my policy cover a rental car?"
- "I only made $600 this week — what do I do?"
- "When is my next quarterly tax deadline?"

---

## Out of Scope (Hackathon)

- Plaid bank integration (use manual income input — mention Plaid as future roadmap)
- Push notifications
- Multi-user / family mode
- Native mobile app
- Actual insurance purchase flow

---

## Success Metrics (Post-Hackathon)

| Metric | Target |
|---|---|
| Onboarding completion rate | > 70% |
| Users who reach Safe-to-Spend calculation | > 80% |
| Insurance PDF uploads | > 40% of users |
| Quiz completion rate | > 60% of uploaders |
| Chatbot queries per session | > 2 |
