import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import financeRoutes from './routes/finance.js'
import insuranceRoutes from './routes/insurance.js'
import aiRoutes from './routes/ai.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'


const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (JWT required)
app.use('/api/user', authenticate, userRoutes)
app.use('/api/finance', authenticate, financeRoutes)
app.use('/api/insurance', authenticate, insuranceRoutes)
app.use('/api/ai', aiRoutes) // Public for now for easy RAG testing


app.use(errorHandler)

app.listen(process.env.PORT || 3001, () => {
  console.log(`GigShield server running on port ${process.env.PORT || 3001}`)
})
