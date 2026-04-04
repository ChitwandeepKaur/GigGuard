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
    const { 
      gig_types, income_frequency, weekly_low, weekly_high, worst_week, best_week,
      rent, utilities, debt_minimums, transport, groceries, insurance_cost,
      phone, subscriptions, eating_out, shopping, entertainment
    } = req.body;
    
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.userId },
      update: {
        gig_types: gig_types || [],
        income_frequency: income_frequency || 'weekly',
        weekly_low: Number(weekly_low || 0),
        weekly_high: Number(weekly_high || 0),
        worst_week: Number(worst_week || 0),
        best_week: Number(best_week || 0),
        floor_income: Number(worst_week || 0),
        average_income: (Number(weekly_low || 0) + Number(weekly_high || 0)) / 2,
        volatility_score: ((Number(weekly_high || 0) - Number(weekly_low || 0)) / ((Number(weekly_low || 0) + Number(weekly_high || 0)) / 2 || 1)) * 100
      },
      create: {
        userId: req.userId,
        gig_types: gig_types || [],
        income_frequency: income_frequency || 'weekly',
        weekly_low: Number(weekly_low || 0),
        weekly_high: Number(weekly_high || 0),
        worst_week: Number(worst_week || 0),
        best_week: Number(best_week || 0),
        floor_income: Number(worst_week || 0),
        average_income: (Number(weekly_low || 0) + Number(weekly_high || 0)) / 2,
        volatility_score: ((Number(weekly_high || 0) - Number(weekly_low || 0)) / ((Number(weekly_low || 0) + Number(weekly_high || 0)) / 2 || 1)) * 100
      }
    });

    const nonNegotiableSum = Number(rent || 0) + Number(utilities || 0) + Number(debt_minimums || 0) + Number(transport || 0) + Number(groceries || 0) + Number(insurance_cost || 0);

    const expenses = await prisma.expenseProfile.upsert({
      where: { userId: req.userId },
      update: {
        rent: Number(rent || 0),
        utilities: Number(utilities || 0),
        debt_minimums: Number(debt_minimums || 0),
        transport: Number(transport || 0),
        groceries: Number(groceries || 0),
        insurance_cost: Number(insurance_cost || 0),
        phone: Number(phone || 0),
        subscriptions: Number(subscriptions || 0),
        eating_out: Number(eating_out || 0),
        shopping: Number(shopping || 0),
        entertainment: Number(entertainment || 0),
        survival_number: nonNegotiableSum / 4.33
      },
      create: {
        userId: req.userId,
        rent: Number(rent || 0),
        utilities: Number(utilities || 0),
        debt_minimums: Number(debt_minimums || 0),
        transport: Number(transport || 0),
        groceries: Number(groceries || 0),
        insurance_cost: Number(insurance_cost || 0),
        phone: Number(phone || 0),
        subscriptions: Number(subscriptions || 0),
        eating_out: Number(eating_out || 0),
        shopping: Number(shopping || 0),
        entertainment: Number(entertainment || 0),
        survival_number: nonNegotiableSum / 4.33
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
