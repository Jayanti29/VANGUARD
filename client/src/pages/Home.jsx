import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  MessageSquare, 
  Briefcase, 
  Shield, 
  Map, 
  Bot,
  User,
  Plus,
  TrendingUp,
  FileText,
  MapPin,
  ArrowRight,
  Users
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot, getDocs } from 'firebase/firestore';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbUser, userProfile } = useAuth();
  const role = (dbUser?.role || userProfile?.role || 'citizen').toLowerCase();

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('greeting_morning', 'Good morning');
    if (hour >= 12 && hour < 17) return t('greeting_afternoon', 'Good afternoon');
    if (hour >= 17 && hour < 21) return t('greeting_evening', 'Good evening');
    return t('greeting_night', 'Good night');
  };

  // ─────────────────────────────────────────────────────────────────
  // CITIZEN DASHBOARD
  // ─────────────────────────────────────────────────────────────────
  if (role === 'citizen') {
    const [openIssuesCount, setOpenIssuesCount] = useState(0);
    const [myReportsCount, setMyReportsCount] = useState(0);
    const [communityCount, setCommunityCount] = useState(124); // mock default
    const [recentIssues, setRecentIssues] = useState([]);

    useEffect(() => {
      if (!dbUser) return;

      // 1. Open issues in user's ward
      const openQ = query(
        collection(db, 'issues'),
        where('ward', '==', dbUser.ward || '6'),
        where('status', '==', 'open')
      );
      const unsubOpen = onSnapshot(openQ, (snap) => {
        setOpenIssuesCount(snap.size);
      });

      // 2. Issues reported by current user
      const myQ = query(
        collection(db, 'issues'),
        where('reporterId', '==', dbUser.uid)
      );
      const unsubMy = onSnapshot(myQ, (snap) => {
        setMyReportsCount(snap.size);
      });

      // 3. Community members count (district match)
      const usersQ = query(
        collection(db, 'users'),
        where('district', '==', dbUser.district || 'Ramanagara')
      );
      getDocs(usersQ).then((snap) => {
        if (snap.size > 0) setCommunityCount(snap.size);
      });

      // 4. Last 5 issues
      const recentQ = query(
        collection(db, 'issues'),
        where('village', '==', dbUser.village || 'Ramanagara'),
        limit(5)
      );
      const unsubRecent = onSnapshot(recentQ, (snap) => {
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentIssues(docs);
      });

      return () => {
        unsubOpen();
        unsubMy();
        unsubRecent();
      };
    }, [dbUser]);

    const getSeverityStyle = (severity) => {
      switch (severity) {
        case 'red': return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
        case 'orange': return { background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' };
        case 'yellow': return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' };
        default: return { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
      }
    };

    return (
      <div className="space-y-6" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getGreeting()}, {dbUser?.name || 'Citizen'}
              <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                Citizen
              </span>
            </h2>
            <p style={{ fontSize: '12px', color: theme.muted, marginTop: '4px' }}>Protect your community</p>
            <div style={{ fontSize: '12px', color: theme.muted, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <MapPin size={14} className="text-accent" /> {dbUser?.village || 'Ramanagara'}, Ward {dbUser?.ward || '6'}
            </div>
          </div>
          <img src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=citizen'} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid ' + theme.border }} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)', block: true }}>{openIssuesCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Open Issues</span>
          </div>
          <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', block: true }}>{myReportsCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>My Reports</span>
          </div>
          <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', block: true }}>{communityCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Members</span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button onClick={() => navigate('/report')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <AlertTriangle size={28} color="#DC2626" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text }}>Report Issue</span>
          </button>
          <button onClick={() => navigate('/community')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <MessageSquare size={28} color="#1B6FD8" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text }}>Community Chat</span>
          </button>
          <button onClick={() => navigate('/map')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <Map size={28} color="#1B6FD8" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text }}>Live Map</span>
          </button>
          <button onClick={() => navigate('/emergency')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <Shield size={28} color="#DC2626" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text }}>Emergency Alert</span>
          </button>
          <button onClick={() => navigate('/ai')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <Bot size={28} color="#7C3AED" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text }}>AI Assistant</span>
          </button>
          <button onClick={() => navigate('/officials')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <Briefcase size={28} color="#D97706" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text }}>Officials</span>
          </button>
        </div>

        {/* Recent Issues Feed */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Recent Ward Issues
          </h3>
          {recentIssues.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>No issues reported in this ward yet.</p>
          ) : (
            <div className="space-y-3">
              {recentIssues.map(issue => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border }} onClick={() => navigate(`/issues/${issue.id}`)} className="cursor-pointer hover:opacity-90">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ borderLeft: '4px solid ' + (issue.severity === 'red' ? '#DC2626' : issue.severity === 'orange' ? '#EA580C' : '#D97706'), paddingLeft: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>{issue.title}</span>
                      <span style={{ fontSize: '10px', color: theme.muted }}>{issue.categoryLabel || issue.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...getSeverityStyle(issue.severity), fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {issue.severity}
                    </span>
                    <span style={{ fontSize: '10px', color: theme.muted }}>{issue.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback loading skeleton / basic layout
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: theme.muted }}>
      Loading Vanguard Dashboard ({role})...
    </div>
  );
}
