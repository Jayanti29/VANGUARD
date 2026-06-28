import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import useAuth from '../hooks/useAuth';
import useLocation from '../hooks/useLocation';
import { 
  Languages, 
  UserCheck, 
  MapPin, 
  PhoneCall, 
  Check, 
  Map, 
  Navigation,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const indianStates = {
  'Karnataka': ['Ramanagara', 'Bangalore Rural', 'Bangalore Urban', 'Mysuru', 'Mandya', 'Tumakuru'],
  'Maharashtra': ['Mumbai City', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur Nagar', 'Noida', 'Prayagraj'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Kanchipuram'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'North 24 Parganas'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
  'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi']
};

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLang, changeLanguage, languagesList } = useLanguage();
  const { loginWithPhone, confirmOTP, syncUserWithFirestore, user } = useAuth();
  const { location, setLocation, detectLocation, loading: locLoading } = useLocation();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  
  // Location manual entry form
  const [manualLocation, setManualLocation] = useState(false);
  const [locForm, setLocForm] = useState({
    state: 'Karnataka',
    district: 'Ramanagara',
    village: '',
    ward: '',
    houseNo: ''
  });

  // Phone Auth form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationSent, setVerificationSent] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Recaptcha verifier ref
  const [recaptchaCreated, setRecaptchaCreated] = useState(false);

  useEffect(() => {
    // If user is already authenticated and has a complete profile, redirect to home
    const cachedDbUser = localStorage.getItem('vanguard_session_dbuser');
    if (cachedDbUser) {
      const dbUser = JSON.parse(cachedDbUser);
      if (dbUser.village) {
        navigate('/');
      }
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle manual form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setLocForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'state') {
        updated.district = indianStates[value][0] || '';
      }
      return updated;
    });
  };

  // GPS auto-fill handler
  const handleGPSDetect = async () => {
    try {
      const detected = await detectLocation();
      setLocForm({
        state: detected.state || 'Karnataka',
        district: detected.district || 'Ramanagara',
        village: detected.village || 'Ramanagara Town',
        ward: detected.ward || 'Ward 6',
        houseNo: ''
      });
      setManualLocation(false);
    } catch (err) {
      console.error(err);
      setManualLocation(true);
    }
  };

  // Phone auth trigger
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      // In a real application we would initialize a RecaptchaVerifier
      // const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const mockVerifier = {}; 
      await loginWithPhone(phone, mockVerifier);
      setVerificationSent(true);
      setTimer(60);
    } catch (err) {
      setAuthError(err.message || 'Verification failed. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // OTP box input handling
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP & Save all details to Firestore
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setAuthError('Please enter the full 6-digit code');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      const firebaseUser = await confirmOTP(otpCode);
      
      // Save all local onboarding configurations into Firestore
      const userProfile = {
        role: selectedRole,
        language: currentLang,
        state: locForm.state,
        district: locForm.district,
        village: locForm.village || 'Ramanagara Rural',
        ward: locForm.ward || 'Ward 6',
        houseNo: locForm.houseNo || '',
        lat: location.lat,
        lng: location.lng
      };
      
      await syncUserWithFirestore(firebaseUser, userProfile);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'OTP verification failed. Use "123456" for testing.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Roles available
  const roles = [
    { id: 'Citizen', icon: '👤', label: 'Citizen', desc: 'Report issues and keep your village safe.' },
    { id: 'Worker', icon: '👷', label: 'Worker', desc: 'Offer your daily-wage services to locals.' },
    { id: 'Official', icon: '🏛', label: 'Official', desc: 'Review, manage and resolve civic safety issues.' },
    { id: 'Volunteer', icon: '🤝', label: 'Volunteer', desc: 'Lend assistance in community emergencies.' }
  ];

  // Helper page wrapper
  const containerVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Top Header / Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent text-white flex items-center justify-center rounded-2xl shadow-lg animate-pulse-ring">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary dark:text-white m-0 p-0 leading-none">VANGUARD</h1>
          <p className="text-sm font-medium text-text-muted mt-1 m-0">AI Community Protection</p>
        </div>
      </div>

      <div className="w-full max-w-lg bg-surface dark:bg-slate-800 rounded-3xl shadow-xl border border-border dark:border-slate-700 p-6 md:p-8 relative overflow-hidden">
        {/* Step Indicator Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-full bg-accent transition-all duration-300 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-text-muted mb-6 mt-2 font-bold tracking-wider uppercase">
          <span>Step {step} of 4</span>
          <span>
            {step === 1 && 'Language'}
            {step === 2 && 'Role Selection'}
            {step === 3 && 'Location Settings'}
            {step === 4 && 'Verification'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: LANGUAGE SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text dark:text-white">Choose Your Language</h2>
                <p className="text-text-muted mt-1">अपनी भाषा चुनें / ಕನ್ನಡವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ</p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 min-h-[56px] ${
                      currentLang === lang.code
                        ? 'border-accent bg-accent-soft text-accent dark:bg-slate-700/60 dark:text-blue-400 font-bold shadow-sm'
                        : 'border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-text dark:text-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold leading-tight">{lang.nativeName}</span>
                      <span className="text-xs text-text-muted">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text dark:text-white">Select Your Role</h2>
                <p className="text-text-muted mt-1">This helps us tailor your community experience.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-200 ${
                      selectedRole === role.id
                        ? 'border-accent bg-accent-soft dark:bg-slate-700/60 dark:border-blue-400 shadow-sm'
                        : 'border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <span className="text-4xl mb-3">{role.icon}</span>
                    <span className="font-bold text-lg text-text dark:text-white">{role.label}</span>
                    <span className="text-xs text-text-muted mt-1 leading-normal">{role.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 btn-secondary"
                >
                  Back
                </button>
                <button
                  disabled={!selectedRole}
                  onClick={() => setStep(3)}
                  className={`w-2/3 btn-primary flex items-center justify-center gap-2 ${
                    !selectedRole ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOCATION SETTINGS */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text dark:text-white">Set Your Location</h2>
                <p className="text-text-muted mt-1">We need this to connect you with nearby issues and services.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleGPSDetect}
                    className="flex-1 min-h-[56px] rounded-xl bg-accent text-white flex items-center justify-center gap-2 font-bold cursor-pointer hover:bg-opacity-90 shadow-sm transition"
                  >
                    {locLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                    Detect My Location
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualLocation(prev => !prev)}
                    className="flex-1 min-h-[56px] border border-accent rounded-xl text-accent dark:text-blue-400 flex items-center justify-center gap-2 font-bold hover:bg-accent-soft transition cursor-pointer"
                  >
                    <Map className="w-5 h-5" />
                    {manualLocation ? 'Hide Form' : 'Enter Manually'}
                  </button>
                </div>

                {/* Detected Location Card */}
                {!manualLocation && (
                  <div className="bg-slate-50 dark:bg-slate-700/40 border border-border dark:border-slate-700 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-accent font-bold text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Detected Settings:</span>
                    </div>
                    <p className="text-sm font-semibold text-text dark:text-slate-200">
                      {location.address || 'Detecting address...'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-muted font-medium">
                      <div>Village: {locForm.village || 'Inferred'}</div>
                      <div>Ward: {locForm.ward || 'Inferred'}</div>
                      <div>District: {locForm.district}</div>
                      <div>State: {locForm.state}</div>
                    </div>
                  </div>
                )}

                {/* Manual Address Form */}
                {manualLocation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-border dark:border-slate-700"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-1 uppercase">State</label>
                        <select
                          name="state"
                          value={locForm.state}
                          onChange={handleFormChange}
                          className="w-full min-h-[48px] bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-3 text-sm text-text dark:text-white"
                        >
                          {Object.keys(indianStates).map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-1 uppercase">District</label>
                        <select
                          name="district"
                          value={locForm.district}
                          onChange={handleFormChange}
                          className="w-full min-h-[48px] bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-3 text-sm text-text dark:text-white"
                        >
                          {(indianStates[locForm.state] || []).map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Village / Town</label>
                        <input
                          type="text"
                          name="village"
                          required
                          value={locForm.village}
                          onChange={handleFormChange}
                          placeholder="e.g. Ramanagara"
                          className="w-full min-h-[48px] bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-3 text-sm text-text dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Ward (Optional)</label>
                        <input
                          type="text"
                          name="ward"
                          value={locForm.ward}
                          onChange={handleFormChange}
                          placeholder="e.g. Ward 6"
                          className="w-full min-h-[48px] bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-3 text-sm text-text dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">House / Flat No (Optional)</label>
                      <input
                        type="text"
                        name="houseNo"
                        value={locForm.houseNo}
                        onChange={handleFormChange}
                        placeholder="e.g. 104, Block B"
                        className="w-full min-h-[48px] bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-3 text-sm text-text dark:text-white"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Google Maps Preview simulated */}
                <div className="h-[120px] bg-slate-200 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center text-text-muted text-xs border border-border dark:border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-50/10 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  </div>
                  <MapPin className="w-8 h-8 text-accent animate-bounce mb-1" />
                  <span className="font-semibold text-text dark:text-slate-300">Map Area Selected</span>
                  <span className="text-[10px] text-text-muted mt-0.5">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 btn-secondary"
                >
                  Back
                </button>
                <button
                  disabled={!locForm.village && manualLocation}
                  onClick={() => setStep(4)}
                  className={`w-2/3 btn-primary flex items-center justify-center gap-2 ${
                    !locForm.village && manualLocation ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PHONE VERIFICATION */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text dark:text-white">Phone Verification</h2>
                <p className="text-text-muted mt-1">Verify your identity to post emergencies and chat.</p>
              </div>

              {authError && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900">
                  {authError}
                </div>
              )}

              {!verificationSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text font-bold text-lg dark:text-slate-300">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength="10"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit number"
                        className="w-full min-h-[56px] pl-16 pr-4 bg-surface dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-xl text-lg font-bold text-text dark:text-white focus:border-accent outline-none"
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container" className="my-2"></div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-1/3 btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={phone.length < 10 || authLoading}
                      className="w-2/3 btn-primary flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Send OTP <PhoneCall className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-text-muted">
                      Verification code sent to <strong className="text-text dark:text-white">+91 {phone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setVerificationSent(false)}
                      className="text-xs text-accent dark:text-blue-400 font-bold hover:underline"
                    >
                      Change Phone Number
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-muted text-center uppercase">Enter 6-Digit OTP</label>
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength="1"
                          required
                          value={digit}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          onChange={(e) => handleOtpChange(e, idx)}
                          className="w-12 h-14 text-center text-2xl font-bold bg-surface dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-xl focus:border-accent outline-none text-text dark:text-white"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-text-muted mt-2">
                      Use code <strong className="text-accent dark:text-blue-400">123456</strong> for simulated verification
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      disabled={timer > 0 || authLoading}
                      onClick={handleSendOTP}
                      className={`w-1/3 btn-secondary px-2 text-sm ${
                        timer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {timer > 0 ? `Resend (${timer}s)` : 'Resend OTP'}
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-2/3 btn-primary flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Verify & Register <Check className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
