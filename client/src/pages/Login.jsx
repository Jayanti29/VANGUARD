import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  Loader2, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Setup invisible reCAPTCHA Verifier
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
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

  // Verify OTP & check user profile existence
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

      // Check if user profile is already configured in firestore
      const userSnap = await getDoc(doc(db, 'users', userObj.uid));

      toast.dismiss(verifyToast);
      toast.success("Login successful!");
      
      setTimeout(() => {
        if (userSnap.exists()) {
          window.location.href = '/';
        } else {
          navigate('/onboarding');
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.dismiss(verifyToast);
      toast.error("Invalid verification code. Please check and try again.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Invisible reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-primary dark:text-white flex items-center justify-center gap-1.5 uppercase">
          🛡️ VANGUARD
        </h1>
        <p className="text-xs text-text-muted">Sign In to Your Community Hub</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-black text-text dark:text-white flex items-center gap-1.5">
          <PhoneCall className="w-5 h-5 text-accent" /> Phone Sign In
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
                className="w-full h-12 bg-accent text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 mt-4"
              >
                Send OTP Code <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 animate-fadeIn">
              <label className="text-[10px] font-bold text-text-muted uppercase block">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-center text-sm focus:outline-none dark:text-white font-black tracking-widest"
              />
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 mt-4 shadow-sm"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => navigate('/onboarding')}
          className="text-xs text-accent font-bold hover:underline cursor-pointer"
        >
          New user? Create an Account
        </button>
      </div>
    </div>
  );
}
