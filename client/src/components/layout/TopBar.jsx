import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, MapPin } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function TopBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) {
      setGreeting(t('greeting_morning', 'Good morning'));
    } else if (hrs < 17) {
      setGreeting(t('greeting_afternoon', 'Good afternoon'));
    } else {
      setGreeting(t('greeting_evening', 'Good evening'));
    }
  }, [t]);

  return (
    <div className="bg-surface dark:bg-slate-800 border-b border-border dark:border-slate-700 px-4 md:px-6 py-3 flex flex-col justify-center min-h-[72px] sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        {/* User Greeting */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-text dark:text-white m-0 p-0 leading-tight">
            {greeting}, {dbUser?.name || 'Citizen'}
          </h2>
          {/* Location details */}
          <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-accent dark:text-blue-400 flex-shrink-0" />
            <span className="truncate">
              {dbUser?.village || 'Unknown Location'}
              {dbUser?.ward ? `, ${dbUser.ward}` : ''}
            </span>
          </div>
        </div>

        {/* Notifications & Avatar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')} 
            className="w-10 h-10 border border-border dark:border-slate-700 hover:border-accent rounded-xl flex items-center justify-center relative bg-surface dark:bg-slate-800 transition cursor-pointer"
          >
            <Bell className="w-5 h-5 text-text-muted dark:text-slate-300" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface dark:border-slate-800" />
          </button>

          <img 
            onClick={() => navigate('/profile')}
            src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
            alt="profile" 
            className="w-10 h-10 rounded-xl object-cover border border-border dark:border-slate-700 hover:border-accent cursor-pointer transition bg-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
