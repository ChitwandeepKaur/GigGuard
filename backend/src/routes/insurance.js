import express from 'express'
const router = express.Router()

router.get('/policy', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/upload', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/summarize', async (req, res) => { res.json({ message: 'TODO' }) })
router.get('/quiz', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/quiz/generate', async (req, res) => { res.json({ message: 'TODO' }) })
router.post('/quiz/score', async (req, res) => { res.json({ message: 'TODO' }) })
router.get('/recommendation', async (req, res) => { res.json({ message: 'TODO' }) })

export default router
