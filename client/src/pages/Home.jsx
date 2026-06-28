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
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

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

  // ─────────────────────────────────────────────────────────────────
  // WORKER DASHBOARD
  // ─────────────────────────────────────────────────────────────────
  if (role === 'worker') {
    const [isAvailable, setIsAvailable] = useState(dbUser?.isAvailable !== false);
    const [appliedCount, setAppliedCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [avgRating, setAvgRating] = useState(dbUser?.rating || 5.0);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    
    // Application modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [proposedRate, setProposedRate] = useState(dbUser?.dailyRate || 400);
    const [coverMessage, setCoverMessage] = useState('');
    const [submittingApp, setSubmittingApp] = useState(false);

    useEffect(() => {
      if (!dbUser) return;

      // 1. Availability check
      setIsAvailable(dbUser.isAvailable !== false);
      setAvgRating(dbUser.rating || 5.0);

      // 2. Fetch jobs matching worker district
      const jobsQ = query(
        collection(db, 'jobPosts'),
        where('status', '==', 'open'),
        where('district', '==', dbUser.district || 'Ramanagara')
      );
      const unsubJobs = onSnapshot(jobsQ, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Filter jobs matches skills required
        const workerSkills = dbUser.skills || ['General'];
        const matched = docs.filter(j => 
          workerSkills.some(s => s.toLowerCase() === (j.skillRequired || '').toLowerCase())
        );
        setAvailableJobs(matched);
      });

      // 3. Fetch applications matching current user
      const appsQ = query(
        collection(db, 'worker_applications'),
        where('workerId', '==', dbUser.uid)
      );
      const unsubApps = onSnapshot(appsQ, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMyApplications(docs);
        setAppliedCount(docs.length);
        
        // Mock completed jobs count
        const completed = docs.filter(a => a.status === 'accepted').length;
        setCompletedCount(completed);
      });

      return () => {
        unsubJobs();
        unsubApps();
      };
    }, [dbUser]);

    const toggleAvailability = async () => {
      const nextVal = !isAvailable;
      setIsAvailable(nextVal);
      try {
        await setDoc(doc(db, 'users', dbUser.uid), { isAvailable: nextVal }, { merge: true });
        await setDoc(doc(db, 'workers', dbUser.uid), { isAvailable: nextVal }, { merge: true });
        toast.success(nextVal ? "You are now visible to employers!" : "Availability disabled");
      } catch (err) {
        console.error(err);
      }
    };

    const handleApplySubmit = async (e) => {
      e.preventDefault();
      if (!selectedJob) return;
      setSubmittingApp(true);

      try {
        await addDoc(collection(db, 'worker_applications'), {
          workerId: dbUser.uid,
          workerName: dbUser.name,
          workerSkills: dbUser.skills || ['General'],
          workerRating: avgRating,
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          posterId: selectedJob.posterId || 'anonymous',
          proposedRate: Number(proposedRate),
          message: coverMessage,
          status: 'pending',
          appliedAt: new Date().toISOString()
        });
        toast.success("Application submitted successfully!");
        setSelectedJob(null);
        setCoverMessage('');
      } catch (err) {
        console.error(err);
        toast.error("Failed to submit application");
      } finally {
        setSubmittingApp(false);
      }
    };

    return (
      <div className="space-y-6" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dbUser?.name}
                <span style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  Worker
                </span>
              </h2>
              {/* Skills chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {(dbUser?.skills || ['General']).map(s => (
                  <span key={s} style={{ background: theme.surface2, color: theme.text, border: '1px solid ' + theme.border, fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    {s}
                  </span>
                ))}
              </div>
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#FBBF24', fontSize: '13px', fontWeight: 'bold' }}>
                <Star size={16} fill="#FBBF24" /> {avgRating.toFixed(1)}
              </div>
            </div>
            
            {/* Availability Toggle */}
            <div style={{ display: 'flex', itemsCenter: 'center', gap: '12px', background: theme.surface2, padding: '12px 16px', borderRadius: '12px', border: '1px solid ' + theme.border }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>Available for Work</span>
                <span style={{ fontSize: '10px', color: theme.muted }}>Visible to employers nearby</span>
              </div>
              <button 
                onClick={toggleAvailability}
                style={{ 
                  background: isAvailable ? 'var(--success)' : '#64748B', 
                  border: 'none', borderRadius: '20px', width: '52px', height: '26px', 
                  cursor: 'pointer', transition: 'all 0.2s', padding: '2px', position: 'relative'
                }}
              >
                <div style={{ 
                  width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
                  transform: isAvailable ? 'translateX(26px)' : 'translateX(0)', transition: 'transform 0.2s'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', block: true }}>{appliedCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Jobs Applied</span>
          </div>
          <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', block: true }}>{completedCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Jobs Completed</span>
          </div>
          <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#FBBF24', block: true }}>{avgRating.toFixed(1)}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Average Rating</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => navigate('/workers')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <Briefcase size={24} className="text-amber-500" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.text }}>Browse Jobs</span>
          </button>
          <button onClick={() => navigate('/workers?tab=applications')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <FileText size={24} className="text-blue-500" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.text }}>My Applications</span>
          </button>
          <button onClick={() => navigate('/profile')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <User size={24} className="text-purple-500" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.text }}>Edit Profile</span>
          </button>
          <button onClick={() => navigate('/community')} style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            <MessageSquare size={24} className="text-blue-500" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: theme.text }}>Community</span>
          </button>
        </div>

        {/* Available Jobs Feed */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Available Job Posts Matches Your Skills
          </h3>
          {availableJobs.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>No matching job openings found in your district.</p>
          ) : (
            <div className="space-y-4">
              {availableJobs.map(job => (
                <div key={job.id} style={{ padding: '16px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: theme.text, display: 'block' }}>{job.title}</span>
                    <span style={{ fontSize: '11px', color: theme.muted }}>Skill required: {job.skillRequired} &bull; Daily rate: ₹{job.payPerDay}</span>
                    <span style={{ fontSize: '10px', color: theme.muted, display: 'block', marginTop: '4px' }}>Location: {job.village || 'Nearby'} &bull; Workers needed: {job.workersNeeded || 1}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setProposedRate(dbUser?.dailyRate || job.payPerDay || 400);
                    }}
                    style={{ background: theme.accent, border: 'none', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications Section */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            My Job Applications
          </h3>
          {myApplications.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>You haven't submitted any job applications yet.</p>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => {
                const isPending = app.status === 'pending';
                const isAccepted = app.status === 'accepted';
                const statusColor = isAccepted ? 'var(--success)' : isPending ? 'var(--warning)' : 'var(--danger)';
                const StatusIcon = isAccepted ? CheckCircle2 : isPending ? Clock : XCircle;

                return (
                  <div key={app.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>{app.jobTitle}</span>
                      <span style={{ fontSize: '10px', color: theme.muted }}>Proposed rate: ₹{app.proposedRate}/day</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                      <StatusIcon size={14} />
                      {app.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application Modal */}
        {selectedJob && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.text, margin: 0 }}>Apply for {selectedJob.title}</h3>
                <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: '18px' }}>&times;</button>
              </div>
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '6px' }}>Proposed Daily Rate (₹)</label>
                  <input 
                    type="number" 
                    value={proposedRate} 
                    onChange={e => setProposedRate(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.surface2, border: '1px solid ' + theme.border, color: theme.text, outline: 'none' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '6px' }}>Cover Message</label>
                  <textarea 
                    rows={3}
                    placeholder="Why are you the right person for this job?"
                    value={coverMessage} 
                    onChange={e => setCoverMessage(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.surface2, border: '1px solid ' + theme.border, color: theme.text, outline: 'none', resize: 'none' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingApp}
                  style={{ width: '100%', padding: '14px', background: theme.accent, border: 'none', color: '#fff', fontWeight: 800, borderRadius: '8px', cursor: submittingApp ? 'not-allowed' : 'pointer' }}
                >
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}
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
