import express from 'express';
import { prisma } from '../db.js';

import { calcSafeToSpend, calcBufferWeeks, calcSEtaxReserve, calcWindfall, getSafeToSpendState, getNextTaxDeadline, getBufferTier, calcTaxPenalty } from '../services/calculations.js';

const router = express.Router();

function isThisWeek(date) {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const entryDate = new Date(date);
  return entryDate >= startOfWeek;
}

const BILL_CATEGORIES = [
  'rent', 'utilities', 'debt_minimums', 'transport', 'groceries', 
  'insurance_cost', 'phone', 'subscriptions', 'eating_out', 
  'shopping', 'entertainment'
];

router.get('/income', async (req, res, next) => {
  try {
    const entries = await prisma.incomeEntry.findMany({
      where: {
        userId: req.userId,
        week_of: { gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { week_of: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post('/income', async (req, res, next) => {
  try {
    const { amount, source, note, date, week_of } = req.body;
    const numAmount = Number(amount);
    
    // Create income entry and update user profile in a transaction
    const [entry] = await prisma.$transaction([
      prisma.incomeEntry.create({
        data: {
          userId: req.userId,
          amount: numAmount,
          source: source || 'other',
          note: note || '',
          date: date ? new Date(date) : new Date(),
          week_of: week_of ? new Date(week_of) : new Date(),
        }
      }),
      prisma.userProfile.update({
        where: { userId: req.userId },
        data: { available_cash: { increment: numAmount } }
      })
    ]);
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/expense', async (req, res, next) => {
  try {
    const { amount, category, note, date } = req.body;
    const numAmount = Number(amount);

    const [entry] = await prisma.$transaction([
      prisma.expenseEntry.create({
        data: {
          userId: req.userId,
          amount: numAmount,
          category: category || 'other',
          note: note || '',
          date: date ? new Date(date) : new Date(),
        }
      }),
      prisma.userProfile.update({
        where: { userId: req.userId },
        data: { available_cash: { decrement: numAmount } }
      })
    ]);
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const [income, expenses] = await Promise.all([
      prisma.incomeEntry.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 20
      }),
      prisma.expenseEntry.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 20
      })
    ]);

    const all = [
      ...income.map(i => ({ ...i, type: 'income' })),
      ...expenses.map(e => ({ ...e, type: 'expense' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(all.slice(0, 30));
  } catch (error) {
    next(error);
  }
});

router.delete('/income/:id', async (req, res, next) => {
  try {
    await prisma.incomeEntry.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (req, res, next) => {
  try {
    let profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    let expenses = await prisma.expenseProfile.findUnique({ where: { userId: req.userId } });

    if (!profile || !expenses) {
      return res.status(404).json({ error: 'Profile or expenses not found' });
    }

    // Monthly Reset Logic for Bill Payments
    const now = new Date();
    const lastReset = new Date(expenses.last_paid_reset);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      expenses = await prisma.expenseProfile.update({
        where: { userId: req.userId },
        data: {
          paid_categories: [],
          last_paid_reset: now
        }
      });
    }

    const [recentIncome] = await Promise.all([
      prisma.incomeEntry.findMany({
        where: {
          userId: req.userId,
          week_of: { gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { week_of: 'desc' }
      })
    ]);

    const thisWeekIncome = recentIncome
      .filter(e => isThisWeek(e.week_of))
      .reduce((sum, e) => sum + e.amount, 0);

    const taxReserve = calcSEtaxReserve(thisWeekIncome);
    
    // Calculate actual bills due (sum of categories not in paid_categories)
    const paidSet = new Set(expenses.paid_categories);
    const nonNegotiableKeys = ['rent', 'utilities', 'debt_minimums', 'transport', 'groceries', 'insurance_cost'];
    
    let currentMonthlyBillsDue = 0;
    nonNegotiableKeys.forEach(key => {
      if (!paidSet.has(key)) {
        currentMonthlyBillsDue += expenses[key] || 0;
      }
    });

    const billsDueThisWeek = currentMonthlyBillsDue / 4.33;
    const emergencyBufferTarget = expenses.survival_number * 3 * 4.33; // Target is usually 3-6 months of survival
    const avgFlexible = 150; 

    const safeToSpend = calcSafeToSpend({
      availableCash: profile.available_cash,
      billsDueThisWeek: billsDueThisWeek,
      emergencyBufferTarget: emergencyBufferTarget,
      currentBuffer: profile.current_buffer,
      weeklyTaxReserve: taxReserve,
      volatilityScore: profile.volatility_score
    });

    const bufferWeeks = calcBufferWeeks(profile.current_buffer, expenses.survival_number);
    const windfall = thisWeekIncome > profile.best_week
      ? calcWindfall(thisWeekIncome, profile.best_week) : null;

    const totalTaxOwed = recentIncome.reduce((s, e) => s + (e.amount * 0.153 * 0.9), 0);
    const nextDeadline = getNextTaxDeadline();

    res.json({
      safeToSpend,
      safeToSpendState: getSafeToSpendState(safeToSpend, expenses.survival_number, avgFlexible),
      availableCash: profile.available_cash,
      currentBuffer: profile.current_buffer,
      bufferWeeks,
      bufferTier: getBufferTier(bufferWeeks),
      emergencyBufferTarget,
      billsDueThisWeek,
      taxReserve,
      totalTaxOwed,
      estimatedPenalty: calcTaxPenalty(totalTaxOwed, 0),
      nextTaxDeadline: nextDeadline,
      windfall,
      goodWeekThreshold: profile.best_week,
      floorIncome: profile.floor_income,
      volatilityScore: profile.volatility_score,
      thisWeekIncome,
      isSurvivalMode: thisWeekIncome < profile.floor_income,
      recentIncome,
      expenses // Include full expense profile for billing UI
    });
  } catch (error) {
    next(error);
  }
});

router.post('/toggle-bill', async (req, res, next) => {
  try {
    const { category } = req.body;
    if (!BILL_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid bill category' });
    }

    const expenses = await prisma.expenseProfile.findUnique({
      where: { userId: req.userId }
    });

    if (!expenses) return res.status(404).json({ error: 'Expense profile not found' });

    const isPaid = expenses.paid_categories.includes(category);
    const amount = expenses[category];

    let updatedPaid = [...expenses.paid_categories];
    if (isPaid) {
      updatedPaid = updatedPaid.filter(c => c !== category);
    } else {
      updatedPaid.push(category);
    }

    const [updatedExpenses] = await prisma.$transaction([
      prisma.expenseProfile.update({
        where: { userId: req.userId },
        data: { paid_categories: updatedPaid }
      }),
      // Automatically log transaction if marking as paid
      ...(isPaid ? [] : [
        prisma.expenseEntry.create({
          data: {
            userId: req.userId,
            amount: amount,
            category: category,
            note: `Monthly ${category} payment (Automatic)`,
          }
        }),
        prisma.userProfile.update({
          where: { userId: req.userId },
          data: { available_cash: { decrement: amount } }
        })
      ])
    ]);

    res.json({ success: true, paid_categories: updatedExpenses.paid_categories });
  } catch (error) {
    next(error);
  }
});

router.post('/transfer-to-buffer', async (req, res, next) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer amount' });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (profile.available_cash < numAmount) {
      return res.status(400).json({ error: 'Insufficient available cash' });
    }

    await prisma.$transaction([
      prisma.userProfile.update({
        where: { userId: req.userId },
        data: {
          available_cash: { decrement: numAmount },
          current_buffer: { increment: numAmount }
        }
      })
    ]);

    res.json({ success: true, message: `Transferred $${numAmount} to emergency buffer.` });
  } catch (error) {
    next(error);
  }
});

export default router;
