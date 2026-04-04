import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('marcus123', 10)
  
  const marcus = await prisma.user.upsert({
    where: { email: 'marcus@gigguard.com' },
    update: {},
    create: {
      email: 'marcus@gigguard.com',
      password_hash: passwordHash,
      profile: {
        create: {
          gig_types: ['rideshare', 'delivery'],
          income_frequency: 'weekly',
          weekly_low: 800,
          weekly_high: 1800,
          worst_week: 620,
          best_week: 2100,
          floor_income: 620,
          average_income: 1300,
          volatility_score: 76.9
        }
      },
      expenses: {
        create: {
          rent: 300,
          utilities: 50,
          debt_minimums: 40,
          transport: 60,
          groceries: 100,
          insurance_cost: 30,
          phone: 15,
          subscriptions: 20,
          eating_out: 40,
          shopping: 30,
          entertainment: 20,
          survival_number: (300+50+40+60+100+30) / 4.33
        }
      }
    }
  })

  console.log('Seed completed: Created user Marcus if not exists')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
