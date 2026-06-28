import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, MessageSquare, ShieldAlert, User, ShieldAlert as AiIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('common.home', 'Home'), icon: Home },
    { path: '/map', label: t('common.map', 'Map'), icon: Map },
    { path: '/community', label: t('common.community', 'Chat'), icon: MessageSquare },
    { path: '/ai', label: t('common.ai', 'AI Guard'), icon: AiIcon },
    { path: '/profile', label: t('common.profile', 'Profile'), icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-surface dark:bg-slate-800 border-t border-border dark:border-slate-700 flex items-center justify-around z-50 px-2 pb-safe shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[56px] transition-colors relative ${
              isActive 
                ? 'text-accent dark:text-blue-400 font-bold' 
                : 'text-text-muted dark:text-slate-400'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
            <span className="text-[10px] mt-1 tracking-wide leading-none">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent dark:bg-blue-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
