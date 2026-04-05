import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding GigShield demo data...')

  // ─── USER & CLEANUP ─────────────────────────────────────────────
  // Clean existing demo data for both marcus (old) and test (new)
  const cleanupEmails = ['marcus@demo.com', 'test@gmail.com'];
  for (const email of cleanupEmails) {
    await prisma.insuranceRecommendation.deleteMany({ where: { user: { email } } })
    await prisma.insurancePolicy.deleteMany({ where: { user: { email } } })
    await prisma.expenseEntry.deleteMany({ where: { user: { email } } })
    await prisma.incomeEntry.deleteMany({ where: { user: { email } } })
    await prisma.expenseProfile.deleteMany({ where: { user: { email } } })
    await prisma.userProfile.deleteMany({ where: { user: { email } } })
    await prisma.user.deleteMany({ where: { email } })
  }

  // ─── SUPABASE AUTH ──────────────────────────────────────────────
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  let userId;
  const demoEmail = 'test@gmail.com';
  const demoPassword = 'demo1234';

  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword
  });

  if (signInData?.user) {
    userId = signInData.user.id;
  } else {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword
    });
    if (signUpError) {
      console.error('Supabase Auth error:', signUpError);
      throw signUpError;
    }
    userId = signUpData?.user?.id;
  }

  // ─── USER ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(demoPassword, 10)

  const user = await prisma.user.create({
    data: {
      id: userId,
      email: demoEmail,
      password_hash: passwordHash,
    }
  })
  console.log('Created user:', user.email)

  // ─── USER PROFILE ───────────────────────────────────────────────
  // Marcus: DoorDash + Uber driver, weekly income varies a lot
  const weeklyLow = 800
  const weeklyHigh = 1800
  const worstWeek = 620
  const bestWeek = 2100
  const averageIncome = (weeklyLow + weeklyHigh) / 2
  const floorIncome = worstWeek
  const volatilityScore = ((weeklyHigh - weeklyLow) / averageIncome) * 100

  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      gig_types: ['rideshare', 'delivery'],
      income_frequency: 'weekly',
      weekly_low: weeklyLow,
      weekly_high: weeklyHigh,
      worst_week: worstWeek,
      best_week: bestWeek,
      floor_income: floorIncome,
      average_income: averageIncome,
      volatility_score: volatilityScore,
      available_cash: 820,
      current_buffer: 884
    }
  })
  console.log('Created user profile — volatility score:', volatilityScore.toFixed(1))

  // ─── EXPENSE PROFILE ────────────────────────────────────────────
  const rent = 1200 / 4.33
  const utilities = 120 / 4.33
  const debtMinimums = 250 / 4.33
  const transport = 200 / 4.33
  const groceries = 300 / 4.33
  const insuranceCost = 180 / 4.33

  const phone = 80 / 4.33
  const subscriptions = 40 / 4.33

  const eatingOut = 200 / 4.33
  const shopping = 100 / 4.33
  const entertainment = 60 / 4.33

  const survivalNumber = rent + utilities + debtMinimums + transport + groceries + insuranceCost

  const expenses = await prisma.expenseProfile.create({
    data: {
      userId: user.id,
      rent: parseFloat(rent.toFixed(2)),
      utilities: parseFloat(utilities.toFixed(2)),
      debt_minimums: parseFloat(debtMinimums.toFixed(2)),
      transport: parseFloat(transport.toFixed(2)),
      groceries: parseFloat(groceries.toFixed(2)),
      insurance_cost: parseFloat(insuranceCost.toFixed(2)),
      phone: parseFloat(phone.toFixed(2)),
      subscriptions: parseFloat(subscriptions.toFixed(2)),
      eating_out: parseFloat(eatingOut.toFixed(2)),
      shopping: parseFloat(shopping.toFixed(2)),
      entertainment: parseFloat(entertainment.toFixed(2)),
      survival_number: parseFloat(survivalNumber.toFixed(2)),
    }
  })
  console.log('Created expense profile — survival number: $' + survivalNumber.toFixed(0) + '/week')

  // ─── INCOME ENTRIES ─────────────────────────────────────────────
  const getMonday = (weeksAgo) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff - (weeksAgo * 7))
    return d
  }

  const incomeHistory = [
    { weeksAgo: 4,  amount: 890,  source: 'uber',      note: null },
    { weeksAgo: 3,  amount: 2050, source: 'both',      note: 'Concert weekend' },
    { weeksAgo: 2,  amount: 1350, source: 'doordash',  note: null },
    { weeksAgo: 1,  amount: 1480, source: 'uber',      note: 'Good week' },
  ]

  for (const entry of incomeHistory) {
    await prisma.incomeEntry.create({
      data: {
        userId: user.id,
        amount: entry.amount,
        week_of: getMonday(entry.weeksAgo),
        source: entry.source,
        note: entry.note,
      }
    })
  }
  console.log('Created', incomeHistory.length, 'income entries')
  
  // ─── EXPENSE ENTRIES ────────────────────────────────────────────
  const expenseHistory = [
    { daysAgo: 2, amount: 45.20, category: 'fuel',     note: 'Shell station fill-up' },
    { daysAgo: 5, amount: 12.50, category: 'food',     note: 'Lunch on route' },
    { daysAgo: 8, amount: 89.99, category: 'service',  note: 'Oil change and inspection' },
    { daysAgo: 10, amount: 35.00, category: 'fuel',    note: 'Gas' },
    { daysAgo: 12, amount: 15.00, category: 'other',   note: 'Car wash' },
  ]

  for (const entry of expenseHistory) {
    const d = new Date()
    d.setDate(d.getDate() - entry.daysAgo)
    await prisma.expenseEntry.create({
      data: {
        userId: user.id,
        amount: entry.amount,
        category: entry.category,
        note: entry.note,
        date: d,
      }
    })
  }
  console.log('Created', expenseHistory.length, 'expense entries')

  // ─── INSURANCE RECOMMENDATIONS ──────────────────────────────────
  const recommendations = [
    {
      product: 'Rideshare/delivery driver endorsement',
      reason: 'Your personal auto policy does not cover accidents while you are actively driving for DoorDash or Uber. This gap means a single fender-bender on the job could leave you with zero coverage.',
      priority: 'high',
      gap_description: 'Personal auto policy void during gig work — highest risk exposure for your profile',
    },
    {
      product: 'Occupational accident insurance',
      reason: 'As a 1099 contractor you have no workers comp. If you are injured on the job — a slip, a crash, a dog bite on delivery — you pay all medical costs out of pocket. This policy fills that gap for under $50/month.',
      priority: 'high',
      gap_description: 'No employer workers comp — injury could wipe out your buffer entirely',
    },
    {
      product: 'Short-term disability insurance',
      reason: 'If you cannot drive for 2+ weeks due to illness or injury you earn zero. With a volatility score of 76.9 and only 1.7 bad weeks of buffer, even a minor health event could spiral into missed rent.',
      priority: 'medium',
      gap_description: 'Income fully stops if unable to work — no safety net beyond current buffer',
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
  console.log('Login:    test@gmail.com / demo1234')
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
