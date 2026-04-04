import express from 'express'
const router = express.Router()

router.post('/register', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/login', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/logout', async (req, res) => { res.json({ message: 'TODO' }) })
router.get('/me', async (req, res) => { res.json({ message: 'TODO' }) })

export default router
