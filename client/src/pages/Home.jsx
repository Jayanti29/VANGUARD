import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  AlertOctagon, 
  MessageSquare, 
  Users, 
  MapPin, 
  ShieldAlert, 
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Map,
  Wrench,
  Bot
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbUser, user } = useAuth();

  const [criticalCount, setCriticalCount] = useState(0);
  const [totalOpenIssues, setTotalOpenIssues] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  const [availableWorkersCount, setAvailableWorkersCount] = useState(0);
  
  // Real-time Community Message Preview
  const [latestMessage, setLatestMessage] = useState(null);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('greeting_morning', 'Good morning');
    if (hour >= 12 && hour < 17) return t('greeting_afternoon', 'Good afternoon');
    if (hour >= 17 && hour < 21) return t('greeting_evening', 'Good evening');
    return t('greeting_night', 'Good night');
  };

  const communityId = `${dbUser?.district || 'bangalore'}_${dbUser?.village || 'ward6'}`.toLowerCase().replace(/\s+/g, '');

  // Real-time listeners for issues & counts
  useEffect(() => {
    if (!dbUser) return;

    // 1. Fetch Issues count in user's ward
    const issuesQuery = query(
      collection(db, 'issues'),
      where('ward', '==', dbUser.ward || '6'),
      where('status', '==', 'open')
    );
    const unsubscribeIssues = onSnapshot(issuesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      setTotalOpenIssues(docs.length);
      const criticals = docs.filter(issue => issue.severity === 'red');
      setCriticalCount(criticals.length);

      // Latest red/orange alert
      const highAlert = docs.find(issue => issue.severity === 'red' || issue.severity === 'orange');
      setLatestAlert(highAlert || null);
    });

    // 2. Fetch community latest message
    const msgQuery = query(
      collection(db, 'communities', communityId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
      if (!snapshot.empty) {
        setLatestMessage(snapshot.docs[0].data());
      } else {
        setLatestMessage(null);
      }
    });

    // 3. Fetch count of available workers nearby
    const workersQuery = query(
      collection(db, 'workers'),
      where('district', '==', dbUser.district || 'Bangalore'),
      where('isAvailable', '==', true)
    );
    const unsubscribeWorkers = onSnapshot(workersQuery, (snapshot) => {
      setAvailableWorkersCount(snapshot.size);
    });

    return () => {
      unsubscribeIssues();
      unsubscribeMessages();
      unsubscribeWorkers();
    };
  }, [dbUser, communityId]);

  const quickActions = [
    { label: t('report_issue', 'Report Issue'), icon: PlusCircle, path: '/report', color: 'bg-accent text-white' },
    { label: t('common.community', 'Community Chat'), icon: MessageSquare, path: '/community', color: 'bg-green-600 text-white' },
    { label: t('common.workers', 'Worker Market'), icon: Users, path: '/workers', color: 'bg-orange-500 text-white' },
    { label: t('common.emergency', 'Emergency Alert'), icon: AlertOctagon, path: '/emergency', color: 'bg-red-650 text-white' },
    { label: t('common.map', 'Issue Map'), icon: Map, path: '/map', color: 'bg-blue-650 text-white' },
    { label: t('common.ai', 'AI Assistant'), icon: Bot, path: '/ai', color: 'bg-slate-700 text-white' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Time-Aware Greeting Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-5 rounded-2xl border border-border dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-text dark:text-white">
            🌅 {getGreeting()}, {dbUser?.name || 'Citizen'}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1 font-bold">
            <MapPin className="w-3.5 h-3.5 text-accent" /> {dbUser?.village || 'Ramanagara'}, Ward {dbUser?.ward || '6'}
          </p>
        </div>
        <img 
          src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar'} 
          alt="profile" 
          className="w-12 h-12 rounded-full border border-border dark:border-slate-650 object-cover cursor-pointer"
          onClick={() => navigate('/profile')}
        />
      </div>

      {/* 2x3 Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`min-h-[96px] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-102 transition ${action.color}`}
          >
            <action.icon className="w-8 h-8" />
            <span className="text-xs font-black text-center">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Real-time Dashboard cards */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-black text-text dark:text-white uppercase tracking-wider">
          {t('community_updates', 'Community Updates')}
        </h3>

        {/* Card 1: Critical Alerts */}
        <div 
          onClick={() => navigate('/map')}
          className="bg-surface dark:bg-slate-800 border-l-4 border-red-600 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700 flex gap-4 items-center justify-between cursor-pointer hover:shadow"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text dark:text-white">🚨 {t('critical_issues', 'Local Critical Issues')}</h4>
              <p className="text-[10px] text-text-muted mt-0.5 font-bold">
                {criticalCount > 0 
                  ? `${criticalCount} ${t('urgent_hazards', 'Urgent hazards need attention')}` 
                  : t('all_clear', 'All clear! No critical issues reported')}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </div>

        {/* Card 2: Community Chat Updates */}
        <div 
          onClick={() => navigate('/community')}
          className="bg-surface dark:bg-slate-800 border-l-4 border-green-600 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700 flex gap-4 items-center justify-between cursor-pointer hover:shadow"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/20 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-text dark:text-white">💬 {t('latest_chat_update', 'Latest Chat Update')}</h4>
              <p className="text-[10px] text-text-muted mt-0.5 truncate font-bold">
                {latestMessage ? `[${latestMessage.senderName}]: "${latestMessage.text}"` : t('no_messages', 'No chat messages posted yet')}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </div>

        {/* Card 3: Workers Nearby */}
        <div 
          onClick={() => navigate('/workers')}
          className="bg-surface dark:bg-slate-800 border-l-4 border-orange-500 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700 flex gap-4 items-center justify-between cursor-pointer hover:shadow"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text dark:text-white">👷 {t('available_workers', 'Available Workers')}</h4>
              <p className="text-[10px] text-text-muted mt-0.5 font-bold">
                {availableWorkersCount > 0 
                  ? `${availableWorkersCount} ${t('workers_ready', 'skill providers ready to work nearby')}` 
                  : t('no_workers', 'No registered workers online')}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </div>

        {/* Card 4: AI Alert */}
        {latestAlert && (
          <div 
            onClick={() => navigate(`/issues/${latestAlert.id || ''}`)}
            className="bg-surface dark:bg-slate-800 border-l-4 border-amber-500 rounded-2xl p-4 shadow-sm border border-border dark:border-slate-700 flex gap-4 items-center justify-between cursor-pointer hover:shadow animate-fadeIn"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/20 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-text dark:text-white">🤖 {t('ai_prediction_alert', 'AI Prediction Alert')}</h4>
                <p className="text-[10px] text-text-muted mt-0.5 truncate font-bold">
                  {latestAlert.riskSummary || latestAlert.title}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
