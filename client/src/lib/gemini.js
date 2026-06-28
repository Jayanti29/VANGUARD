const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-1.5-flash'

export async function analyzeIssueImage(base64Image, description = '', language = 'en') {
  if (!API_KEY) {
    console.error('Gemini API key missing')
    return getMockAnalysis(description)
  }

  const prompt = `You are an AI civic safety analyzer for India.
Analyze this image of a community issue carefully.
Return ONLY a valid JSON object. No markdown. No explanation. Just JSON.

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

Replace the example values with your actual analysis of the image.
Additional context: "${description}"
IMPORTANT: Return valid parseable JSON only.`

  try {
    const response = await fetch(
      `${BASE_URL}/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      return getMockAnalysis(description)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Gemini raw response:', text)

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response')
      return getMockAnalysis(description)
    }

    const result = JSON.parse(jsonMatch[0])
    return result

  } catch (err) {
    console.error('Gemini request failed:', err)
    return getMockAnalysis(description)
  }
}

function getMockAnalysis(description) {
  return {
    category: 'other',
    categoryLabel: 'Community Issue',
    severity: 'yellow',
    severityLabel: 'Needs Attention',
    severityReason: 'Issue reported by community member',
    riskType: 'none',
    riskPrediction: description || 'Issue needs assessment by local authority',
    impactScore: 60,
    impactFactors: ['Community reported', 'Requires inspection'],
    recommendedAuthority: 'Local Municipality',
    escalationLevel: 'ward',
    reportText: `A community issue has been reported: ${description || 'No description provided'}. Local authorities should investigate and take appropriate action.`,
    suggestedAction: 'Contact ward office for inspection',
    isEmergency: false
  }
}

export async function chatWithAI(message, userLocation = 'India', language = 'en') {
  if (!API_KEY) return 'AI assistant is currently unavailable.'

  const prompt = `You are VANGUARD AI, a civic assistant for Indian communities.
User location: ${userLocation}
Respond in simple, clear English.
Help with: reporting civic issues, finding authorities, understanding community risks.
Be concise and action-oriented. Maximum 3 sentences per response.
User message: ${message}`

  try {
    const response = await fetch(
      `${BASE_URL}/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 256 }
        })
      }
    )

    if (!response.ok) return 'Unable to connect to AI. Please try again.'
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           'I am here to help with your community issues.'
  } catch {
    return 'Unable to connect to AI. Please try again.'
  }
}
