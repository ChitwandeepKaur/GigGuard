import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null;
const MODEL_NAME = 'gemini-2.5-flash'

function getModel(jsonMode = false) {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    ...(jsonMode ? { generationConfig: { responseMimeType: 'application/json' } } : {})
  })
}

export async function chatWithPolicyContext(messages, policyText) {
  const model = getModel()

  const systemInstruction = `You are a helpful insurance assistant. You will be provided with the user's uploaded insurance policy document.
    Your primary job is to answer user scenarios ("what if" questions) STRICTLY based on the provided policy document.
    If the answer is not explicitly available in the policy document, state that it is not covered or that you cannot answer it based on the document provided. Do not invent coverage or assumptions.`

  const prompt = `${systemInstruction}\n\n--- POLICY DOCUMENT ---\n${policyText}\n\n--- USER QUERY ---\n${messages[messages.length - 1].content}`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating content with Gemini:', error)
    throw new Error('Failed to generate response')
  }
}

export async function summarizePolicy(policyText) {
  const model = getModel(true)

  const systemInstruction = `You are an insurance policy summarizer. Analyze the provided policy document and extract the key details in pure JSON format.
Your output must be strict JSON matching this schema:
{
  "isCovered": ["bullet 1", "bullet 2", "bullet 3"],
  "notCovered": ["bullet 1", "bullet 2"],
  "hiddenTerms": ["term 1", "term 2"], // hidden terms/conditions that could increase insurance in the future
  "deductible": "$500", // or "Not specified in document"
  "coverageLimits": "$100,000", // or "Not specified in document"
  "renewalDate": "YYYY-MM-DD" // or "Not specified in document"
}
Important rules:
1. Provide plain English, concise bullets for isCovered and notCovered.
2. Focus on things critical for gig workers.
3. If deductible, limits, or renewal date are not explicitly stated, output exactly "Not specified in document". Do NOT hallucinate data.`

  const prompt = `${systemInstruction}\n\n--- POLICY DOCUMENT ---\n${policyText}`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const jsonString = response.text()
    try {
      return JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', jsonString)
      return {
        isCovered: [],
        notCovered: ["Error parsing policy data."],
        hiddenTerms: [],
        deductible: "Not specified in document",
        coverageLimits: "Not specified in document",
        renewalDate: "Not specified in document"
      }
    }
  } catch (error) {
    console.error('Error summarizing policy with Gemini:', error)
    throw new Error('Failed to summarize policy')
  }
}

// 4.4 — Insurance Recommendations
export async function getInsuranceRecommendation(profileData) {
  const model = getModel(true)

  const systemInstruction = `You are a financial and insurance advisor for gig workers.
Based on the following gig worker profile, evaluate their coverage gap and recommend exactly 3 insurance products that would best protect them.
IMPORTANT: Any insurance product recommended MUST be a "State Farm" product (e.g., "State Farm Rideshare Insurance", "State Farm Personal Articles Policy").

Output must be a strict JSON strictly matching this schema:
{
  "coverageGapScore": "🔴 Vulnerable", // Must be one of: "🔴 Vulnerable", "🟡 Partial", or "🟢 Protected"
  "recommendations": [
    {
      "product": "Product Name (e.g. State Farm Rideshare Insurance)",
      "reason": "Why they need this specifically based on their provided data.",
      "priority": "high",
      "gap_description": "What financial gap this covers (e.g. 'Covers the gap between app-provided insurance and personal auto')"
    }
  ]
}`;

  const prompt = `${systemInstruction}\n\n--- USER PROFILE ---\n${JSON.stringify(profileData, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', jsonString);
      return { coverageGapScore: "🟡 Partial", recommendations: [] };
    }
  } catch (error) {
    console.error('Error getting insurance recommendation:', error);
    throw new Error('Failed to get recommendation');
  }
}

// 4.3 — Gamified Quiz
export async function generateQuizQuestions(policyText, gigType = 'gig worker') {
  const model = getModel(true)

  const prompt = `You are creating a short quiz to help a ${gigType} understand their insurance policy coverage.
Generate exactly 5 scenario-based questions derived from the following policy document.
Return a JSON array only — no markdown, no preamble, no trailing text.
Each element must have exactly these fields:
  "scenario"    — a realistic 1-2 sentence situation a gig worker might face
  "answer"      — one of: "covered", "not_covered", "partial"
  "clause"      — quote the specific policy section/clause that justifies the answer (keep it concise but direct)
  "explanation" — plain English, 2-3 sentences explaining why it is/isn't covered

Rules:
- Make scenarios realistic for gig workers (rideshare, delivery, freelance).
- Vary the coverage areas — do NOT repeat the same topic twice.
- At least 2 scenarios should be "not_covered" to surface real gaps.
- Do NOT hallucinate clauses — only cite what is in the document below.

--- POLICY DOCUMENT ---
${policyText.slice(0, 8000)}`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const parsed = JSON.parse(response.text())
    if (!Array.isArray(parsed)) throw new Error('Expected JSON array')
    return parsed.slice(0, 5) // enforce max 5
  } catch (error) {
    console.error('Error generating quiz questions with Gemini:', error)
    throw new Error('Failed to generate quiz questions')
  }
}
