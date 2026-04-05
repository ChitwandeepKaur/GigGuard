import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const incomeCount = await prisma.incomeEntry.count();
    const expenseCount = await prisma.expenseEntry.count();
    const user = await prisma.user.findFirst({ where: { email: 'marcus@demo.com' } });
    
    console.log('Seeding Verification:');
    console.log('-------------------');
    console.log('Income entries:', incomeCount);
    console.log('Expense entries:', expenseCount);
    console.log('Marcus demo user exists:', !!user);
    
    if (expenseCount > 0) {
      const sample = await prisma.expenseEntry.findFirst({
        where: { user: { email: 'marcus@demo.com' } },
        orderBy: { date: 'desc' }
      });
      console.log('Sample Expense:', sample);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
