export async function analyzeIssueImage(base64Image, description = '', language = 'en') {
  const languageNames = {
    en: 'English', hi: 'Hindi', kn: 'Kannada',
    ta: 'Tamil', te: 'Telugu', ml: 'Malayalam',
    bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi'
  }
  const langName = languageNames[language] || 'English'

  const prompt = `You are an AI civic safety analyzer for India.
Analyze this image of a community issue.
Respond ONLY in ${langName} language for text fields.
Return ONLY a valid JSON object, no markdown, no backticks:

{
  "category": "pothole|garbage|water_leakage|broken_road|illegal_dumping|fallen_tree|open_drain|broken_streetlight|electrical_wire|sewage|fire_hazard|illegal_activity|other",
  "categoryLabel": "human readable name in ${langName}",
  "severity": "green|yellow|orange|red",
  "severityLabel": "Minor|Needs Attention|Urgent|Dangerous in ${langName}",
  "severityReason": "one sentence why in ${langName}",
  "riskType": "accident|health|environmental|crime|fire|none",
  "riskPrediction": "what happens if not fixed, in ${langName}",
  "impactScore": <0-100>,
  "impactFactors": ["factor1", "factor2"],
  "recommendedAuthority": "exact department name",
  "escalationLevel": "community|ward|district|emergency",
  "reportText": "2-3 sentence professional complaint in ${langName}",
  "suggestedAction": "immediate action in ${langName}",
  "isEmergency": <true|false>
}

Additional context from user: "${description}"
Severity guide: green=no risk, yellow=minor risk, orange=urgent, red=immediate danger`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      }
    )
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)
    result.impactScore = Math.min(100, (result.impactScore || 50) + 
      (result.severity === 'red' ? 10 : result.severity === 'orange' ? 5 : 0))
    return result
  } catch (error) {
    console.error('Gemini error:', error)
    return {
      category: 'other',
      categoryLabel: 'Community Issue',
      severity: 'yellow',
      severityLabel: 'Needs Attention',
      severityReason: 'Unable to analyze image automatically',
      riskType: 'none',
      riskPrediction: 'Please describe the issue manually',
      impactScore: 50,
      impactFactors: ['Community area'],
      recommendedAuthority: 'Local Municipality',
      escalationLevel: 'ward',
      reportText: description || 'A community issue has been reported and requires attention.',
      suggestedAction: 'Contact local ward office',
      isEmergency: false
    }
  }
}

export async function chatWithAI(message, userLocation, language = 'en') {
  const languageNames = {
    en: 'English', hi: 'Hindi', kn: 'Kannada',
    ta: 'Tamil', te: 'Telugu', ml: 'Malayalam',
    bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi'
  }
  const langName = languageNames[language] || 'English'

  const prompt = `You are VANGUARD AI, a civic assistant for Indian communities.
User location: ${userLocation || 'India'}
Always respond in ${langName} language only.
Be concise, helpful, and action-oriented.
Help with: reporting issues, finding authorities, understanding risks.
User message: ${message}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      }
    )
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           'I am here to help. Please describe your community issue.'
  } catch (error) {
    return 'Unable to connect to AI. Please try again.'
  }
}
