import { createClient } from '@supabase/supabase-js'
import { prisma } from '../db.js'

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder'
)

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })

  req.userId = data.user.id

  // Identity Mapping: Ensure the user exists in our DB
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    // If not found by ID, check if they exist by email (orphaned from seeding)
    const orphanedUser = await prisma.user.findUnique({ where: { email: data.user.email } })
    if (orphanedUser) {
      // Delete the orphaned record so we can recreate it with the correct Supabase ID
      await prisma.user.delete({ where: { id: orphanedUser.id } })
    }
    
    await prisma.user.create({
      data: {
        id: req.userId,
        email: data.user.email,
        password_hash: '' // No local password needed when using Supabase
      }
    })
  }

  next()
}
