import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-4-20250514'

export async function summarizePolicy(pdfText) {
  return {}
}

export async function generateQuizQuestions(pdfText, gigType) {
  return []
}

export async function getInsuranceRecommendation(userProfile) {
  return []
}

export async function chatWithContext(messages, userProfile, policyText) {
  return ''
}
