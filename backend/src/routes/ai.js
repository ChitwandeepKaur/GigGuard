import express from 'express'
import multer from 'multer'
import { extractPDFText } from '../services/pdfParser.js'
import { chatWithPolicyContext } from '../services/gemini.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload-policy', upload.single('policyFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const text = await extractPDFText(req.file.buffer)
    res.json({ message: 'Policy successfully analyzed', extractedText: text })
  } catch (err) {
    res.status(500).json({ error: 'Error analyzing policy document' })
  }
})

router.post('/chat', async (req, res) => {
  const { messages, policyText } = req.body
  if (!messages || !policyText) return res.status(400).json({ error: 'Missing messages or policy context' })
  
  try {
    const aiResponse = await chatWithPolicyContext(messages, policyText)
    res.json({ message: aiResponse })
  } catch (err) {
    res.status(500).json({ error: 'Error getting chat response' })
  }
})

export default router
