import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  MapPin, 
  Award, 
  Languages, 
  Bell, 
  Moon, 
  Sun,
  LogOut, 
  ChevronRight,
  TrendingUp,
  Briefcase,
  CheckCircle,
  FileCheck,
  X
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useIssues from '../hooks/useIssues';
import { useLanguage } from '../contexts/LanguageContext';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dbUser, logout } = useAuth();
  const { issues } = useIssues();
  const { currentLang, changeLanguage, languagesList } = useLanguage();

  // Local settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('vanguard_notifications') === 'true'
  );
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('vanguard_dark_mode') === 'true' ||
    document.documentElement.classList.contains('dark')
  );

  const [showLangModal, setShowLangModal] = useState(false);

  // Stats calculation
  const [userReportCount, setUserReportCount] = useState(0);
  const [userConfirmCount, setUserConfirmCount] = useState(0);
  const [communityScore, setCommunityScore] = useState(50); // base score

  useEffect(() => {
    if (issues && dbUser) {
      // Find reports created by user
      const reports = issues.filter(issue => issue.reporterId === dbUser.id || issue.reporterName === dbUser.name);
      setUserReportCount(reports.length);

      // Find confirmations (issues where user is in confirmations array)
      const confirmed = issues.filter(issue => issue.confirmations?.includes(dbUser.id));
      setUserConfirmCount(confirmed.length);

      // Community Score = 50 base + 15 per report + 5 per confirmation
      const score = 50 + (reports.length * 15) + (confirmed.length * 5);
      setCommunityScore(score);
    }
  }, [issues, dbUser]);

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('vanguard_dark_mode', String(nextDark));
    
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Notification Toggle
  const toggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    localStorage.setItem('vanguard_notifications', String(nextVal));
    if (nextVal) {
      // Request browser notification permission
      Notification.requestPermission();
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-6">
      
      {/* 1. Header Profile details Card */}
      <div className="card-vanguard p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
        {/* Decorative corner background */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-soft rounded-full opacity-40 dark:bg-slate-700" />
        
        {/* Large Avatar */}
        <div className="relative">
          <img 
            src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
            alt="profile" 
            className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-md bg-slate-100"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full border-2 border-surface dark:border-slate-800" />
        </div>

        {/* Username & Badges */}
        <div>
          <h3 className="text-xl font-black text-text dark:text-white leading-tight">
            {dbUser?.name || 'Citizen'}
          </h3>
          
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="bg-accent-soft text-accent dark:bg-slate-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {dbUser?.role || 'Citizen'}
            </span>
            <div className="flex items-center gap-0.5 text-xs text-text-muted font-bold ml-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{dbUser?.village || 'Ramanagara'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Counters Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <FileCheck className="w-5 h-5 text-accent mx-auto" />
          <span className="block text-2xl font-black text-text dark:text-white leading-none pt-1">
            {userReportCount}
          </span>
          <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Reports
          </span>
        </div>

        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <CheckCircle className="w-5 h-5 text-success mx-auto" />
          <span className="block text-2xl font-black text-text dark:text-white leading-none pt-1">
            {userConfirmCount}
          </span>
          <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Verified
          </span>
        </div>

        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <Award className="w-5 h-5 text-amber-500 mx-auto" />
          <span className="block text-2xl font-black text-text dark:text-white leading-none pt-1">
            {communityScore}
          </span>
          <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Score
          </span>
        </div>
      </div>

      {/* 3. Settings Control panel list */}
      <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm divide-y divide-border dark:divide-slate-700">
        
        {/* Toggle Language picker */}
        <button
          onClick={() => setShowLangModal(true)}
          className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-left transition cursor-pointer min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-text dark:text-white block">🌐 Language / भाषा</span>
              <span className="text-[10px] text-text-muted font-medium capitalize mt-0.5 block">
                {languagesList.find(l => l.code === currentLang)?.nativeName || 'English'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </button>

        {/* Toggle Notifications switch */}
        <div className="flex items-center justify-between p-4.5 min-h-[56px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 dark:bg-slate-700 text-amber-500 dark:text-amber-300 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-text dark:text-white block">🔔 Push Notifications</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5 block">
                Get real-time community safety alerts.
              </span>
            </div>
          </div>
          <button
            onClick={toggleNotifications}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
              notificationsEnabled ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div 
              className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle Dark Mode manually */}
        <div className="flex items-center justify-between p-4.5 min-h-[56px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-text dark:text-white block">🌙 Dark Appearance</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5 block">
                Enable low-light readability themes.
              </span>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
              darkMode ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div 
              className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4.5 hover:bg-red-50/20 dark:hover:bg-red-950/25 text-left transition cursor-pointer min-h-[56px] text-red-600 dark:text-red-400"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">🚪 Logout Account</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5 block">
                Sign out of this user session.
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* 4. LANGUAGE SELECT MODAL OVERLAY */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface dark:bg-slate-800 rounded-3xl border border-border dark:border-slate-700 p-6 max-w-sm w-full relative space-y-4 shadow-2xl">
            <button 
              onClick={() => setShowLangModal(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl flex items-center justify-center text-text-muted cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black text-text dark:text-white">Select Language</h4>
            
            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {languagesList.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setShowLangModal(false); }}
                  className={`p-3 border rounded-xl text-left transition ${
                    currentLang === lang.code
                      ? 'border-accent bg-accent-soft text-accent dark:bg-slate-700 dark:text-blue-400 font-bold'
                      : 'border-border dark:border-slate-700 text-text hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg mr-1.5">{lang.flag}</span>
                  <span className="text-xs font-bold">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
