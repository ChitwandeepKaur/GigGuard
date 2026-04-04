import express from 'express'
const router = express.Router()

router.get('/profile', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/profile', async (req, res) => { res.json({ message: 'TODO' }) })
router.put('/profile', async (req, res) => { res.json({ message: 'TODO' }) })
router.get('/dashboard', async (req, res) => { res.json({ message: 'TODO' }) })

export default router
