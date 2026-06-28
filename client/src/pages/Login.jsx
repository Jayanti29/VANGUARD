import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { ShieldCheck, PhoneCall, Loader2, Check, ArrowRight } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithPhone, confirmOTP, loginWithGoogle, user, dbUser } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationSent, setVerificationSent] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    // If user is already logged in, redirect them
    const cachedDbUser = localStorage.getItem('vanguard_session_dbuser');
    if (cachedDbUser) {
      const db = JSON.parse(cachedDbUser);
      if (db.village) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, dbUser, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      const mockVerifier = {};
      await loginWithPhone(phone, mockVerifier);
      setVerificationSent(true);
      setTimer(60);
    } catch (err) {
      setAuthError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

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
      
      // If user profile does not exist in DB, direct them to onboarding
      const cachedDbUser = localStorage.getItem('vanguard_session_dbuser');
      if (cachedDbUser) {
        const db = JSON.parse(cachedDbUser);
        if (db.village) {
          navigate('/');
          return;
        }
      }
      navigate('/onboarding');
    } catch (err) {
      setAuthError(err.message || 'Verification failed. Use "123456" for testing.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      const cachedDbUser = localStorage.getItem('vanguard_session_dbuser');
      if (cachedDbUser) {
        const db = JSON.parse(cachedDbUser);
        if (db.village) {
          navigate('/');
          return;
        }
      }
      navigate('/onboarding');
    } catch (err) {
      setAuthError(err.message || 'Google Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent text-white flex items-center justify-center rounded-2xl shadow-lg animate-pulse-ring">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary dark:text-white m-0 p-0 leading-none">VANGUARD</h1>
          <p className="text-sm font-medium text-text-muted mt-1 m-0">AI Community Protection</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-surface dark:bg-slate-800 rounded-3xl shadow-xl border border-border dark:border-slate-700 p-6 md:p-8 relative">
        <h2 className="text-2xl font-bold text-text dark:text-white text-center">Welcome Back</h2>
        <p className="text-text-muted mt-1 text-center text-sm">Enter your phone number to access your local dashboard.</p>

        {authError && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900 mt-4">
            {authError}
          </div>
        )}

        {!verificationSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4 mt-6">
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

            <button
              type="submit"
              disabled={phone.length < 10 || authLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Send OTP <PhoneCall className="w-5 h-5" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5 mt-6">
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-text-muted">
                OTP sent to <strong className="text-text dark:text-white">+91 {phone}</strong>
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

            <button
              type="submit"
              disabled={authLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Verify OTP <Check className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}

        {/* Alternative Sign-In Option */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-text-muted text-xs uppercase font-bold">Or</span>
          <div className="flex-grow border-t border-border dark:border-slate-700"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full min-h-[56px] bg-surface hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-border dark:border-slate-600 text-text dark:text-white rounded-xl flex items-center justify-center gap-3 font-semibold transition"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-center text-xs text-text-muted mt-6">
          First time here? <Link to="/onboarding" className="text-accent dark:text-blue-400 font-bold hover:underline">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}
