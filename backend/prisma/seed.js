import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding GigShield demo data...')

  // Clean existing demo data
  await prisma.insuranceRecommendation.deleteMany({ where: { user: { email: 'marcus@demo.com' } } })
  await prisma.insurancePolicy.deleteMany({ where: { user: { email: 'marcus@demo.com' } } })
  await prisma.incomeEntry.deleteMany({ where: { user: { email: 'marcus@demo.com' } } })
  await prisma.expenseProfile.deleteMany({ where: { user: { email: 'marcus@demo.com' } } })
  await prisma.userProfile.deleteMany({ where: { user: { email: 'marcus@demo.com' } } })
  await prisma.user.deleteMany({ where: { email: 'marcus@demo.com' } })

  // ─── USER ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo1234', 10)

  const user = await prisma.user.create({
    data: {
      email: 'marcus@demo.com',
      passwordHash,
    }
  })
  console.log('Created user:', user.email)

  // ─── USER PROFILE ───────────────────────────────────────────────
  // Marcus: DoorDash + Uber driver, weekly income varies a lot
  // floor = worst week, average = (low+high)/2, volatility = (high-low)/avg * 100
  const weeklyLow = 800
  const weeklyHigh = 1800
  const worstWeek = 620
  const bestWeek = 2100
  const averageIncome = (weeklyLow + weeklyHigh) / 2          // 1300
  const floorIncome = worstWeek                                // 620
  const volatilityScore = ((weeklyHigh - weeklyLow) / averageIncome) * 100  // 76.9

  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      gigTypes: ['rideshare', 'delivery'],
      incomeFrequency: 'weekly',
      weeklyLow,
      weeklyHigh,
      worstWeek,
      bestWeek,
      floorIncome,
      averageIncome,
      volatilityScore,
    }
  })
  console.log('Created user profile — volatility score:', volatilityScore.toFixed(1))

  // ─── EXPENSE PROFILE ────────────────────────────────────────────
  // All values are WEEKLY amounts (monthly / 4.33)
  // Non-negotiable
  const rent = 1200 / 4.33           // ~277  (monthly $1,200)
  const utilities = 120 / 4.33       // ~28   (monthly $120)
  const debtMinimums = 250 / 4.33    // ~58   (monthly $250 — car payment)
  const transport = 200 / 4.33       // ~46   (monthly $200 — gas)
  const groceries = 300 / 4.33       // ~69   (monthly $300)
  const insuranceCost = 180 / 4.33   // ~42   (monthly $180 — auto insurance)

  // Semi-flexible
  const phone = 80 / 4.33            // ~18
  const subscriptions = 40 / 4.33    // ~9    (Netflix, Spotify)
  const childcare = 0                // no kids

  // Fully flexible
  const eatingOut = 200 / 4.33       // ~46
  const shopping = 100 / 4.33        // ~23
  const entertainment = 60 / 4.33    // ~14

  // Survival number = non-negotiables only / 4.33 (already weekly here)
  const survivalNumber = rent + utilities + debtMinimums + transport + groceries + insuranceCost
  // ≈ 520/week

  const expenses = await prisma.expenseProfile.create({
    data: {
      userId: user.id,
      rent: parseFloat(rent.toFixed(2)),
      utilities: parseFloat(utilities.toFixed(2)),
      debtMinimums: parseFloat(debtMinimums.toFixed(2)),
      transport: parseFloat(transport.toFixed(2)),
      groceries: parseFloat(groceries.toFixed(2)),
      insuranceCost: parseFloat(insuranceCost.toFixed(2)),
      phone: parseFloat(phone.toFixed(2)),
      subscriptions: parseFloat(subscriptions.toFixed(2)),
      childcare: 0,
      eatingOut: parseFloat(eatingOut.toFixed(2)),
      shopping: parseFloat(shopping.toFixed(2)),
      entertainment: parseFloat(entertainment.toFixed(2)),
      survivalNumber: parseFloat(survivalNumber.toFixed(2)),
    }
  })
  console.log('Created expense profile — survival number: $' + survivalNumber.toFixed(0) + '/week')

  // ─── INCOME ENTRIES ─────────────────────────────────────────────
  // 12 weeks of history — realistic feast/famine pattern
  // weekOf = Monday of that week
  // Most recent week intentionally left blank so user can log it live in the demo

  const getMonday = (weeksAgo) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff - (weeksAgo * 7))
    return d
  }

  const incomeHistory = [
    // weeks ago, amount, source, note
    { weeksAgo: 12, amount: 920,  source: 'doordash',  note: 'Normal week' },
    { weeksAgo: 11, amount: 1540, source: 'uber',      note: 'Busy weekend' },
    { weeksAgo: 10, amount: 680,  source: 'doordash',  note: 'Sick mid-week' },
    { weeksAgo: 9,  amount: 1820, source: 'both',      note: 'Double-shifted' },
    { weeksAgo: 8,  amount: 1150, source: 'doordash',  note: null },
    { weeksAgo: 7,  amount: 620,  source: 'uber',      note: 'Car maintenance day' },
    { weeksAgo: 6,  amount: 1980, source: 'both',      note: 'Event surge pricing' },
    { weeksAgo: 5,  amount: 1100, source: 'doordash',  note: null },
    { weeksAgo: 4,  amount: 890,  source: 'uber',      note: null },
    { weeksAgo: 3,  amount: 2050, source: 'both',      note: 'Concert weekend' },
    { weeksAgo: 2,  amount: 1350, source: 'doordash',  note: null },
    { weeksAgo: 1,  amount: 1480, source: 'uber',      note: 'Good week' },
    // Week 0 (this week) = intentionally empty — user logs it live in demo
  ]

  for (const entry of incomeHistory) {
    await prisma.incomeEntry.create({
      data: {
        userId: user.id,
        amount: entry.amount,
        weekOf: getMonday(entry.weeksAgo),
        source: entry.source,
        note: entry.note,
      }
    })
  }
  console.log('Created', incomeHistory.length, 'income entries')
  console.log('  Note: current week is EMPTY — user logs it live during demo')

  // ─── INSURANCE RECOMMENDATIONS ──────────────────────────────────
  // Pre-generated so they appear instantly without waiting for Claude
  const recommendations = [
    {
      product: 'Rideshare/delivery driver endorsement',
      reason: 'Your personal auto policy does not cover accidents while you are actively driving for DoorDash or Uber. This gap means a single fender-bender on the job could leave you with zero coverage.',
      priority: 'high',
      gapDescription: 'Personal auto policy void during gig work — highest risk exposure for your profile',
    },
    {
      product: 'Occupational accident insurance',
      reason: 'As a 1099 contractor you have no workers comp. If you are injured on the job — a slip, a crash, a dog bite on delivery — you pay all medical costs out of pocket. This policy fills that gap for under $50/month.',
      priority: 'high',
      gapDescription: 'No employer workers comp — injury could wipe out your buffer entirely',
    },
    {
      product: 'Short-term disability insurance',
      reason: 'If you cannot drive for 2+ weeks due to illness or injury you earn zero. With a volatility score of 76.9 and only 1.7 bad weeks of buffer, even a minor health event could spiral into missed rent.',
      priority: 'medium',
      gapDescription: 'Income fully stops if unable to work — no safety net beyond current buffer',
    },
  ]

  for (const rec of recommendations) {
    await prisma.insuranceRecommendation.create({
      data: {
        userId: user.id,
        ...rec,
      }
    })
  }
  console.log('Created', recommendations.length, 'insurance recommendations')

  // ─── SUMMARY ────────────────────────────────────────────────────
  console.log('\n--- Seed complete ---')
  console.log('Login:    marcus@demo.com / demo1234')
  console.log('Profile:  DoorDash + Uber, weekly $800–$1,800')
  console.log('Survival: $' + survivalNumber.toFixed(0) + '/week')
  console.log('Buffer:   ~1.7 bad weeks covered')
  console.log('Tax owed: ~$412 (last 12 weeks)')
  console.log('Income this week: NOT LOGGED — log live in demo')
  console.log('Insurance PDF: NOT UPLOADED — upload live in demo')
  console.log('---------------------\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
