import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null;
const MODEL_NAME = 'gemini-2.5-flash' // using standard model name

export async function chatWithPolicyContext(messages, policyText) {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

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
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
    }
  })

  const systemInstruction = `You are an insurance policy summarizer. Analyze the provided policy document and extract the key details in pure JSON format.
Your output must be strict JSON matching this schema:
{
  "isCovered": ["bullet 1", "bullet 2", "bullet 3"],
  "notCovered": ["bullet 1", "bullet 2"],
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
