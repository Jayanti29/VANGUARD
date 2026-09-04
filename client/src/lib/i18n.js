import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const translations = {
  en: {
    // Navigation
    nav_home: 'Home', nav_map: 'Live Map', nav_community: 'Community Chat',
    nav_ai: 'AI Assistant', nav_profile: 'Profile', nav_workers: 'Worker Market',
    nav_emergency: 'Emergency Alert', nav_officials: 'Officials Directory',
    nav_farmers: 'Farmers Market',
    
    // Farmers Dashboard
    farmers_title: 'Farmers Mandi & Agri Dashboard',
    mandi_prices: 'Local Mandi Crop Rates',
    crop_search: 'Search crop (Paddy, Wheat, Tomato...)...',
    fertilization_help: 'Fertilization & Crop Care Advisor',
    ai_agri_advisor: 'AI Agri Assistant',
    weather_advisory: 'Weather & Irrigation Advisory',
    today_price: "Today's Rate (₹/Quintal)",
    yesterday_price: "Yesterday's Rate",
    price_trend: 'Price Trend',
    ask_fertilizer: 'What is the best fertilizer for Paddy crop right now?',
    pest_control: 'How to prevent yellow leaves on Tomato plants?',
    govt_subsidy: 'Government subsidy schemes for drip irrigation',
    
    // Home
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening', greeting_night: 'Good night',
    critical_issues: 'Critical Issues', community_updates: 'Community Updates',
    workers_nearby: 'Workers Nearby', ai_alerts: 'AI Alerts',
    view_all: 'View all', no_issues: 'No issues in your area',
    
    // Report
    report_issue: 'Report Issue', upload_photo: 'Upload Photo',
    take_photo: 'Take Photo or Upload', voice_note: 'Voice Note',
    add_description: 'Add description...', detect_location: 'Detect My Location',
    enter_manually: 'Enter Manually', analyze_ai: 'Analyze with AI',
    analyzing: 'Analyzing...', detecting_hazard: 'Detecting hazard type...',
    calculating_risk: 'Calculating risk score...', finding_authority: 'Finding authority...',
    download_pdf: 'Download PDF Report', share_community: 'Share with Community',
    submit_issue: 'Submit Issue', issue_submitted: 'Issue reported successfully!',
    
    // Severity
    severity_green: 'Minor', severity_yellow: 'Needs Attention',
    severity_orange: 'Urgent', severity_red: 'Dangerous',
    
    // Community
    general: 'General', emergency_ch: 'Emergency', workers_ch: 'Workers',
    announcements: 'Announcements', agriculture: 'Agriculture',
    type_message: 'Type a message...', send: 'Send',
    live_room: 'Live Room', hold_to_speak: 'Hold to Speak',
    speaking: 'Speaking...', join_broadcast: 'Join Broadcast',
    leave_room: 'Leave Room', in_room: 'in room',
    voice_message: 'Voice message', record_voice: 'Record Voice',
    stop_recording: 'Stop', cancel: 'Cancel',
    
    // Workers
    find_workers: 'Find Workers', post_job: 'Post a Job',
    my_posts: 'My Posts', search_skill: 'Search by skill...',
    hire: 'Hire', apply: 'Apply', available: 'Available',
    unavailable: 'Not Available', per_day: '/day',
    years_exp: 'years experience', apply_job: 'Apply for Job',
    your_rate: 'Your proposed rate (â‚¹/day)',
    cover_message: 'Why are you the right person?',
    submit_application: 'Submit Application', application_sent: 'Application submitted!',
    
    // Emergency
    emergency_title: 'Emergency Alert',
    emergency_subtitle: 'Your alert reaches community members and officials instantly',
    fire: 'Fire', accident: 'Accident', medical: 'Medical',
    crime: 'Crime', flood: 'Flood', electric: 'Electric Hazard',
    send_alert: 'Send Emergency Alert', alert_sent: 'Alert sent!',
    confirm_alert: 'This will alert all community members and officials.',
    confirm: 'Confirm', active_emergencies: 'Active Emergencies',
    
    // AI
    ai_title: 'AI Assistant', ai_subtitle: 'Ask anything about civic issues',
    ai_placeholder: 'Ask a question...', ai_thinking: 'Thinking...',
    suggested_1: 'Water overflowing near school',
    suggested_2: 'Who handles electricity issues?',
    suggested_3: 'Garbage not collected for 3 days',
    suggested_4: 'How to report a pothole?',
    
    // Profile
    profile_title: 'Profile', edit_profile: 'Edit Profile',
    dark_mode: 'Dark Mode', light_mode: 'Light Mode',
    language: 'Language', notifications: 'Notifications',
    logout: 'Logout', issues_reported: 'Issues Reported',
    confirmations: 'Confirmations', community_score: 'Community Score',
    save: 'Save', saved: 'Saved!',
    
    // Officials
    officials_title: 'Officials Directory',
    search_officials: 'Search by name or department...',
    call: 'Call', email: 'Email', all: 'All',
    ward: 'Ward', police: 'Police', health: 'Health',
    electricity: 'Electricity', municipality: 'Municipality',
    
    // Auth
    select_language: 'Choose Your Language',
    i_am_a: 'I am a...',
    citizen: 'Citizen', worker: 'Worker',
    official: 'Official', volunteer: 'Volunteer',
    your_location: 'Your Location', your_name: 'Your full name',
    continue: 'Continue', back: 'Back',
    phone_verify: 'Verify Your Account',
    enter_phone: '10-digit phone number',
    send_otp: 'Send OTP', verify_otp: 'Verify & Enter',
    otp_sent: 'OTP sent to',
    enter_otp: 'Enter 6-digit OTP',
    google_signin: 'Continue with Google',
    location_detected: 'Location Detected',
    detecting: 'Detecting your location...',
    allow_location: 'Please allow location access',
    location_denied: 'Location access denied',
    try_again: 'Try Again', enter_manual: 'Enter Manually',
    state: 'State', district: 'District',
    village_area: 'Village / Town / Area', ward_no: 'Ward Number (optional)',
    announcements: 'à²ªà³�à²°à²•à²Ÿà²£à³†à²—à²³à³�', agriculture: 'à²•à³ƒà²·à²¿',
    type_message: 'à²¸à²‚à²¦à³‡à²¶ à²Ÿà³ˆà²ªà³� à²®à²¾à²¡à²¿...', send: 'à²•à²³à³�à²¹à²¿à²¸à²¿',
    live_room: 'à²²à³ˆà²µà³� à²°à³‚à²®à³�', hold_to_speak: 'à²®à²¾à²¤à²¨à²¾à²¡à²²à³� à²’à²¤à³�à²¤à²¿ à²¹à²¿à²¡à²¿à²¯à²¿à²°à²¿',
    speaking: 'à²®à²¾à²¤à²¨à²¾à²¡à³�à²¤à³�à²¤à²¿à²¦à³�à²¦à²¾à²°à³†...', join_broadcast: 'à²ªà³�à²°à²¸à²¾à²°à²•à³�à²•à³† à²¸à³‡à²°à²¿',
    leave_room: 'à²°à³‚à²®à³� à²¤à³Šà²°à³†à²¯à²¿à²°à²¿', in_room: 'à²°à³‚à²®à³�â€Œà²¨à²²à³�à²²à²¿à²¦à³�à²¦à²¾à²°à³†',
    voice_message: 'à²µà²¾à²¯à³�à²¸à³� à²¸à²‚à²¦à³‡à²¶', record_voice: 'à²§à³�à²µà²¨à²¿ à²°à³†à²•à²¾à²°à³�à²¡à³� à²®à²¾à²¡à²¿',
    stop_recording: 'à²¨à²¿à²²à³�à²²à²¿à²¸à²¿', cancel: 'à²°à²¦à³�à²¦à³�à²®à²¾à²¡à²¿',
    find_workers: 'à²•à³†à²²à²¸à²—à²¾à²°à²°à²¨à³�à²¨à³� à²¹à³�à²¡à³�à²•à²¿', post_job: 'à²•à³†à²²à²¸ à²ªà³‹à²¸à³�à²Ÿà³� à²®à²¾à²¡à²¿',
    my_posts: 'à²¨à²¨à³�à²¨ à²ªà³‹à²¸à³�à²Ÿà³�â€Œà²—à²³à³�', search_skill: 'à²•à³Œà²¶à²²à³�à²¯à²¦à²¿à²‚à²¦ à²¹à³�à²¡à³�à²•à²¿...',
    hire: 'à²¨à³‡à²®à²• à²®à²¾à²¡à²¿', apply: 'à²…à²°à³�à²œà²¿ à²¸à²²à³�à²²à²¿à²¸à²¿', available: 'à²²à²­à³�à²¯à²µà²¿à²¦à³†', unavailable: 'à²²à²­à³�à²¯à²µà²¿à²²à³�à²²',
    per_day: '/à²¦à²¿à²¨', years_exp: 'à²µà²°à³�à²·à²—à²³ à²…à²¨à³�à²­à²µ',
    emergency_title: 'à²¤à³�à²°à³�à²¤à³� à²Žà²šà³�à²šà²°à²¿à²•à³†',
    emergency_subtitle: 'à²¨à²¿à²®à³�à²® à²Žà²šà³�à²šà²°à²¿à²•à³† à²¤à²•à³�à²·à²£à²µà³‡ à²¸à²®à³�à²¦à²¾à²¯à²¦ à²¸à²¦à²¸à³�à²¯à²°à³� à²®à²¤à³�à²¤à³� à²…à²§à²¿à²•à²¾à²°à²¿à²—à²³à²¨à³�à²¨à³� à²¤à²²à³�à²ªà³�à²¤à³�à²¤à²¦à³†',
    fire: 'à²¬à³†à²‚à²•à²¿', accident: 'à²…à²ªà²˜à²¾à²¤', medical: 'à²µà³ˆà²¦à³�à²¯à²•à³€à²¯',
    crime: 'à²…à²ªà²°à²¾à²§', flood: 'à²ªà³�à²°à²µà²¾à²¹', electric: 'à²µà²¿à²¦à³�à²¯à³�à²¤à³� à²…à²ªà²¾à²¯',
    send_alert: 'à²¤à³�à²°à³�à²¤à³� à²Žà²šà³�à²šà²°à²¿à²•à³† à²•à²³à³�à²¹à²¿à²¸à²¿', alert_sent: 'à²Žà²šà³�à²šà²°à²¿à²•à³† à²•à²³à³�à²¹à²¿à²¸à²²à²¾à²—à²¿à²¦à³†!',
    ai_title: 'AI à²¸à²¹à²¾à²¯à²•', ai_subtitle: 'à²¨à²¾à²—à²°à²¿à²• à²¸à²®à²¸à³�à²¯à³†à²—à²³ à²¬à²—à³�à²—à³† à²�à²¨à²¨à³�à²¨à²¾à²¦à²°à³‚ à²•à³‡à²³à²¿',
    ai_placeholder: 'à²ªà³�à²°à²¶à³�à²¨à³† à²•à³‡à²³à²¿...', ai_thinking: 'à²¯à³‹à²šà²¿à²¸à³�à²¤à³�à²¤à²¿à²¦à³†...',
    suggested_1: 'à²¶à²¾à²²à³†à²¯ à²¹à²¤à³�à²¤à²¿à²° à²¨à³€à²°à³� à²‰à²•à³�à²•à²¿ à²¹à²°à²¿à²¯à³�à²¤à³�à²¤à²¿à²¦à³†',
    suggested_2: 'à²µà²¿à²¦à³�à²¯à³�à²¤à³� à²¸à²®à²¸à³�à²¯à³†à²—à²³à²¨à³�à²¨à³� à²¯à²¾à²°à³� à²¨à²¿à²°à³�à²µà²¹à²¿à²¸à³�à²¤à³�à²¤à²¾à²°à³†?',
    suggested_3: '3 à²¦à²¿à²¨à²—à²³à²¿à²‚à²¦ à²•à²¸ à²¸à²‚à²—à³�à²°à²¹à²¿à²¸à²¿à²²à³�à²²',
    suggested_4: 'à²°à²¸à³�à²¤à³†à²¯ à²—à³�à²‚à²¡à²¿à²¯à²¨à³�à²¨à³� à²µà²°à²¦à²¿ à²®à²¾à²¡à³�à²µà³�à²¦à³� à²¹à³‡à²—à³†?',
    profile_title: 'à²ªà³�à²°à³Šà²«à³ˆà²²à³�', dark_mode: 'à²¡à²¾à²°à³�à²•à³� à²®à³‹à²¡à³�', light_mode: 'à²²à³ˆà²Ÿà³� à²®à³‹à²¡à³�',
    language: 'à²­à²¾à²·à³†', logout: 'à²²à²¾à²—à³� à²”à²Ÿà³�', save: 'à²‰à²³à²¿à²¸à²¿', saved: 'à²‰à²³à²¿à²¸à²²à²¾à²—à²¿à²¦à³†!',
    officials_title: 'à²…à²§à²¿à²•à²¾à²°à²¿à²—à²³ à²¡à³ˆà²°à³†à²•à³�à²Ÿà²°à²¿', call: 'à²•à²°à³† à²®à²¾à²¡à²¿', email: 'à²‡à²®à³‡à²²à³�',
    select_language: 'à²¨à²¿à²®à³�à²® à²­à²¾à²·à³†à²¯à²¨à³�à²¨à³� à²†à²¯à³�à²•à³†à²®à²¾à²¡à²¿', i_am_a: 'à²¨à²¾à²¨à³�...',
    citizen: 'à²¨à²¾à²—à²°à²¿à²•', worker: 'à²•à³†à²²à²¸à²—à²¾à²°', official: 'à²…à²§à²¿à²•à²¾à²°à²¿', volunteer: 'à²¸à³�à²µà²¯à²‚à²¸à³‡à²µà²•',
    your_location: 'à²¨à²¿à²®à³�à²® à²¸à³�à²¥à²³', your_name: 'à²¨à²¿à²®à³�à²® à²ªà³‚à²°à³�à²£ à²¹à³†à²¸à²°à³�',
    continue: 'à²®à³�à²‚à²¦à³�à²µà²°à²¿à²¸à²¿', back: 'à²¹à²¿à²‚à²¦à³†',
    phone_verify: 'à²¨à²¿à²®à³�à²® à²–à²¾à²¤à³†à²¯à²¨à³�à²¨à³� à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿',
    send_otp: 'OTP à²•à²³à³�à²¹à²¿à²¸à²¿', verify_otp: 'à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿',
    google_signin: 'Google à²¨à²¿à²‚à²¦ à²®à³�à²‚à²¦à³�à²µà²°à²¿à²¸à²¿',
    detecting: 'à²¸à³�à²¥à²³ à²ªà²¤à³�à²¤à³† à²¹à²šà³�à²šà²²à²¾à²—à³�à²¤à³�à²¤à²¿à²¦à³†...',
    location_denied: 'à²¸à³�à²¥à²³ à²ªà³�à²°à²µà³‡à²¶ à²¨à²¿à²°à²¾à²•à²°à²¿à²¸à²²à²¾à²—à²¿à²¦à³†',
    try_again: 'à²®à²¤à³�à²¤à³Šà²®à³�à²®à³† à²ªà³�à²°à²¯à²¤à³�à²¨à²¿à²¸à²¿', enter_manual: 'à²¹à²¸à³�à²¤à²šà²¾à²²à²¿à²¤à²µà²¾à²—à²¿ à²¨à²®à³‚à²¦à²¿à²¸à²¿',
    state: 'à²°à²¾à²œà³�à²¯', district: 'à²œà²¿à²²à³�à²²à³†', village_area: 'à²—à³�à²°à²¾à²® / à²ªà²Ÿà³�à²Ÿà²£',
    farmers_title: 'à²°à³ˆà²¤à²° à²®à²‚à²¡à²¿ à²®à²¤à³�à²¤à³� à²•à³ƒà²·à²¿ à²¡à³�à²¯à²¾à²¶à³�â€Œà²¬à³‹à²°à³�à²¡à³�',
    mandi_prices: 'à²¸à³�à²¥à²³à³€à²¯ à²®à²‚à²¡à²¿ à²¬à³†à²³à³† à²¬à³†à²²à³†à²—à²³à³�',
    crop_search: 'à²¬à³†à²³à³† à²¹à³�à²¡à³�à²•à²¿ (à²­à²¤à³�à²¤, à²—à³‹à²§à²¿, à²Ÿà³Šà²®à³†à²Ÿà³Š...)...',
    fertilization_help: 'à²—à³Šà²¬à³�à²¬à²° à²®à²¤à³�à²¤à³� à²¬à³†à²³à³† à²°à²•à³�à²·à²£à³† à²¸à²²à²¹à³†',
    ai_agri_advisor: 'AI à²•à³ƒà²·à²¿ à²¸à²²à²¹à³†à²—à²¾à²°',
    weather_advisory: 'à²¹à²µà²¾à²®à²¾à²¨ à²®à²¤à³�à²¤à³� à²¨à³€à²°à²¾à²µà²°à²¿ à²¸à²²à²¹à³†',
    today_price: 'à²‡à²‚à²¦à²¿à²¨ à²¬à³†à²²à³† (â‚¹/à²•à³�à²µà²¿à²‚à²Ÿà²¾à²²à³�)',
    yesterday_price: 'à²¨à²¿à²¨à³�à²¨à³†à²¯ à²¬à³†à²²à³†',
    price_trend: 'à²¬à³†à²²à³† à²ªà³�à²°à²µà³ƒà²¤à³�à²¤à²¿',
    ask_fertilizer: 'à²­à²¤à³�à²¤à²¦ à²¬à³†à²³à³†à²—à³† à²…à²¤à³�à²¯à³�à²¤à³�à²¤à²® à²°à²¸à²—à³Šà²¬à³�à²¬à²° à²¯à²¾à²µà³�à²¦à³�?',
    pest_control: 'à²Ÿà³Šà²®à³†à²Ÿà³Š à²—à²¿à²¡à²—à²³ à²¹à²³à²¦à²¿ à²Žà²²à³† à²¤à²¡à³†à²¯à³�à²µà³�à²¦à³� à²¹à³‡à²—à³†?',
    govt_subsidy: 'à²¹à²¨à²¿ à²¨à³€à²°à²¾à²µà²°à²¿à²—à³† à²¸à²°à³�à²•à²¾à²°à²¿ à²¸à²¬à³�à²¸à²¿à²¡à²¿ à²¯à³‹à²œà²¨à³†à²—à²³à³�',
  },¸ à¤ªà¤¾à¤¨à¥€ à¤“à¤µà¤°à¤«à¥�à¤²à¥‹ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ',
    suggested_2: 'à¤¬à¤¿à¤œà¤²à¥€ à¤•à¥€ à¤¸à¤®à¤¸à¥�à¤¯à¤¾ à¤•à¥Œà¤¨ à¤¸à¤‚à¤­à¤¾à¤²à¤¤à¤¾ à¤¹à¥ˆ?',
    suggested_3: '3 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤¸à¥‡ à¤•à¥‚à¤¡à¤¼à¤¾ à¤¨à¤¹à¥€à¤‚ à¤‰à¤ à¤¾à¤¯à¤¾ à¤—à¤¯à¤¾',
    suggested_4: 'à¤—à¤¡à¥�à¤¢à¥‡ à¤•à¥€ à¤°à¤¿à¤ªà¥‹à¤°à¥�à¤Ÿ à¤•à¥ˆà¤¸à¥‡ à¤•à¤°à¥‡à¤‚?',
    profile_title: 'à¤ªà¥�à¤°à¥‹à¤«à¤¾à¤‡à¤²', dark_mode: 'à¤¡à¤¾à¤°à¥�à¤• à¤®à¥‹à¤¡', light_mode: 'à¤²à¤¾à¤‡à¤Ÿ à¤®à¥‹à¤¡',
    language: 'à¤­à¤¾à¤·à¤¾', logout: 'à¤²à¥‰à¤— à¤†à¤‰à¤Ÿ', save: 'à¤¸à¥‡à¤µ à¤•à¤°à¥‡à¤‚', saved: 'à¤¸à¥‡à¤µ à¤¹à¥‹ à¤—à¤¯à¤¾!',
    officials_title: 'à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¨à¤¿à¤°à¥�à¤¦à¥‡à¤¶à¤¿à¤•à¤¾', call: 'à¤•à¥‰à¤² à¤•à¤°à¥‡à¤‚', email: 'à¤ˆà¤®à¥‡à¤²',
    select_language: 'à¤…à¤ªà¤¨à¥€ à¤­à¤¾à¤·à¤¾ à¤šà¥�à¤¨à¥‡à¤‚', i_am_a: 'à¤®à¥ˆà¤‚ à¤¹à¥‚à¤�...',
    citizen: 'à¤¨à¤¾à¤—à¤°à¤¿à¤•', worker: 'à¤•à¤¾à¤®à¤—à¤¾à¤°', official: 'à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€', volunteer: 'à¤¸à¥�à¤µà¤¯à¤‚à¤¸à¥‡à¤µà¤•',
    your_location: 'à¤†à¤ªà¤•à¤¾ à¤¸à¥�à¤¥à¤¾à¤¨', your_name: 'à¤†à¤ªà¤•à¤¾ à¤ªà¥‚à¤°à¤¾ à¤¨à¤¾à¤®',
    continue: 'à¤œà¤¾à¤°à¥€ à¤°à¤–à¥‡à¤‚', back: 'à¤µà¤¾à¤ªà¤¸',
    phone_verify: 'à¤…à¤ªà¤¨à¤¾ à¤–à¤¾à¤¤à¤¾ à¤¸à¤¤à¥�à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤°à¥‡à¤‚',
    send_otp: 'OTP à¤­à¥‡à¤œà¥‡à¤‚', verify_otp: 'à¤¸à¤¤à¥�à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤°à¥‡à¤‚',
    google_signin: 'Google à¤¸à¥‡ à¤œà¤¾à¤°à¥€ à¤°à¤–à¥‡à¤‚',
    detecting: 'à¤¸à¥�à¤¥à¤¾à¤¨ à¤ªà¤¹à¤šà¤¾à¤¨à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ...',
    location_denied: 'à¤¸à¥�à¤¥à¤¾à¤¨ à¤ªà¤¹à¥�à¤‚à¤š à¤…à¤¸à¥�à¤µà¥€à¤•à¥ƒà¤¤',
    try_again: 'à¤ªà¥�à¤¨à¤ƒ à¤ªà¥�à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚', enter_manual: 'à¤®à¥ˆà¤¨à¥�à¤¯à¥�à¤…à¤² à¤¦à¤°à¥�à¤œ à¤•à¤°à¥‡à¤‚',
    state: 'à¤°à¤¾à¤œà¥�à¤¯', district: 'à¤œà¤¿à¤²à¤¾', village_area: 'à¤—à¤¾à¤‚à¤µ / à¤¶à¤¹à¤° / à¤•à¥�à¤·à¥‡à¤¤à¥�à¤°',
  },
  kn: {
    nav_home: 'à²®à²¨à³†', nav_map: 'à²¨à²•à³�à²·à³†', nav_community: 'à²¸à²®à³�à²¦à²¾à²¯',
    nav_ai: 'AI à²¸à²¹à²¾à²¯à²•', nav_profile: 'à²ªà³�à²°à³Šà²«à³ˆà²²à³�', nav_workers: 'à²•à³†à²²à²¸à²—à²¾à²°à²°à³�',
    nav_emergency: 'à²¤à³�à²°à³�à²¤à³�', nav_officials: 'à²…à²§à²¿à²•à²¾à²°à²¿à²—à²³à³�',
    greeting_morning: 'à²¶à³�à²­à³‹à²¦à²¯', greeting_afternoon: 'à²¨à²®à²¸à³�à²•à²¾à²°',
    greeting_evening: 'à²¶à³�à²­ à²¸à²‚à²œà³†', greeting_night: 'à²¶à³�à²­ à²°à²¾à²¤à³�à²°à²¿',
    report_issue: 'à²¸à²®à²¸à³�à²¯à³† à²µà²°à²¦à²¿ à²®à²¾à²¡à²¿', upload_photo: 'à²«à³‹à²Ÿà³‹ à²…à²ªà³�à²²à³‹à²¡à³�',
    analyze_ai: 'AI à²¨à²¿à²‚à²¦ à²µà²¿à²¶à³�à²²à³‡à²·à²¿à²¸à²¿', submit_issue: 'à²¸à²²à³�à²²à²¿à²¸à²¿',
    send: 'à²•à²³à³�à²¹à²¿à²¸à²¿', cancel: 'à²°à²¦à³�à²¦à³�à²®à²¾à²¡à²¿', hire: 'à²¨à³‡à²®à²•',
    fire: 'à²¬à³†à²‚à²•à²¿', flood: 'à²ªà³�à²°à²µà²¾à²¹', call: 'à²•à²°à³†', save: 'à²‰à²³à²¿à²¸à²¿',
    continue: 'à²®à³�à²‚à²¦à³�à´µà²°à²¿à²¸à²¿', back: 'à²¹à²¿à²‚à²¦à³†', logout: 'à²²à²¾à²—à³� à²”à²Ÿà³�',
    citizen: 'à²¨à²¾à²—à²°à²¿à²•', worker: 'à²•à³†à²²à²¸à²—à²¾à²°', official: 'à²…à²§à²¿à²•à²¾à²°à²¿', volunteer: 'à²¸à³�à²µà²¯à²‚à²¸à±‡à°µà²•',
  },
  ta: {
    nav_home: 'à®®à¯�à®•à®ªà¯�à®ªà¯�', nav_map: 'à®µà®°à¯ˆà®ªà®Ÿà®®à¯�', nav_community: 'à®šà®®à¯‚à®•à®®à¯�',
    nav_ai: 'AI à®‰à®¤à®µà®¿à®¯à®¾à®³à®°à¯�', nav_profile: 'à®šà¯�à®¯à®µà®¿à®µà®°à®®à¯�',
    greeting_morning: 'à®•à®¾à®²à¯ˆ à®µà®£à®•à¯�à®•à®®à¯�', greeting_afternoon: 'à®®à®¤à®¿à®¯ à®µà®£à®•à¯�à®•à®®à¯�',
    report_issue: 'à®šà®¿à®•à¯�à®•à®²à¯� à®ªà¯�à®•à®¾à®°à¯�', send: 'à®…à®©à¯�à®ªà¯�à®ªà¯�', cancel: 'à®°à®¤à¯�à®¤à¯�',
    fire: 'à®¤à¯€', flood: 'à®µà¯†à®³à¯�à®³à®®à¯�', call: 'à®…à®´à¯ˆà®ªà¯�à®ªà¯�', save: 'à®šà¯‡à®®à®¿',
    continue: 'à®¤à¯Šà®Ÿà®°à¯�', back: 'à®ªà®¿à®©à¯�', logout: 'à®µà¯†à®³à®¿à®¯à¯‡à®±à¯�',
    citizen: 'à®•à¯�à®Ÿà®¿à®®à®•à®©à¯�', worker: 'à®¤à¯Šà®´à®¿à®²à®¾à®³à®¿',
  },
  te: {
    nav_home: 'à°¹à±‹à°®à±�', nav_map: 'à°®à±�à°¯à°¾à°ªà±�', nav_community: 'à°¸à°®à°¾à°œà°‚',
    greeting_morning: 'à°¶à±�à°­à±‹à°¦à°¯à°‚', greeting_afternoon: 'à°¨à°®à°¸à±�à°•à°¾à°°à°‚',
    report_issue: 'à°¸à°®à°¸à±�à°¯ à°¨à°¿à°µà±‡à°¦à°¿à°‚à°šà±�', send: 'à°ªà°‚à°ªà±�', cancel: 'à°°à°¦à±�à°¦à±�',
    fire: 'à°…à°—à±�à°¨à°¿', flood: 'à°µà°°à°¦', call: 'à°•à°¾à°²à±�', save: 'à°¸à±‡à°µà±�',
    continue: 'à°•à±Šà°¨à°¸à°¾à°—à°¿à°‚à°šà±�', logout: 'à°²à°¾à°—à±� à°…à°µà±�à°Ÿà±�',
    citizen: 'à°ªà±Œà°°à±�à°¡à±�', worker: 'à°•à°¾à°°à±�à°®à°¿à°•à±�à°¡à±�',
  },
  ml: {
    nav_home: 'à´¹àµ‹à´‚', nav_map: 'à´®à´¾à´ªàµ�à´ªàµ�', nav_community: 'à´•à´®àµ�à´®àµ�à´¯àµ‚à´£à´¿à´±àµ�à´±à´¿',
    greeting_morning: 'à´¸àµ�à´ªàµ�à´°à´­à´¾à´¤à´‚', greeting_afternoon: 'à´¨à´®à´¸àµ�à´•à´¾à´°à´‚',
    report_issue: 'à´ªàµ�à´°à´¶àµ�à´¨à´‚ à´±à´¿à´ªàµ�à´ªàµ‹àµ¼à´Ÿàµ�à´Ÿàµ�', send: 'à´…à´¯à´¯àµ�à´•àµ�à´•àµ�à´•',
    fire: 'à´¤àµ€', flood: 'à´µàµ†à´³àµ�à´³à´ªàµ�à´ªàµŠà´•àµ�à´•à´‚', call: 'à´•àµ‹àµ¾', save: 'à´¸àµ‡à´µàµ�',
    continue: 'à´¤àµ�à´Ÿà´°àµ�à´•', logout: 'à´²àµ‹à´—àµ� à´”à´Ÿàµ�à´Ÿàµ�',
    citizen: 'à´ªàµ—à´°àµ»', worker: 'à´¤Ð¾Ñ‚àµŠà´´à´¿à´²à´¾à´³à´¿',
  },
  bn: {
    nav_home: 'à¦¹à§‹à¦®', nav_map: 'à¦®à¦¾à¦¨à¦šà¦¿à¦¤à§�à¦°', nav_community: 'à¦¸à¦®à§�à¦ªà§�à¦°à¦¦à¦¾à¦¯à¦¼',
    greeting_morning: 'à¤¶à¥�à¤­ à¤¸à¤•à¤¾à¤³', greeting_afternoon: 'à¦¶à§�à¦­ à¦¦à§�à¦ªà§�à¦°',
    report_issue: 'à¦¸à¦®à¦¸à§�à¦¯à¦¾ à¦°à¦¿à¦ªà§‹à¦°à§�à¦Ÿ', send: 'à¦ªà¦¾à¦ à¦¾à¦¨', cancel: 'à¦¬à¦¾à¦¤à¦¿à¦²',
    fire: 'à¦†à¦—à§�à¦¨', flood: 'à¦¬à¦¨à§�à¦¯à¦¾', call: 'à¦•à¦²', save: 'à¦¸à¦‚à¦°à¤•à¥�à¤·à¤£',
    continue: 'à¦šà¦¾à¦²à¦¿à¦¯à¦¼à§‡ à¦¯à¦¾à¦¨', logout: 'à¦²à¦— à¦†à¦‰à¦Ÿ',
    citizen: 'à¦¨à¦¾à¦—à¦°à¦¿à¦•', worker: 'à¦¶à§�à¦°à¦®à¦¿à¦•',
  },
  mr: {
    nav_home: 'à¤¹à¥‹à¤®', nav_map: 'à¤¨à¤•à¤¾à¤¶à¤¾', nav_community: 'à¤¸à¤®à¥�à¤¦à¤¾à¤¯',
    greeting_morning: 'à¤¶à¥�à¤­ à¤ªà¥�à¤°à¤­à¤¾à¤¤', greeting_afternoon: 'à¤¨à¤®à¤¸à¥�à¤•à¤¾à¤°',
    report_issue: 'à¤¸à¤®à¤¸à¥�à¤¯à¤¾ à¤¨à¥‹à¤‚à¤¦à¤µà¤¾', send: 'à¤ªà¤¾à¤ à¤µà¤¾', cancel: 'à¤°à¤¦à¥�à¤¦ à¤•à¤°à¤¾',
    fire: 'à¤†à¤—', flood: 'à¤ªà¥‚à¤°', call: 'à¤•à¥‰à¤²', save: 'à¤œà¤¤à¤¨ à¤•à¤°à¤¾',
    continue: 'à¤ªà¥�à¤¢à¥‡ à¤šà¤²à¤¾', logout: 'à¤¬à¤¾à¤¹à¥‡à¤° à¤ªà¤¡à¤¾',
    citizen: 'à¤¨à¤¾à¤—à¤°à¤¿à¤•', worker: 'à¤•à¤¾à¤®à¤—à¤¾à¤°',
  },
  gu: {
    nav_home: 'àª¹à«‹àª®', nav_map: 'àª¨àª•àª¶à«‹', nav_community: 'àª¸àª®à«�àª¦àª¾àª¯',
    greeting_morning: 'àª¸à«�àªªà«�àª°àª­àª¾àª¤', greeting_afternoon: 'àª¨àª®àª¸à«�àª¤à«‡',
    report_issue: 'àª¸àª®àª¸à«�àª¯àª¾ àª¨à«‹àª‚àª§à«‹', send: 'àª®à«‹àª•àª²à«‹', cancel: 'àª°àª¦ àª•àª°à«‹',
    fire: 'àª†àª—', flood: 'àªªà«‚àª°', call: 'àª•à«‰àª²', save: 'àª¸à«‡àªµ àª•àª°à«‹',
    continue: 'àª†àª—àª³ àªµàª§à«‹', logout: 'àª²à«‰àª— àª†àª‰àªŸ',
    citizen: 'àª¨àª¾àª—àª°àª¿àª•', worker: 'àª•àª¾àª®àª¦àª¾àª°',
  },
  pa: {
    nav_home: 'à¨¹à©‹à¨®', nav_map: 'à¨¨à¨•à¨¸à¨¼à¨¾', nav_community: 'à¨­à¨¾à¨ˆà¨šà¨¾à¨°à¨¾',
    greeting_morning: 'à¨¸à¨¤ à¨¸à©�à¨°à©€ à¨…à¨•à¨¾à¨²', greeting_afternoon: 'à¨¨à¨®à¨¸à¨•à¨¾à¨°',
    report_issue: 'à¨¸à¨®à©±à¨¸à¨¿à¨† à¨°à¨¿à¨ªà©‹à¨°à¨Ÿ', send: 'à¨­à©‡à¨œà©‹', cancel: 'à¨°à©±à¨¦ à¨•à¨°à©‹',
    fire: 'à¨…à©±à¨—', flood: 'à¨¹à©œà©�à¨¹', call: 'à¨•à¨¾à¨²', save: 'à¨¸à©‡àªµ à¨•à¨°à©‹',
    continue: 'à¨œà¨¾à¨°à©€ à¨°à©±à¨–à©‹', logout: 'à¨²à©Œà¨— à¨†à¨Šà¨Ÿ',
    citizen: 'à¨¨à¨¾à¨—à¨°à¨¿à¨•', worker: 'à¨•à¨¾à¨®à¨¾',
  }
}

// Add English as fallback for all missing keys
Object.keys(translations).forEach(lang => {
  if (lang !== 'en') {
    translations[lang] = { ...translations.en, ...translations[lang] }
  }
})

const resources = {}
Object.keys(translations).forEach(lang => {
  resources[lang] = { translation: translations[lang] }
})

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('vanguard_language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
})

export default i18n
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang)
  localStorage.setItem('vanguard_language', lang)
}
