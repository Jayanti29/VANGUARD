import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: {
    home: 'Home', report: 'Report Issue', community: 'Community',
    workers: 'Workers', emergency: 'Emergency', map: 'Map',
    ai: 'AI Assistant', profile: 'Profile',
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening', greeting_night: 'Good night',
    report_issue: 'Report Issue', critical_issues: 'Critical Issues',
    community_updates: 'Community Updates', workers_nearby: 'Workers Nearby',
    ai_alerts: 'AI Alerts', submit: 'Submit', cancel: 'Cancel',
    send: 'Send', hire: 'Hire', call: 'Call', email: 'Email',
    analyze: 'Analyze with AI', download_pdf: 'Download PDF',
    share_community: 'Share with Community', upload_photo: 'Upload Photo',
    voice_note: 'Voice Note', description: 'Description',
    location: 'Location', severity: 'Severity', category: 'Category',
    impact_score: 'Impact Score', authority: 'Recommended Authority',
    escalation: 'Escalation Level', risk: 'Risk Prediction'
  }},
  hi: { translation: {
    home: 'होम', report: 'समस्या रिपोर्ट करें', community: 'समुदाय',
    workers: 'कामगार', emergency: 'आपातकाल', map: 'नक्शा',
    ai: 'AI सहायक', profile: 'प्रोफाइल',
    greeting_morning: 'सुप्रभात', greeting_afternoon: 'नमस्कार',
    greeting_evening: 'शुभ संध्या', greeting_night: 'शुभ रात्रि',
    report_issue: 'समस्या रिपोर्ट करें', critical_issues: 'गंभीर समस्याएं',
    community_updates: 'समुदाय अपडेट', workers_nearby: 'पास के कामगार',
    ai_alerts: 'AI अलर्ट', submit: 'जमा करें', cancel: 'रद्द करें',
    send: 'भेजें', hire: 'काम पर रखें', call: 'कॉल करें', email: 'ईमेल',
    analyze: 'AI से विश्लेषण करें', download_pdf: 'PDF डाउनलोड करें',
    share_community: 'समुदाय से साझा करें', upload_photo: 'फोटो अपलोड करें',
    voice_note: 'वॉइस नोट', description: 'विवरण',
    location: 'स्थान', severity: 'गंभीरता', category: 'श्रेणी',
    impact_score: 'प्रभाव स्कोर', authority: 'अनुशंसित प्राधिकरण',
    escalation: 'वृद्धि स्तर', risk: 'जोखिम भविष्यवाणी'
  }},
  kn: { translation: {
    home: 'ಮನೆ', report: 'ಸಮಸ್ಯೆ ವರದಿ', community: 'ಸಮುದಾಯ',
    workers: 'ಕೆಲಸಗಾರರು', emergency: 'ತುರ್ತು', map: 'ನಕ್ಷೆ',
    ai: 'AI ಸಹಾಯಕ', profile: 'ಪ್ರೊಫೈಲ್',
    greeting_morning: 'ಶುಭೋದಯ', greeting_afternoon: 'ನಮಸ್ಕಾರ',
    greeting_evening: 'ಶುಭ ಸಂಜೆ', greeting_night: 'ಶುಭ ರಾತ್ರಿ',
    report_issue: 'ಸಮस्यೆ ವರದಿ ಮಾಡಿ', submit: 'ಸಲ್ಲಿಸಿ',
    analyze: 'AI ನಿಂದ ವಿಶ್ಲೇಷಿಸಿ', upload_photo: 'ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ'
  }},
  ta: { translation: {
    home: 'முகப்பு', report: 'பிரச்சனை புகார்', community: 'சமூகம்',
    workers: 'தொழிலாளர்கள்', emergency: 'அவசரநிலை', map: 'வரைபடம்',
    greeting_morning: 'காலை வணக்கம்', greeting_afternoon: 'மதிய வணக்கம்',
    submit: 'சமர்ப்பிக்கவும்', analyze: 'AI மூலம் பகுப்பாய்வு'
  }},
  te: { translation: {
    home: 'హోమ్', report: 'సమస్య నివేదించు', community: 'సమాజం',
    workers: 'కార్మికులు', emergency: 'అత్యవసరం',
    greeting_morning: 'శుభోదయం', submit: 'సమర్పించు'
  }},
  ml: { translation: {
    home: 'ഹോം', report: 'പ്രശ്നം റിപ്പോർട്ട്', community: 'കമ്മ്യൂണിറ്റി',
    greeting_morning: 'സുപ്രഭാതം', submit: 'സമർപ്പിക്കുക'
  }},
  bn: { translation: {
    home: 'হোম', report: 'সমস্যা রিপোর্ট', community: 'সম্প্রদায়',
    greeting_morning: 'शुभ सकाळ', submit: 'জমা দিন'
  }},
  mr: { translation: {
    home: 'होम', report: 'समस्या नोंदवा', community: 'समुदाय',
    greeting_morning: 'शुभ प्रभात', submit: 'सादर करा'
  }},
  gu: { translation: {
    home: 'હોમ', report: 'સમસ્યા નોંધો', community: 'સમુદાય',
    greeting_morning: 'સુપ્રભાત', submit: 'સબમિટ કરો'
  }},
  pa: { translation: {
    home: 'ਹੋਮ', report: 'ਸਮੱਸਿਆ ਰਿਪੋਰਟ', community: 'ਭਾਈਚਾਰਾ',
    greeting_morning: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', submit: 'ਜਮ੍ਹਾਂ ਕਰੋ'
  }}
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('vanguard_language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
