import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || localStorage.getItem('vanguard_language') || 'en';

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('vanguard_language', lang);
    toast.success(`Language changed to ${lang.toUpperCase()}`);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'official': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900';
      case 'volunteer': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900';
      case 'worker': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900';
      default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900';
    }
  };

  const role = dbUser?.role || 'Citizen';

  return (
    <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 md:px-6 py-3 flex items-center justify-between min-h-[64px] h-[64px] sticky top-0 z-30 shadow-sm">
      {/* VANGUARD Logo Left (no emoji) */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <span className="font-extrabold text-lg text-[var(--text)] tracking-wider">VANGUARD</span>
      </div>

      {/* Controls and Profile */}
      <div className="flex items-center gap-3">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-2 py-1">
          <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <select 
            value={currentLang} 
            onChange={handleLanguageChange}
            style={{ background: 'transparent', color: 'var(--text)', border: 'none', outline: 'none', fontSize: '11px', fontWeight: 'bold' }}
            className="cursor-pointer font-bold"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 border border-[var(--border)] rounded-xl flex items-center justify-center bg-[var(--surface-2)] transition cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)]"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Bell notification */}
        <button 
          onClick={() => navigate('/profile')} 
          className="w-9 h-9 border border-[var(--border)] rounded-xl flex items-center justify-center bg-[var(--surface-2)] transition cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-bold text-[var(--text)]">{dbUser?.name || t('citizen')}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border mt-0.5 capitalize ${getRoleBadgeColor(role)}`}>
            {t(role.toLowerCase())}
          </span>
        </div>

        <img 
          onClick={() => navigate('/profile')}
          src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
          alt="profile" 
          className="w-9 h-9 rounded-xl object-cover border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition bg-slate-100"
        />
      </div>
    </div>
  );
}
