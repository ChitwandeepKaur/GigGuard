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
    const [profile, expenses, recentIncome] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: req.userId } }),
      prisma.expenseProfile.findUnique({ where: { userId: req.userId } }),
      prisma.incomeEntry.findMany({
        where: {
          userId: req.userId,
          week_of: { gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { week_of: 'desc' }
      })
    ]);

    if (!profile || !expenses) {
      return res.status(404).json({ error: 'Profile or expenses not found' });
    }

    const thisWeekIncome = recentIncome
      .filter(e => isThisWeek(e.week_of))
      .reduce((sum, e) => sum + e.amount, 0);

    const taxReserve = calcSEtaxReserve(thisWeekIncome);
    
    const billsDueThisWeek = expenses.survival_number; // Approximation
    const emergencyBufferTarget = expenses.survival_number * 3;
    const avgFlexible = 150; // Default demo value

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
      estimatedPenalty: calcTaxPenalty(totalTaxOwed, 0), // 0 days overdue for demo
      nextTaxDeadline: nextDeadline,
      windfall,
      goodWeekThreshold: profile.best_week,
      floorIncome: profile.floor_income,
      volatilityScore: profile.volatility_score,
      thisWeekIncome,
      isSurvivalMode: thisWeekIncome < profile.floor_income,
      recentIncome
    });
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
