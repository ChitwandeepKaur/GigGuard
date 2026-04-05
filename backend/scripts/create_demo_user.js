import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10)
  const user = await prisma.user.upsert({
    where: { email: 'marcus@demo.com' },
    update: {},
    create: {
      email: 'marcus@demo.com',
      password_hash: passwordHash,
      profile: {
        create: {
          gig_types: ['delivery'],
          available_cash: 1000,
          current_buffer: 500,
        }
      },
      expenses: {
        create: {
          survival_number: 600,
        }
      }
    }
  })
  console.log('User ID:', user.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
