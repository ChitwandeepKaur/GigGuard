import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calcSafeToSpend, calcBufferWeeks, calcSEtaxReserve, calcWindfall, getSafeToSpendState, getNextTaxDeadline, getBufferTier, calcTaxPenalty } from '../services/calculations.js';

const prisma = new PrismaClient();
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
    const { amount, source, note, week_of } = req.body;
    const entry = await prisma.incomeEntry.create({
      data: {
        userId: req.userId,
        amount: Number(amount),
        source: source || 'other',
        note: note || '',
        week_of: week_of ? new Date(week_of) : new Date(),
      }
    });
    res.json(entry);
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
      thisWeekIncome,
      isSurvivalMode: thisWeekIncome < profile.floor_income,
      recentIncome
    });
  } catch (error) {
    next(error);
  }
});

export default router;
