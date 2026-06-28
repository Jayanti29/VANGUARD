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
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useLocation } from '../hooks/useLocation';

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
  const { currentUser, loading, loginAsGuest, loginWithGoogle, loginWithEmail } = useAuth();

  useEffect(() => {
    // If already logged in, skip onboarding
    if (!loading && currentUser) {
      navigate('/', { replace: true })
    }
  }, [currentUser, loading, navigate])

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

  const { location: detLoc, address: detAddress, loading: detLoading, error: detError, detectLocation } = useLocation();

  useEffect(() => {
    if (detAddress) {
      setLocForm(prev => ({
        ...prev,
        state: typeof detAddress === 'object' ? (detAddress.state || prev.state) : prev.state,
        district: typeof detAddress === 'object' ? (detAddress.district || prev.district) : prev.district,
        village: typeof detAddress === 'object' ? (detAddress.village || prev.village) : prev.village,
        ward: typeof detAddress === 'object' ? (detAddress.ward || prev.ward) : prev.ward
      }));
      if (detLoc) {
        setCoords([detLoc.lat, detLoc.lng]);
      }
      toast.success("Successfully geocoded GPS address!");
    }
  }, [detAddress, detLoc]);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('vanguard_language', selectedLanguage);
  }, [selectedLanguage]);

  // Helper name mapping based on role
  const dbUserTempName = (role) => {
    switch(role) {
      case 'Worker': return 'Hari Lal';
      case 'Official': return 'Officer Swamy';
      default: return 'Ramesh Kumar';
    }
  };

  // Email & Password Sign Up
  // Email & Password Sign Up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    const signupToast = toast.loading("Creating account...");
    try {
      const onboardingData = {
        name: dbUserTempName(selectedRole) || email.split('@')[0],
        language: selectedLanguage,
        role: selectedRole,
        village: locForm.village,
        ward: locForm.ward,
        district: locForm.district,
        state: locForm.state,
        lat: coords[0],
        lng: coords[1]
      };
      await loginWithEmail(email, password, onboardingData);
      toast.dismiss(signupToast);
      toast.success("Profile onboarding complete!");
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.dismiss(signupToast);
      toast.error(err.message || "Failed to create account.");
    }
  };

  // Google Provider Sign Up / Complete Registration
  const handleGoogleSignUp = async () => {
    setGoogleError('');
    const signupToast = toast.loading("Registering via Google...");
    try {
      const onboardingData = {
        language: selectedLanguage,
        role: selectedRole,
        village: locForm.village,
        ward: locForm.ward,
        district: locForm.district,
        state: locForm.state,
        lat: coords[0],
        lng: coords[1]
      };
      await loginWithGoogle(onboardingData);
      toast.dismiss(signupToast);
      toast.success("Profile onboarding complete!");
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.dismiss(signupToast);
      setGoogleError("Please use Guest login or Email signup for now");
    }
  };

  // Guest Onboarding completes setup instantly
  const handleGuestOnboard = async () => {
    const guestToast = toast.loading("Setting up Guest profile...");
    try {
      const onboardingData = {
        name: `Guest ${selectedRole || 'User'}`,
        language: selectedLanguage,
        role: selectedRole,
        village: locForm.village,
        ward: locForm.ward,
        district: locForm.district,
        state: locForm.state,
        lat: coords[0],
        lng: coords[1]
      };
      await loginAsGuest(onboardingData);
      toast.dismiss(guestToast);
      toast.success("Guest Onboarding successfully complete!");
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.dismiss(guestToast);
      toast.error("Guest onboarding failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div className="text-center space-y-1 border-b border-border dark:border-slate-700 pb-4">
        <h1 className="text-xl font-black tracking-wider text-primary dark:text-white uppercase flex items-center justify-center gap-1.5">
          🛡️ VANGUARD SETUP
        </h1>
        <div className="flex justify-center gap-1.5 pt-2">
          {[1, 2, 3, 4].map(idx => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-accent' : idx < step ? 'w-2 bg-green-500' : 'w-2 bg-slate-200 dark:bg-slate-750'
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <Languages className="w-5 h-5 text-accent" /> Choose App Language
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी (Hindi)' },
              { id: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
              { id: 'ta', label: 'தமிழ் (Tamil)' },
              { id: 'te', label: 'తెలుగు (Telugu)' },
              { id: 'ml', label: 'മലയാളം (Malayalam)' }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`h-14 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                  selectedLanguage === lang.id
                    ? 'bg-accent border-accent text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-border dark:border-slate-700 text-text hover:bg-slate-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full h-12 bg-accent hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 mt-4 cursor-pointer"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-accent" /> Select Your Role
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { id: 'Citizen', desc: 'Civic member reporting community issues and checking alerts' },
              { id: 'Worker', desc: 'Local helper (Plumber, Electrician) resolving civic problems' },
              { id: 'Official', desc: 'Ward level administrative and emergency officer' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between ${
                  selectedRole === role.id
                    ? 'bg-accent border-accent text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-border dark:border-slate-700 text-text hover:bg-slate-100'
                }`}
              >
                <div>
                  <h4 className="text-xs font-black uppercase">{role.id}</h4>
                  <p className={`text-[10px] mt-0.5 ${selectedRole === role.id ? 'text-white/80' : 'text-text-muted'}`}>
                    {role.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(1)} className="flex-1 h-12 bg-slate-100 dark:bg-slate-750 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer">Back</button>
            <button disabled={!selectedRole} onClick={() => setStep(3)} className="flex-1 h-12 bg-accent disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-accent" /> Define Ward Location
          </h2>
          <button type="button" onClick={detectLocation} disabled={detLoading} className="w-full h-11 bg-accent-soft text-accent border border-accent/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            {detLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>📍 Detect My Location</span>}
          </button>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">State</label>
                <select value={locForm.state} onChange={(e) => setLocForm({ ...locForm, state: e.target.value, district: indianStates[e.target.value][0] })} className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs font-bold">
                  {Object.keys(indianStates).map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">District</label>
                <select value={locForm.district} onChange={(e) => setLocForm({ ...locForm, district: e.target.value })} className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs font-bold">
                  {indianStates[locForm.state].map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">Village / Suburb</label>
              <input type="text" value={locForm.village} onChange={(e) => setLocForm({ ...locForm, village: e.target.value })} placeholder="e.g. Rajajinagar" className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">Ward Number</label>
              <input type="text" value={locForm.ward} onChange={(e) => setLocForm({ ...locForm, ward: e.target.value })} placeholder="e.g. 6" className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs font-bold" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(2)} className="flex-1 h-12 bg-slate-100 dark:bg-slate-750 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer">Back</button>
            <button disabled={!locForm.village} onClick={() => setStep(4)} className="flex-1 h-12 bg-accent disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
            <Lock className="w-5 h-5 text-accent" /> Authenticate & Finish Setup
          </h2>

          <button
            onClick={handleGuestOnboard}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow-md"
          >
            ⚡ Complete Setup instantly as Guest ({selectedRole})
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-slate-700"></div>
            </div>
            <span className="relative px-3 bg-surface dark:bg-slate-800 text-[10px] font-bold text-text-muted uppercase">
              Or Register With
            </span>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full h-12 bg-surface hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-border dark:border-slate-700 text-text dark:text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          {googleError && (
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 text-center mt-2">
              ⚠️ {googleError}
            </p>
          )}

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-slate-700"></div>
            </div>
            <span className="relative px-3 bg-surface dark:bg-slate-800 text-[10px] font-bold text-text-muted uppercase">
              Or Sign Up With Email
            </span>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password (min 6 chars)" className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white" minLength={6} required />
            </div>
            <button type="submit" className="w-full h-12 bg-accent hover:bg-opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-md">Create Account</button>
          </form>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 mt-4">
            <button onClick={() => setStep(3)} className="flex-1 h-12 bg-slate-100 dark:bg-slate-750 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer">Modify Details</button>
            <button onClick={() => navigate('/login')} className="flex-1 h-12 bg-surface hover:bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 text-text dark:text-white text-xs font-bold rounded-xl cursor-pointer">Already Registered?</button>
          </div>
        </div>
      )}
    </div>
  );
}
