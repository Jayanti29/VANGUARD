import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Languages, 
  UserCheck, 
  MapPin, 
  PhoneCall, 
  Check, 
  Navigation,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import toast from 'react-hot-toast';

const indianStates = {
  'Karnataka': ['Bangalore', 'Ramanagara', 'Mysuru', 'Mandya', 'Tumakuru'],
  'Maharashtra': ['Mumbai City', 'Pune', 'Nagpur', 'Thane'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur Nagar', 'Noida'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling']
};

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('vanguard_language') || 'en');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Location
  const [coords, setCoords] = useState([12.9716, 77.5946]);
  const [locForm, setLocForm] = useState({
    state: 'Karnataka',
    district: 'Bangalore',
    village: '',
    ward: '',
    houseNo: ''
  });
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  // Phone Authentication states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Sync active translation language
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('vanguard_language', selectedLanguage);
  }, [selectedLanguage]);

  const languagesList = [
    { code: 'en', label: '🇬🇧 English (English)' },
    { code: 'hi', label: '🇮🇳 हिन्दी (Hindi)' },
    { code: 'kn', label: '🇮🇳 ಕನ್ನಡ (Kannada)' },
    { code: 'ta', label: '🇮🇳 தமிழ் (Tamil)' },
    { code: 'te', label: '🇮🇳 తెలుగు (Telugu)' },
    { code: 'ml', label: '🇮🇳 മലയാളം (Malayalam)' },
    { code: 'bn', label: '🇮🇳 বাংলা (Bengali)' },
    { code: 'mr', label: '🇮🇳 मराठी (Marathi)' },
    { code: 'gu', label: '🇮🇳 ગુજરાતી (Gujarati)' },
    { code: 'pa', label: '🇮🇳 ਪੰਜਾਬੀ (Punjabi)' }
  ];

  const roles = [
    { id: 'Citizen', icon: '👤', label: 'Citizen', desc: 'Report civic issues & track local safety alerts.' },
    { id: 'Worker', icon: '👷', label: 'Worker', desc: 'Find daily jobs & list your utility skills.' },
    { id: 'Official', icon: '🏛', label: 'Official', desc: 'Review community logs & manage resolutions.' },
    { id: 'Volunteer', icon: '🤝', label: 'Volunteer', desc: 'Assist community safety & coordinate worker jobs.' }
  ];

  // Geolocation detection
  const handleDetectLocation = () => {
    setIsDetectingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(r => r.json())
            .then(data => {
              const addressParts = data.address || {};
              const state = addressParts.state || 'Karnataka';
              const district = addressParts.city_district || addressParts.district || addressParts.county || 'Bangalore';
              const village = addressParts.village || addressParts.suburb || addressParts.town || 'Rajajinagar';
              const ward = addressParts.postcode || '6';

              setLocForm({
                state,
                district,
                village,
                ward,
                houseNo: ''
              });
              setIsDetectingLoc(false);
              toast.success("Location auto-detected successfully!");
            })
            .catch(err => {
              console.error(err);
              setIsDetectingLoc(false);
            });
        },
        (error) => {
          console.warn(error);
          setIsDetectingLoc(false);
          toast.error("Geolocation failed, please enter address manually.");
        }
      );
    } else {
      setIsDetectingLoc(false);
      toast.error("Browser doesn't support geolocation.");
    }
  };

  const handleStateChange = (stateName) => {
    const districts = indianStates[stateName] || [];
    setLocForm({
      ...locForm,
      state: stateName,
      district: districts[0] || ''
    });
  };

  // Setup reCAPTCHA Verifier
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  // Send Verification SMS
  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    const phoneToast = toast.loading("Sending Verification Code...");
    try {
      setupRecaptcha();
      const verifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, '+91' + phone, verifier);
      window.confirmationResult = result;
      toast.dismiss(phoneToast);
      toast.success("OTP sent to +91 " + phone);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.dismiss(phoneToast);
      toast.error("Failed to send OTP. Check console for details.");
    }
  };

  // Verify OTP & Save Firestore Profile
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }
    setIsVerifying(true);
    const verifyToast = toast.loading("Verifying code...");
    try {
      const result = await window.confirmationResult.confirm(otp);
      const userObj = result.user;

      // Save user profile details
      const userProfile = {
        uid: userObj.uid,
        name: dbUserTempName(selectedRole) || 'Vanguard Member',
        phone: '+91' + phone,
        language: selectedLanguage,
        role: selectedRole,
        state: locForm.state,
        district: locForm.district,
        village: locForm.village || 'Rajajinagar',
        ward: locForm.ward || '6',
        houseNo: locForm.houseNo || 'N/A',
        lat: coords[0],
        lng: coords[1],
        profileImageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userObj.uid}`,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userObj.uid), userProfile);
      
      // Seed official worker database link if needed
      if (selectedRole === 'Worker') {
        await setDoc(doc(db, 'workers', userObj.uid), {
          userId: userObj.uid,
          name: userProfile.name,
          skills: ['general'],
          experienceYears: 1,
          dailyRate: 400,
          bio: 'Self-registered daily worker ready to help.',
          rating: 5.0,
          reviewCount: 1,
          isAvailable: true,
          village: userProfile.village,
          ward: userProfile.ward,
          district: userProfile.district,
          lat: coords[0],
          lng: coords[1]
        });
      }

      toast.dismiss(verifyToast);
      toast.success("Account successfully created!");
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.dismiss(verifyToast);
      toast.error("Invalid verification code. Please check and try again.");
      setIsVerifying(false);
    }
  };

  const dbUserTempName = (role) => {
    return `${role} User`;
  };

  return (
    <div className="max-w-md mx-auto bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Invisible reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-primary dark:text-white flex items-center justify-center gap-1.5 uppercase">
          🛡️ VANGUARD
        </h1>
        <p className="text-xs text-text-muted">AI-Powered Civic Safety & Protection Platform</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <Languages className="w-5 h-5 text-accent" /> Choose App Language
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {languagesList.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`py-3 px-4 rounded-2xl text-xs font-bold border transition text-left cursor-pointer ${
                  selectedLanguage === lang.code
                    ? 'bg-accent border-accent text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-border dark:border-slate-750 text-text dark:text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full h-12 bg-accent text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-opacity-95 shadow-sm mt-4"
          >
            Continue Onboarding <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-accent" /> Select Your Civic Role
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                  selectedRole === role.id
                    ? 'bg-accent-soft border-accent dark:bg-slate-900/60 dark:border-accent'
                    : 'bg-slate-50 dark:bg-slate-900 border-border dark:border-slate-750 hover:bg-slate-100'
                }`}
              >
                <span className="text-3xl mt-0.5">{role.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-text dark:text-white">{role.label}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{role.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-12 bg-slate-100 dark:bg-slate-750 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Back
            </button>
            <button
              disabled={!selectedRole}
              onClick={() => setStep(3)}
              className="flex-1 h-12 bg-accent disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-accent" /> Set Location Details
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLoc}
              className="w-full h-12 bg-accent-soft hover:bg-opacity-80 text-accent font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDetectingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              📍 Use My Live GPS Location
            </button>

            <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">State</label>
                <select
                  value={locForm.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
                >
                  {Object.keys(indianStates).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">District</label>
                <select
                  value={locForm.district}
                  onChange={(e) => setLocForm({ ...locForm, district: e.target.value })}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
                >
                  {(indianStates[locForm.state] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">Village / Ward Name</label>
              <input
                type="text"
                value={locForm.village}
                onChange={(e) => setLocForm({ ...locForm, village: e.target.value })}
                placeholder="e.g. Rajajinagar"
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">Ward No (Optional)</label>
                <input
                  type="text"
                  value={locForm.ward}
                  onChange={(e) => setLocForm({ ...locForm, ward: e.target.value })}
                  placeholder="e.g. 6"
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">House No (Optional)</label>
                <input
                  type="text"
                  value={locForm.houseNo}
                  onChange={(e) => setLocForm({ ...locForm, houseNo: e.target.value })}
                  placeholder="e.g. 32/B"
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 h-12 bg-slate-100 dark:bg-slate-750 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Back
            </button>
            <button
              disabled={!locForm.village}
              onClick={() => setStep(4)}
              className="flex-1 h-12 bg-accent disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <PhoneCall className="w-5 h-5 text-accent" /> Phone Verification
          </h2>

          <div className="space-y-4">
            {!otpSent ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase block">Mobile Phone Number</label>
                <div className="flex">
                  <span className="h-11 px-3 bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-700 border-r-0 rounded-l-xl flex items-center text-xs font-bold dark:text-white">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-r-xl text-xs focus:outline-none dark:text-white font-bold"
                  />
                </div>
                <button
                  onClick={handleSendOTP}
                  className="w-full h-12 bg-accent text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 mt-4"
                >
                  Send OTP Code <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[10px] font-bold text-text-muted uppercase block">6-Digit Verification Code</label>
                <div className="flex gap-2 justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-center text-sm focus:outline-none dark:text-white font-black tracking-widest"
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 mt-4 shadow-sm"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify & Finish Setup
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 mt-4">
            <button
              onClick={() => { setOtpSent(false); setOtp(''); }}
              className="flex-1 h-12 bg-slate-100 dark:bg-slate-750 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Modify Details
            </button>
          </div>
        </div>
      )}
      
      {/* Footer login switch link */}
      <div className="text-center pt-2">
        <button
          onClick={() => navigate('/login')}
          className="text-xs text-accent font-bold hover:underline cursor-pointer"
        >
          Already registered? Sign In Here
        </button>
      </div>
    </div>
  );
}
