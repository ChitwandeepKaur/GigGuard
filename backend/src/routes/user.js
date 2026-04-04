import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/profile', async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.post('/profile', async (req, res, next) => {
  try {
    const { gigTypes, incomeFrequency, weeklyLow, weeklyHigh, worstWeek, bestWeek, rent, utilities, debtMinimums } = req.body;
    
    const profile = await prisma.userProfile.create({
      data: {
        userId: req.userId,
        gigTypes: gigTypes || [],
        incomeFrequency: incomeFrequency || 'weekly',
        weeklyLow: Number(weeklyLow || 0),
        weeklyHigh: Number(weeklyHigh || 0),
        worstWeek: Number(worstWeek || 0),
        bestWeek: Number(bestWeek || 0),
        floorIncome: Number(worstWeek || 0),
        averageIncome: (Number(weeklyLow || 0) + Number(weeklyHigh || 0)) / 2,
        volatilityScore: ((Number(weeklyHigh || 0) - Number(weeklyLow || 0)) / ((Number(weeklyLow || 0) + Number(weeklyHigh || 0)) / 2 || 1)) * 100
      }
    });

    const expenses = await prisma.expenseProfile.create({
      data: {
        userId: req.userId,
        rent: Number(rent || 0),
        utilities: Number(utilities || 0),
        debtMinimums: Number(debtMinimums || 0),
        survivalNumber: (Number(rent || 0) + Number(utilities || 0) + Number(debtMinimums || 0)) / 4.33
      }
    });

    res.json({ profile, expenses });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const updated = await prisma.userProfile.update({
      where: { userId: req.userId },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    const expenses = await prisma.expenseProfile.findUnique({ where: { userId: req.userId } });
    res.json({ profile, expenses });
  } catch (error) {
    next(error);
  }
});

export default router;
