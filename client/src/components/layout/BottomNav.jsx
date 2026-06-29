import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, MessageSquare, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav_home'), icon: Home },
    { path: '/map', label: t('nav_map'), icon: Map },
    { path: '/community', label: t('nav_community'), icon: MessageSquare },
    { path: '/ai', label: t('nav_ai'), icon: Bot },
    { path: '/profile', label: t('nav_profile'), icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-around z-50 px-2 pb-safe shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
              isActive 
                ? 'text-[var(--accent)] font-bold' 
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
            {isActive && (
              <span className="text-[10px] mt-1 tracking-wide leading-none">{item.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
