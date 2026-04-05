import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder'
);

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Hash the password as requested
    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    if (data.user) {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: { email, password_hash },
        create: { id: data.user.id, email, password_hash }
      });
    }

    res.json({ token: data.session?.access_token || null, refreshToken: data.session?.refresh_token || null, user: data.user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token, user: data.user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    // Just a placeholder response for the client to delete JWT correctly 
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ 
      token: data.session.access_token, 
      refreshToken: data.session.refresh_token,
      user: data.user 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      include: { profile: true, expenses: true }
    });
    
    res.json({ user: data.user, dbProfile: dbUser });
  } catch (error) {
    next(error);
  }
});

export default router;
