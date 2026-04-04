import express from 'express'
import multer from 'multer'
import { extractPDFText } from '../services/pdfParser.js'
import { chatWithPolicyContext, summarizePolicy } from '../services/gemini.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload-policy', upload.single('policyFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const text = await extractPDFText(req.file.buffer)
    const summary = await summarizePolicy(text)
    res.json({ message: 'Policy successfully analyzed', extractedText: text, summary })
  } catch (err) {
    console.error('Error analyzing policy:', err)
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

router.post('/recommendation/preview', async (req, res) => {
  try {
    const { getInsuranceRecommendation } = await import('../services/gemini.js');
    const formData = req.body;
    const recommendations = await getInsuranceRecommendation(formData);
    res.json(recommendations);
  } catch (err) {
    console.error('Failed to get recommendation preview:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router
