import express from 'express'
const router = express.Router()

router.get('/income', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/income', async (req, res) => { res.json({ message: 'TODO' }) })
router.delete('/income/:id', async (req, res) => { res.json({ message: 'TODO' }) })
router.get('/summary', async (req, res) => { res.json({ message: 'TODO' }) })

export default router
