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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           'I am here to help. Please describe your community issue.'
  } catch (error) {
    console.warn("Gemini connection failed, using local mock responder:", error)
    
    const cleanedMessage = message.toLowerCase()
    let reply = ''
    
    if (language === 'hi') {
      if (cleanedMessage.includes('water') || cleanedMessage.includes('पानी') || cleanedMessage.includes('जल')) {
        reply = 'मुझे लगता है कि आपको जल/पानी की समस्या है। नगर निगम के नियमों के अनुसार, जल आपूर्ति और सीवरेज बोर्ड ज़िम्मेदार है। आप वैनगार्ड के "शिकायत दर्ज करें" अनुभाग में रिपोर्ट दर्ज कर सकते हैं।'
      } else if (cleanedMessage.includes('electricity') || cleanedMessage.includes('बिजली') || cleanedMessage.includes('लाइट')) {
        reply = 'बिजली कटौती या टूटे तारों जैसी बिजली की समस्याओं का प्रबंधन राज्य बिजली बोर्ड (जैसे BESCOM, UPPCL) द्वारा किया जाता है। आप "अधिकारियों की निर्देशिका" के तहत संपर्क विवरण पा सकते हैं।'
      } else if (cleanedMessage.includes('garbage') || cleanedMessage.includes('कचरा') || cleanedMessage.includes('सफाई')) {
        reply = 'ठोस अपशिष्ट प्रबंधन और कचरा संग्रह का काम स्थानीय नगर निगम (जैसे BBMP, MCD) द्वारा किया जाता है। कृपया "कचरा/सफाई" श्रेणी के तहत शिकायत दर्ज करें।'
      } else if (cleanedMessage.includes('pothole') || cleanedMessage.includes('सड़क') || cleanedMessage.includes('गड्ढा')) {
        reply = 'सड़क के गड्ढों की रिपोर्ट करने के लिए, "शिकायत दर्ज करें" पेज पर जाएं और फोटो अपलोड करें। सिस्टम पीडब्ल्यूडी (PWD) या स्थानीय नगरपालिका को शिकायत भेज देगा।'
      } else {
        reply = 'नमस्ते! मैं वैनगार्ड एआई हूं, आपका नागरिक सहायक। मैं नागरिक प्रक्रियाओं, विभागों या सुरक्षा जोखिमों के बारे में आपकी सहायता कर सकता हूं। आप क्या पूछना चाहते हैं?'
      }
    } else if (language === 'ta') {
      if (cleanedMessage.includes('water') || cleanedMessage.includes('தண்ணீர்')) {
        reply = 'தண்ணீர் பிரச்சனை உள்ளதாக உணர்கிறேன். நகராட்சி விதிமுறைகளின்படி, குடிநீர் வடிகால் வாரியம் இதற்கு பொறுப்பாகும். நீங்கள் வான்கார்டின் "புகார் அளிக்கவும்" பிரிவில் புகார் செய்யலாம்.'
      } else if (cleanedMessage.includes('electricity') || cleanedMessage.includes('மின்सாரம்') || cleanedMessage.includes('லைட்')) {
        reply = 'மின்சார பிரச்சனைகள் மின் வாரியத்தால் (TNEB) நிர்வகிக்கப்படுகின்றன. நீங்கள் "அதிகாரிகள் அடைவு" பிரிவில் தொடர்பு விவரங்களை கண்டறியலாம்.'
      } else if (cleanedMessage.includes('garbage') || cleanedMessage.includes('குப்பை')) {
        reply = 'Solid Waste Management மற்றும் குப்பை சேகரிப்பு உள்ளூர் மாநகராட்சியால் நிர்வகிக்கப்படுகிறது. "குப்பை/சுத்தம்" பிரிவின் கீழ் புகார் செய்யவும்.'
      } else if (cleanedMessage.includes('pothole') || cleanedMessage.includes('பள்ளம்') || cleanedMessage.includes('சாலை')) {
        reply = 'சாலையில் உள்ள பள்ளங்களை புகார் செய்ய, "புகார் அளிக்கவும்" பக்கத்திற்கு சென்று புகைப்படம் பதிவேற்றவும். அது PWD அல்லது உள்ளூர் நகராட்சிக்கு அனுப்பப்படும்.'
      } else {
        reply = 'வணக்கம்! நான் வான்கார்ட் AI. மக்கள் பிரச்சனைகள், துறைகள் அல்லது பாதுகாப்புகள் குறித்து உங்களுக்கு உதவ நான் தயாராக உள்ளேன்.'
      }
    } else if (language === 'kn') {
      if (cleanedMessage.includes('water') || cleanedMessage.includes('ನೀರು')) {
        reply = 'ನಿಮಗೆ ನೀರಿನ ತೊಂದರೆ ಇರುವುದು ಕಂಡುಬಂದಿದೆ. ಸ್ಥಳೀಯ ಜಲಮಂಡಳಿ ಇದಕ್ಕೆ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ. ನೀವು ದೂರು ಸಲ್ಲಿಸಲು "ವರದಿ ಮಾಡಿ" ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಬಹುದು.'
      } else if (cleanedMessage.includes('electricity') || cleanedMessage.includes('ವಿದ್ಯುತ್') || cleanedMessage.includes('ಕರೆಂಟ್')) {
        reply = 'ವಿದ್ಯುತ್ ತೊಂದರೆಗಳನ್ನು ಸ್ಥಳೀಯ ವಿದ್ಯುತ್ ಸರಬರಾಜು ಸಂಸ್ಥೆ (BESCOM ನಂತಹ) ನಿಭಾಯಿಸುತ್ತದೆ. ನೀವು "ಅಧಿಕಾರಿಗಳ ಡೈರೆಕ್ಟರಿ" ಯಲ್ಲಿ ವಿವರಗಳನ್ನು ಹುಡುಕಬಹುದು.'
      } else if (cleanedMessage.includes('garbage') || cleanedMessage.includes('ಕಸ')) {
        reply = 'ಕಸ ಸಂಗ್ರಹಣೆ ಹಾಗೂ ಸ್ವಚ್ಛತೆಯನ್ನು ಸ್ಥಳೀಯ ಮುನ್ಸಿಪಲ್ ಕಾರ್ಪೊರೇಷನ್ ನಿರ್ವಹಿಸುತ್ತದೆ. ದಯವಿಟ್ಟು "ಕಸ/ನೈರ್ಮಲ್ಯ" ವಿಭಾಗದ ಅಡಿಯಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.'
      } else if (cleanedMessage.includes('pothole') || cleanedMessage.includes('ರಸ್ತೆ') || cleanedMessage.includes('ಗುಂಡಿ')) {
        reply = 'ರಸ್ತೆ ಗುಂಡಿಗಳ ಬಗ್ಗೆ ದೂರು ನೀಡಲು, "ವರದಿ ಮಾಡಿ" ಪುಟದಲ್ಲಿ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ, ಸಿಸ್ಟಂ ಅದನ್ನು ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆ (PWD) ಗೆ ನಿಯೋಜಿಸುತ್ತದೆ.'
      } else {
        reply = 'ನಮಸ್ಕಾರ! ನಾನು ವ್ಯಾನ್‌ಗಾರ್ಡ್ AI ಸಹಾಯಕಿ. ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ವರದಿ ಹಾಗೂ ವಿವಿಧ ಇಲಾಖೆಗಳ ಮಾಹಿತಿ ನೀಡಲು ನಾನು ಸದಾ ಸಿದ್ಧ.'
      }
    } else {
      // English default
      if (cleanedMessage.includes('water') || cleanedMessage.includes('leak')) {
        reply = `I see you have a water issue. Under Indian municipal regulations, the Water Supply & Sewerage Board is responsible. You can file a report in VANGUARD's 'Report Issue' section.`
      } else if (cleanedMessage.includes('electricity') || cleanedMessage.includes('wire') || cleanedMessage.includes('power') || cleanedMessage.includes('light')) {
        reply = `Electricity issues like broken wires, power cuts, or streetlights are managed by the State Electricity Board. You can find contact details under the 'Officials Directory'.`
      } else if (cleanedMessage.includes('garbage') || cleanedMessage.includes('waste') || cleanedMessage.includes('clean')) {
        reply = `Solid waste management and garbage collection are handled by the local Municipal Corporation. Please file a complaint under the 'Garbage/Sanitation' category.`
      } else if (cleanedMessage.includes('pothole') || cleanedMessage.includes('road') || cleanedMessage.includes('street')) {
        reply = `To report a pothole or road damage, go to the 'Report Issue' page, upload a photo, and the system will assign it to the Public Works Department (PWD) or local municipality.`
      } else {
        reply = `Hello! I am VANGUARD AI, your civic assistant. I can guide you on local department responsibilities, predicted risks, or help compose a formal civic report.`
      }
    }
    return reply
  }
}
