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
  Map
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useIssues from '../hooks/useIssues';
import SeverityBadge from '../components/ui/SeverityBadge';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const { issues } = useIssues();

  // Local state for counts and updates
  const [criticalCount, setCriticalCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  const [workerCount, setWorkerCount] = useState(12); // simulated local count
  const [latestMessage, setLatestMessage] = useState({
    senderName: 'Ramesh Kumar',
    senderRole: 'Volunteer',
    text: 'Cleanliness drive scheduled this Saturday at 8 AM. Requesting active participation!',
    time: '10:30 AM'
  });

  useEffect(() => {
    if (issues && issues.length > 0) {
      // Filter issues by severity red
      const criticals = issues.filter(issue => issue.severity === 'red' && issue.status !== 'Resolved');
      setCriticalCount(criticals.length);

      // Find latest issue with high severity for the alert card
      const highSeverityIssue = issues.find(issue => issue.severity === 'red' || issue.severity === 'orange');
      if (highSeverityIssue) {
        setLatestAlert(highSeverityIssue);
      }
    }
  }, [issues]);

  const quickActions = [
    { 
      label: t('home.reportIssue', 'Report Issue'), 
      icon: PlusCircle, 
      path: '/report', 
      bg: 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:border-blue-300' 
    },
    { 
      label: t('home.community', 'Community Chat'), 
      icon: MessageSquare, 
      path: '/community', 
      bg: 'bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 hover:border-emerald-300' 
    },
    { 
      label: t('home.workers', 'Local Workers'), 
      icon: Users, 
      path: '/workers', 
      bg: 'bg-purple-50 dark:bg-slate-700 text-purple-600 dark:text-purple-300 hover:border-purple-300' 
    },
    { 
      label: t('home.emergency', 'Emergency Alert'), 
      icon: AlertOctagon, 
      path: '/emergency', 
      bg: 'bg-red-50 dark:bg-slate-700 text-red-600 dark:text-red-300 hover:border-red-300 border-2 border-red-200 dark:border-red-900 animate-pulse' 
    },
    { 
      label: t('home.map', 'Live Map'), 
      icon: Map, 
      path: '/map', 
      bg: 'bg-amber-50 dark:bg-slate-700 text-amber-600 dark:text-amber-300 hover:border-amber-300' 
    },
    { 
      label: t('home.aiAssistant', 'AI Assistant'), 
      icon: ShieldAlert, 
      path: '/ai', 
      bg: 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 hover:border-indigo-300' 
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Quick Action Grid - Elder Friendly (Taps >= 56px, big fonts) */}
      <div>
        <h3 className="text-xs font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-3 p-4 rounded-2xl border border-border dark:border-slate-700 font-bold text-left transition duration-200 min-h-[80px] shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${action.bg}`}
              >
                <Icon className="w-8 h-8 flex-shrink-0" />
                <span className="text-sm md:text-base leading-snug">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-1">
          Community Dashboard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 — Critical Issues */}
          <div className="bg-surface dark:bg-slate-800 border-l-4 border-l-danger border border-border dark:border-slate-700 rounded-r-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Civic Hazards
                </span>
                <h4 className="text-2xl font-black text-danger mt-1">
                  {criticalCount} Active Alerts
                </h4>
                <p className="text-xs text-text-muted mt-1 font-medium">
                  {criticalCount > 0 
                    ? 'Immediate safety attention requested by ward residents.' 
                    : 'All critical safety issues have been successfully cleared.'
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-red-50 dark:bg-red-950/40 text-danger rounded-xl flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
            </div>
            <button 
              onClick={() => navigate('/map')}
              className="text-xs text-danger font-bold flex items-center gap-1 mt-4 hover:underline self-start cursor-pointer"
            >
              View on Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 — Community Updates */}
          <div className="card-vanguard flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Community Updates
              </span>
              <div className="mt-2.5 space-y-1">
                <p className="text-xs font-bold text-text dark:text-slate-200">
                  {latestMessage.senderName} 
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded ml-2 uppercase">
                    {latestMessage.senderRole}
                  </span>
                </p>
                <p className="text-xs text-text-muted italic line-clamp-2 mt-1 leading-relaxed">
                  "{latestMessage.text}"
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[10px] text-text-muted font-bold">{latestMessage.time}</span>
              <button 
                onClick={() => navigate('/community')}
                className="text-xs text-accent dark:text-blue-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                Go to Community <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3 — Workers Nearby */}
          <div className="card-vanguard flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Local Workforce
              </span>
              <h4 className="text-2xl font-black text-text dark:text-white mt-1">
                {workerCount} Workers Online
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-normal">
                Available daily-wage workers registered nearby in your village.
              </p>
              <div className="flex gap-1.5 mt-3">
                <span className="bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Electrician
                </span>
                <span className="bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Plumber
                </span>
                <span className="bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Farmer
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/workers')}
              className="text-xs text-accent dark:text-blue-400 font-bold flex items-center gap-1 mt-4 hover:underline self-start cursor-pointer"
            >
              Browse Workers <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4 — AI Alert */}
          <div className="card-vanguard flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  AI Safety Alert
                </span>
                {latestAlert && <SeverityBadge severity={latestAlert.severity} />}
              </div>
              <div className="mt-2.5">
                <h5 className="text-sm font-bold text-text dark:text-white">
                  {latestAlert ? latestAlert.title : 'All Clear'}
                </h5>
                <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                  {latestAlert 
                    ? `Risk: ${latestAlert.riskSummary}`
                    : 'Gemini Agent reports no active safety hazards in your immediate ward.'
                  }
                </p>
              </div>
            </div>
            {latestAlert ? (
              <button 
                onClick={() => navigate(`/issues/${latestAlert.id}`)}
                className="text-xs text-accent dark:text-blue-400 font-bold flex items-center gap-1 mt-4 hover:underline self-start cursor-pointer"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] text-text-muted font-bold mt-4 block">
                Updated just now
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
