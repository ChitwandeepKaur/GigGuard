import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calcSafeToSpend, calcBufferWeeks, calcSEtaxReserve, calcWindfall, getSafeToSpendState } from '../services/calculations.js';

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
        weekOf: { gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { weekOf: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post('/income', async (req, res, next) => {
  try {
    const { amount, source, note, weekOf } = req.body;
    const entry = await prisma.incomeEntry.create({
      data: {
        userId: req.userId,
        amount: Number(amount),
        source: source || 'other',
        note: note || '',
        weekOf: weekOf ? new Date(weekOf) : new Date(),
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
          weekOf: { gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { weekOf: 'desc' }
      })
    ]);

    if (!profile || !expenses) {
      return res.status(404).json({ error: 'Profile or expenses not found' });
    }

    const thisWeekIncome = recentIncome
      .filter(e => isThisWeek(e.weekOf))
      .reduce((sum, e) => sum + e.amount, 0);

    const taxReserve = calcSEtaxReserve(thisWeekIncome);
    
    // Based on available dummy/mock state since some values like available cash are complex
    const safeToSpend = calcSafeToSpend({
      availableCash: thisWeekIncome,
      billsDueThisWeek: expenses.survivalNumber,
      emergencyBufferTarget: expenses.survivalNumber * 3,
      currentBuffer: 0,
      weeklyTaxReserve: taxReserve,
      volatilityScore: profile.volatilityScore
    });

    const bufferWeeks = calcBufferWeeks(0, expenses.survivalNumber);
    const windfall = thisWeekIncome > profile.bestWeek
      ? calcWindfall(thisWeekIncome, profile.bestWeek) : null;

    res.json({
      safeToSpend,
      safeToSpendState: getSafeToSpendState(safeToSpend, expenses.survivalNumber, 150),
      bufferWeeks,
      taxReserve,
      totalTaxOwed: recentIncome.reduce((s, e) => s + (e.amount * 0.153 * 0.9), 0),
      windfall,
      isSurvivalMode: thisWeekIncome < profile.floorIncome,
      recentIncome
    });
  } catch (error) {
    next(error);
  }
});

export default router;
