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
