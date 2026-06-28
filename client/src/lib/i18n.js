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
    escalation: 'Escalation Level', risk: 'Risk Prediction',
    all_clear: 'All clear! No critical issues reported',
    urgent_hazards: 'Urgent hazards need attention',
    latest_chat_update: 'Latest Chat Update',
    no_messages: 'No chat messages posted yet',
    available_workers: 'Available Workers',
    workers_ready: 'skill providers ready to work nearby',
    no_workers: 'No registered workers online',
    ai_prediction_alert: 'AI Prediction Alert',
    photo: 'Photo',
    details: 'Details',
    ai_report: 'AI Report',
    step_1_upload: 'Step 1: Upload Civic Hazard Photo',
    take_photo_upload: 'Take Photo or Upload from Gallery',
    accepts_images: 'Accepts images (JPEG, PNG) up to 5MB',
    change_photo: 'Change Photo',
    next_step: 'Next Step',
    step_2_describe: 'Step 2: Describe the Hazard',
    describe_using_voice: 'Describe using text or record voice note:',
    textarea_placeholder: 'Describe the issue (e.g. Broken road with dangerous potholes near public park, water pipe leakage creating a massive sinkhole...)',
    listening_speak: 'Listening... Speak now',
    tap_to_speak: 'Tap to Speak (Voice Input)',
    transcribed: 'Transcribed',
    back: 'Back',
    step_3_confirm: 'Step 3: Confirm GPS Location',
    gps_detected: 'GPS Detected Address',
    map_drag_instruction: 'Drag or tap anywhere on the map above to manually correct the pin position.',
    analyze_with_ai: 'Analyze with AI',
    modify_location: 'Modify Location',
    submit_issue_log: 'Submit Issue Log',
    download_pdf_report: 'Download PDF Report',
    share_with_community: 'Share with Community',
    escalated_to: 'Escalated to',
    civic_category: 'Civic Category',
    analysis_reason: 'Analysis Reason',
    predicted_risk: 'Predicted Community Risk',
    dispatch_agency: 'Recommended Dispatch Agency',
    complaint_text: 'Generated Complaint Text',
    common: {
      home: 'Home', map: 'Live Map', community: 'Community Chat',
      workers: 'Worker Market', emergency: 'Emergency Alert',
      ai: 'AI Assistant', officials: 'Officials Directory',
      profile: 'Profile', admin: 'Admin Panel'
    }
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
    escalation: 'वृद्धि स्तर', risk: 'जोखिम भविष्यवाणी',
    all_clear: 'सब साफ़! कोई गंभीर समस्या रिपोर्ट नहीं हुई',
    urgent_hazards: 'गंभीर खतरों पर ध्यान देने की आवश्यकता है',
    latest_chat_update: 'नवीनतम चैट अपडेट',
    no_messages: 'अभी तक कोई चैट संदेश पोस्ट नहीं किया गया है',
    available_workers: 'उपलब्ध कामगार',
    workers_ready: 'कौशल प्रदाता पास में काम करने के लिए तैयार हैं',
    no_workers: 'कोई पंजीकृत कामगार ऑनलाइन नहीं है',
    ai_prediction_alert: 'एआई पूर्वानुमान अलर्ट',
    photo: 'फ़ोटो',
    details: 'विवरण',
    ai_report: 'एआई रिपोर्ट',
    step_1_upload: 'चरण 1: नागरिक खतरे का फोटो अपलोड करें',
    take_photo_upload: 'फोटो लें या गैलरी से अपलोड करें',
    accepts_images: '5MB तक की छवियां (JPEG, PNG) स्वीकार्य हैं',
    change_photo: 'फोटो बदलें',
    next_step: 'अगला चरण',
    step_2_describe: 'चरण 2: खतरे का वर्णन करें',
    describe_using_voice: 'पाठ का उपयोग करके वर्णन करें या आवाज नोट दर्ज करें:',
    textarea_placeholder: 'समस्या का वर्णन करें (जैसे सार्वजनिक पार्क के पास खतरनाक गड्ढों वाली टूटी सड़क, पानी के पाइप का रिसाव...)',
    listening_speak: 'सुन रहा हूँ... अब बोलें',
    tap_to_speak: 'बोलने के लिए टैप करें (आवाज इनपुट)',
    transcribed: 'अनुवादित',
    back: 'पीछे',
    step_3_confirm: 'चरण 3: जीपीएस स्थान की पुष्टि करें',
    gps_detected: 'जीपीएस द्वारा पता लगाया गया पता',
    map_drag_instruction: 'पिन की स्थिति को मैन्युअल रूप से ठीक करने के लिए ऊपर दिए गए मानचित्र पर कहीं भी खींचें या टैप करें।',
    analyze_with_ai: 'एआई से विश्लेषण करें',
    modify_location: 'स्थान संशोधित करें',
    submit_issue_log: 'समस्या लॉग सबमिट करें',
    download_pdf_report: 'PDF रिपोर्ट डाउनलोड करें',
    share_with_community: 'समुदाय के साथ साझा करें',
    escalated_to: 'को प्रेषित किया गया',
    civic_category: 'नागरिक श्रेणी',
    analysis_reason: 'विश्लेषण का कारण',
    predicted_risk: 'पूर्वानुमानित समुदाय जोखिम',
    dispatch_agency: 'अनुशंसित प्रेषण एजेंसी',
    complaint_text: 'उत्पन्न शिकायत पाठ',
    common: {
      home: 'होम', map: 'नक्शा', community: 'समुदाय चैट',
      workers: 'कामगार बाजार', emergency: 'आपातकालीन अलर्ट',
      ai: 'एआई सहायक', officials: 'अधिकारी निर्देशिका',
      profile: 'प्रोफाइल', admin: 'एडमिन पैनल'
    }
  }},
  kn: { translation: {
    home: 'ಮನೆ', report: 'ಸಮಸ್ಯೆ ವರದಿ', community: 'ಸಮುದಾಯ',
    workers: 'ಕೆಲಸಗಾರರು', emergency: 'ತುರ್ತು', map: 'ನಕ್ಷೆ',
    ai: 'AI ಸಹಾಯಕ', profile: 'ಪ್ರೊಫೈಲ್',
    greeting_morning: 'ಶುಭೋದಯ', greeting_afternoon: 'ನಮಸ್ಕಾರ',
    greeting_evening: 'ಶುಭ ಸಂಜೆ', greeting_night: 'ಶುಭ ರಾತ್ರಿ',
    report_issue: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ', submit: 'ಸಲ್ಲಿಸಿ',
    analyze: 'AI ನಿಂದ ವಿಶ್ಲೇಷಿಸಿ', upload_photo: 'ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
    common: {
      home: 'ಮನೆ', map: 'ನಕ್ಷೆ', community: 'ಸಮುದಾಯ ಚಾಟ್',
      workers: 'ಕೆಲಸಗಾರರು', emergency: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ',
      ai: 'AI ಸಹಾಯಕ', officials: 'ಅಧಿಕಾರಿಗಳು',
      profile: 'ಪ್ರೊಫೈಲ್', admin: 'ನಿರ್ವಾಹಕರು'
    }
  }},
  ta: { translation: {
    home: 'முகப்பு', report: 'பிரச்சனை புகார்', community: 'சமூகம்',
    workers: 'தொழிலாளர்கள்', emergency: 'அவசரநிலை', map: 'வரைபடம்',
    greeting_morning: 'காலை வணக்கம்', greeting_afternoon: 'மதிய வணக்கம்',
    submit: 'சமர்ப்பிக்கவும்', analyze: 'AI மூலம் பகுப்பாய்வு',
    common: {
      home: 'முகப்பு', map: 'வரைபடம்', community: 'சமூக அரட்டை',
      workers: 'தொழிலாளர்கள்', emergency: 'அவசர எச்சரிக்கை',
      ai: 'AI உதவி', officials: 'அதிகாரிகள்',
      profile: 'சுயவிவரம்', admin: 'நிர்வாகம்'
    }
  }},
  te: { translation: {
    home: 'హోమ్', report: 'సమస్య నివేదించు', community: 'సమాజం',
    workers: 'కార్మికులు', emergency: 'అత్యవసరం',
    greeting_morning: 'శుభోదయం', submit: 'సమర్పించు',
    common: {
      home: 'హోమ్', map: 'మ్యాಪ್', community: 'చాట్',
      workers: 'కార్మికులు', emergency: 'అత్యవసరం',
      ai: 'AI సహాయకుడు', officials: 'అధికారులు',
      profile: 'ప్రొఫైల్', admin: 'నిర్వాహకులు'
    }
  }},
  ml: { translation: {
    home: 'ഹോം', report: 'പ്രശ്നം റിപ്പോർട്ട്', community: 'കമ്മ്യൂणीറ്റി',
    greeting_morning: 'സുപ്രഭാതം', submit: 'സമർപ്പിക്കുക',
    common: {
      home: 'ഹോം', map: 'മാപ്പ്', community: 'ചാറ്റ്',
      workers: 'തൊഴിലാളികൾ', emergency: 'അടിയന്തിരാവസ്ഥ',
      ai: 'AI അസിസ്റ്റന്റ്', officials: 'ഉദ്യോഗസ്ഥർ',
      profile: 'പ്രൊഫൈൽ', admin: 'അഡ്മിൻ'
    }
  }},
  bn: { translation: {
    home: 'হোম', report: 'সমস্যা রিপোর্ট', community: 'সম্প্রদায়',
    greeting_morning: 'শুভ सकाळ', submit: 'জমা দিন',
    common: {
      home: 'হোম', map: 'মানচিত্র', community: 'ਚੈਟ',
      workers: 'শ্রমিক বাজার', emergency: 'জরুরী সতর্কতা',
      ai: 'এআই সহকারী', officials: 'কর্মকর্তারা',
      profile: 'প্রোফাইল', admin: 'অ্যাডমিন'
    }
  }},
  mr: { translation: {
    home: 'होम', report: 'समस्या नोंदवा', community: 'समुदाय',
    greeting_morning: 'शुभ प्रभात', submit: 'सादर करा',
    common: {
      home: 'होम', map: 'नकाशा', community: 'चॅट',
      workers: 'कामगार', emergency: 'आणीबाणी',
      ai: 'एआय सहाय्यक', officials: 'अधिकारी',
      profile: 'प्रोफाइल', admin: 'प्रशासक'
    }
  }},
  gu: { translation: {
    home: 'હોમ', report: 'સમસ્યા નોંધો', community: 'સમુદાય',
    greeting_morning: 'સુપ્રભાત', submit: 'સબમિટ કરો',
    common: {
      home: 'હોમ', map: 'નકશો', community: 'ચેટ',
      workers: 'શ્રમિકો', emergency: 'કટોકटी',
      ai: 'એઆઈ મદદનીશ', officials: 'અધિકારીઓ',
      profile: 'પ્રોફાઇલ', admin: 'એડમિન'
    }
  }},
  pa: { translation: {
    home: 'ਹੋਮ', report: 'ਸਮੱਸਿਆ ਰਿਪੋਰਟ', community: 'ਭਾਈਚਾਰਾ',
    greeting_morning: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    common: {
      home: 'ਹੋਮ', map: 'ਨਕਸ਼ਾ', community: 'ਚੈਟ',
      workers: 'ਕਾਮੇ', emergency: 'ਐਮਰਜੈਂਸੀ',
      ai: 'ਏਆਈ ਸਹਾਇक', officials: 'ਅਧਿਕਾਰੀ',
      profile: 'ਪ੍ਰੋਫਾਈਲ', admin: 'ਐਡਮਿਨ'
    }
  }}
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('vanguard_language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
