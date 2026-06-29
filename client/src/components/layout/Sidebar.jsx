import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Map, 
  MessageSquare, 
  ShieldAlert, 
  User, 
  Users, 
  PhoneCall, 
  AlertTriangle,
  Building,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { dbUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const theme = {
    bg: 'var(--bg)',
    surface: 'var(--surface)',
    surface2: 'var(--surface-2)',
    text: 'var(--text)',
    muted: 'var(--text-muted)',
    border: 'var(--border)',
    accent: 'var(--accent)',
    accentSoft: 'var(--accent-soft)',
  };

  const menuItems = [
    { path: '/', label: t('nav_home'), icon: Home },
    { path: '/map', label: t('nav_map'), icon: Map },
    { path: '/community', label: t('nav_community'), icon: MessageSquare },
    { path: '/workers', label: t('nav_workers'), icon: Users },
    { path: '/emergency', label: t('nav_emergency'), icon: AlertTriangle, badge: 'Alert' },
    { path: '/ai', label: t('nav_ai'), icon: ShieldAlert },
    { path: '/officials', label: t('nav_officials'), icon: Building },
    { path: '/profile', label: t('nav_profile'), icon: User }
  ];

  if ((dbUser?.role || '').toLowerCase() === 'official') {
    menuItems.push({ path: '/admin', label: t('nav_officials'), icon: ShieldCheck });
  }

  return (
    <div 
      style={{
        background: theme.surface,
        borderRight: '1px solid ' + theme.border,
        color: theme.text,
        width: collapsed ? '64px' : '220px'
      }}
      className="hidden md:flex flex-col h-screen sticky top-0 left-0 transition-all duration-300 z-40 shrink-0"
    >
      {/* Title / Logo header */}
      <div 
        style={{ borderBottom: '1px solid ' + theme.border }}
        className="p-4 flex items-center justify-between min-h-[72px]"
      >
        {!collapsed && (
          <img src="/vanguard-logo.png" alt="VANGUARD" 
               style={{height:'48px', objectFit:'contain'}} />
        )}
        {collapsed && (
          <img src="/vanguard-logo.png" alt="V" 
               style={{height:'32px', objectFit:'contain', margin:'0 auto'}} />
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: theme.muted }}
          className="hover:text-text p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu List */}
      <div className="flex-1 py-4 overflow-y-auto space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: isActive ? theme.accentSoft : 'transparent',
                color: isActive ? theme.accent : theme.muted
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition duration-200 cursor-pointer`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'scale-105' : ''}`} />
              {!collapsed && <span className="text-sm truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[10px] animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded-md font-bold uppercase">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Summary footer */}
      {!collapsed && dbUser && (
        <div 
          style={{ borderTop: '1px solid ' + theme.border, background: theme.surface2 }}
          className="p-4 flex items-center gap-3"
        >
          <img 
            src={dbUser.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
            alt="avatar" 
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: theme.text }}>{dbUser.name}</p>
            <p className="text-xs truncate capitalize" style={{ color: theme.muted }}>{dbUser.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
