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

  const menuItems = [
    { path: '/', label: t('common.home', 'Home'), icon: Home },
    { path: '/map', label: t('common.map', 'Live Map'), icon: Map },
    { path: '/community', label: t('common.community', 'Community Chat'), icon: MessageSquare },
    { path: '/workers', label: t('common.workers', 'Worker Market'), icon: Users },
    { path: '/emergency', label: t('common.emergency', 'Emergency Alert'), icon: AlertTriangle, badge: '🚨' },
    { path: '/ai', label: t('common.ai', 'AI Assistant'), icon: ShieldAlert },
    { path: '/officials', label: t('common.officials', 'Officials Directory'), icon: Building },
    { path: '/profile', label: t('common.profile', 'Profile'), icon: User }
  ];

  // If official, show admin link
  if (dbUser?.role === 'Official') {
    menuItems.push({ path: '/admin', label: t('common.admin', 'Admin Panel'), icon: ShieldCheck });
  }

  return (
    <div 
      className={`hidden md:flex flex-col bg-surface dark:bg-slate-800 border-r border-border dark:border-slate-700 h-screen sticky top-0 left-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-60'
      } z-40`}
    >
      {/* Title / Logo header */}
      <div className="p-4 border-b border-border dark:border-slate-700 flex items-center justify-between min-h-[72px]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent text-white flex items-center justify-center rounded-xl shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-primary dark:text-white tracking-wider">VANGUARD</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-accent text-white flex items-center justify-center rounded-xl mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
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
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-accent-soft text-accent dark:bg-slate-700 dark:text-blue-400 font-bold' 
                  : 'text-text hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent dark:text-blue-400 scale-105' : 'text-text-muted dark:text-slate-400'}`} />
              {!collapsed && <span className="text-sm truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-xs animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded-md font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Summary footer */}
      {!collapsed && dbUser && (
        <div className="p-4 border-t border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex items-center gap-3">
          <img 
            src={dbUser.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
            alt="avatar" 
            className="w-10 h-10 rounded-xl object-cover bg-slate-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text dark:text-white truncate">{dbUser.name}</p>
            <p className="text-xs text-text-muted truncate capitalize">{dbUser.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
