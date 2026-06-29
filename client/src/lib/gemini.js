const KEY = import.meta.env.VITE_GEMINI_API_KEY
const BASE = 'https://generativelanguage.googleapis.com/v1beta'

async function callGemini(model, body) {
  if (!KEY) throw new Error('Gemini API key not configured')
  
  const res = await fetch(`${BASE}/models/${model}:generateContent?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  const data = await res.json()
  
  if (data.error) {
    throw new Error(data.error.message || 'Gemini API error')
  }
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function analyzeIssueImage(base64Image, description = '', language = 'en') {
  const prompt = `You are an AI civic safety analyzer for India.
Analyze this image of a community issue.
Return ONLY a valid JSON object with no other text.
{
  "category": "pothole",
  "categoryLabel": "Pothole / Road Damage",
  "severity": "red",
  "severityLabel": "Dangerous",
  "severityReason": "Large pothole causing vehicle damage risk",
  "riskType": "accident",
  "riskPrediction": "High risk of vehicle accidents especially for two-wheelers",
  "impactScore": 85,
  "impactFactors": ["High traffic area", "No warning signs"],
  "recommendedAuthority": "Roads and Buildings Department",
  "escalationLevel": "district",
  "reportText": "A dangerous pothole has been identified requiring immediate attention.",
  "suggestedAction": "Barricade the area and repair within 24 hours",
  "isEmergency": false
}
Additional context: "${description}"
Response language: ${language}
IMPORTANT: Output MUST be valid parseable JSON only.`

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  }

  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro']
  let lastErr = null
  
  for (const m of models) {
    try {
      const text = await callGemini(m, body)
      const cleaned = text.replace(/```json|```/g, '').trim()
      return JSON.parse(cleaned)
    } catch (err) {
      console.warn(`Model ${m} failed:`, err)
      lastErr = err
    }
  }
  
  throw lastErr || new Error('All Gemini models failed')
}

export async function chatWithAI(message, userLocation = 'India', language = 'en') {
  const prompt = `You are VANGUARD AI, a helpful civic assistant for Indian communities.
Keep responses under 100 words. Be direct and helpful.
Answer in the language: ${language}
User location: ${userLocation}
Question: ${message}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7 }
  }

  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro']
  let lastErr = null
  
  for (const m of models) {
    try {
      return await callGemini(m, body)
    } catch (err) {
      console.warn(`Model ${m} failed:`, err)
      lastErr = err
    }
  }
  
  throw lastErr || new Error('All Gemini models failed')
}
