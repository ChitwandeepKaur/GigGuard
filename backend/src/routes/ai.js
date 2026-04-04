import express from 'express'
const router = express.Router()

router.post('/chat', async (req, res) => { res.json({ message: 'TODO' }) })

export default router
