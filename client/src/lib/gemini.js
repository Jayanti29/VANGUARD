import { GoogleGenAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// If we are in mock mode (no key), we simulate the AI analysis based on keywords in description.
const simulateAIAnalysis = (description, language = 'en') => {
  const descLower = (description || '').toLowerCase();
  
  let category = 'other';
  let categoryLabel = 'Other Issue / अन्य';
  let severity = 'yellow';
  let severityLabel = 'Needs Attention';
  let severityReason = 'This issue was reported by a community member and requires inspection.';
  let riskType = 'environmental';
  let riskPrediction = 'If left unaddressed, this could lead to minor accidents or health concerns.';
  let recommendedAuthority = 'Ward Development Officer';
  let escalationLevel = 'ward';
  let reportText = `This report is submitted regarding the civic issue: "${description || 'No description provided'}". Prompt action is requested to resolve this for community safety.`;
  let suggestedAction = 'Keep community members advised and submit a report to the municipal office.';
  let isEmergency = false;
  let impactScore = 45;
  let impactFactors = ['Community feedback', 'Pending verification'];

  if (descLower.includes('wire') || descLower.includes('electric') || descLower.includes('current') || descLower.includes('bijli')) {
    category = 'electrical_wire';
    categoryLabel = 'Electrical Wire / बिजली का तार';
    severity = 'red';
    severityLabel = 'Dangerous';
    severityReason = 'Exposed or hanging live wires represent an immediate threat of electrocution.';
    riskType = 'accident';
    riskPrediction = 'High risk of electrocution for pedestrians. Children\'s school is located nearby.';
    recommendedAuthority = 'State Electricity Board';
    escalationLevel = 'emergency';
    reportText = `Urgent alert regarding hanging and exposed electrical wires in the neighborhood. This creates a highly hazardous situation for pedestrians, particularly children. Immediate intervention is required to secure the cables.`;
    suggestedAction = 'Keep away from the wire and warn others not to go near.';
    isEmergency = true;
    impactScore = 84;
    impactFactors = ['High danger level', 'Close proximity to public paths', 'Electrocution threat'];
  } else if (descLower.includes('garbage') || descLower.includes('trash') || descLower.includes('kachra') || descLower.includes('dump')) {
    category = 'garbage';
    categoryLabel = 'Garbage / कचरा';
    severity = 'yellow';
    severityLabel = 'Needs Attention';
    severityReason = 'Accumulated waste attracts pests and poses health risks over time.';
    riskType = 'environmental';
    riskPrediction = 'Stagnant garbage piles could result in vector-borne diseases and bad odor.';
    recommendedAuthority = 'Sanitation & Waste Management Department';
    escalationLevel = 'community';
    reportText = `Public concern regarding uncollected solid waste and garbage accumulating on the road. The waste is emitting foul odors and attracting stray animals. Requesting regular cleanup schedule.`;
    suggestedAction = 'Ensure waste is covered and notify local waste disposal truck.';
    isEmergency = false;
    impactScore = 35;
    impactFactors = ['Hygiene risks', 'Stray animals attraction'];
  } else if (descLower.includes('pothole') || descLower.includes('road') || descLower.includes('gadha') || descLower.includes('broken')) {
    category = 'pothole';
    categoryLabel = 'Pothole / गड्ढा';
    severity = 'orange';
    severityLabel = 'Urgent';
    severityReason = 'Large potholes on main roads can cause sudden vehicle damage and road accidents.';
    riskType = 'accident';
    riskPrediction = 'Could cause two-wheeler riders to lose control, especially at night or during rain.';
    recommendedAuthority = 'Public Works Department (PWD)';
    escalationLevel = 'district';
    reportText = `Serious pothole detected on the main road stretch. Vehicles are frequently swerving to avoid it, posing a collision risk. Prompt road repairing is requested.`;
    suggestedAction = 'Slow down vehicles and mark with a temporary barrier or warning sign.';
    isEmergency = false;
    impactScore = 65;
    impactFactors = ['Vehicle damage risk', 'Accident prone location', 'Poor visibility at night'];
  } else if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('drain') || descLower.includes('paani')) {
    category = 'water_leakage';
    categoryLabel = 'Water Leakage / पानी का रिसाव';
    severity = 'yellow';
    severityLabel = 'Needs Attention';
    severityReason = 'Continuous water leakage wastes clean drinking water and degrades road quality.';
    riskType = 'environmental';
    riskPrediction = 'Wastage of precious water resources and water-logging leading to road damage.';
    recommendedAuthority = 'Water Supply and Sewerage Board';
    escalationLevel = 'ward';
    reportText = `Clean drinking water is leaking from a main pipe joint, flooding the adjoining footpath. The wastage has been ongoing for over 24 hours. Requesting immediate repair.`;
    suggestedAction = 'Shut down nearby supply valve if possible and report to ward line-man.';
    isEmergency = false;
    impactScore = 50;
    impactFactors = ['Resource waste', 'Footpath flooding'];
  }

  // Adjust score based on severity
  let finalScore = impactScore;
  if (severity === 'red') finalScore += 10;
  else if (severity === 'orange') finalScore += 5;
  finalScore = Math.min(100, finalScore);

  return {
    category,
    categoryLabel,
    severity,
    severityLabel,
    severityReason,
    riskType,
    riskPrediction,
    impactScore: finalScore,
    impactFactors,
    recommendedAuthority,
    escalationLevel,
    reportText,
    suggestedAction,
    isEmergency
  };
};

export const analyzeIssueImage = async (base64Image, description, language = 'en') => {
  // If API key is not valid, fallback to simulated analysis
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    console.log("[Gemini API] Running in simulated mode due to missing key");
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 3000));
    return simulateAIAnalysis(description, language);
  }

  try {
    // Note: In newer version of the Google Gen AI SDK, the constructor is GoogleGenAI
    const ai = new GoogleGenAI({ apiKey });
    // In SDK, for vision queries we can use the gemini-2.5-flash model
    const model = ai.models.get({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
You are an AI civic safety analyzer for India. Analyze this image of a 
community issue and return ONLY a valid JSON object with no extra text, 
no markdown, no backticks.

{
  "category": "pothole" | "garbage" | "water_leakage" | "broken_road" | "illegal_dumping" | "fallen_tree" | "open_drain" | "broken_streetlight" | "electrical_wire" | "sewage" | "fire_hazard" | "illegal_activity" | "other",
  "categoryLabel": "human-readable category name in user's language",
  "severity": "green" | "yellow" | "orange" | "red",
  "severityLabel": "Minor" | "Needs Attention" | "Urgent" | "Dangerous",
  "severityReason": "one sentence explaining why this severity was chosen",
  "riskType": "accident" | "health" | "environmental" | "crime" | "fire" | "none",
  "riskPrediction": "one sentence predicting what happens if this is not fixed",
  "impactScore": 0-100 (integer),
  "impactFactors": ["factor1", "factor2"],
  "recommendedAuthority": "exact department name",
  "escalationLevel": "community" | "ward" | "district" | "emergency",
  "reportText": "2-3 sentence professional complaint paragraph",
  "suggestedAction": "one sentence immediate action recommendation",
  "isEmergency": true | false
}

Severity guide:
  green  = cosmetic, no safety risk
  yellow = inconvenient, minor safety risk
  orange = significant risk, needs action within 24 hours  
  red    = immediate danger to life, property, or health

If the image is not a civic issue, return severity: "green" 
and category: "other" with appropriate explanation.

User provided description: "${description || 'No description'}"
Output language: "${language}" (Translate categoryLabel, severityLabel, severityReason, riskPrediction, reportText, and suggestedAction to this language).
`;

    // Process base64 image data
    // base64Image comes as "data:image/jpeg;base64,..." - split by comma
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    const responseText = response.text || '';
    // Strip markdown JSON wrappers if any
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanText);

    // Calculate final impactScore: base score + 10 if red, + 5 if orange, cap at 100
    let impactScore = parsedData.impactScore || 50;
    if (parsedData.severity === 'red') {
      impactScore += 10;
    } else if (parsedData.severity === 'orange') {
      impactScore += 5;
    }
    parsedData.impactScore = Math.min(100, impactScore);

    return parsedData;
  } catch (err) {
    console.error("Gemini API call failed, falling back to simulation:", err);
    return simulateAIAnalysis(description, language);
  }
};
