import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Car, 
  Activity, 
  ShieldAlert, 
  Waves, 
  Zap, 
  MapPin, 
  Send,
  AlertTriangle,
  Users,
  Compass,
  ArrowLeft,
  HeartPulse,
  PhoneCall,
  Loader2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useLocation from '../hooks/useLocation';
import { db, collection, addDoc, onSnapshot, query, where } from '../lib/firebase';

const emergencyCategories = [
  { id: 'fire', label: 'Fire / आग 🚨', icon: Flame, color: 'bg-orange-600' },
  { id: 'accident', label: 'Accident / दुर्घटना 🚗', icon: Car, color: 'bg-blue-600' },
  { id: 'medical', label: 'Medical / चिकित्सा 🏥', icon: Activity, color: 'bg-red-600' },
  { id: 'crime', label: 'Crime / अपराध 👮', icon: ShieldAlert, color: 'bg-slate-700' },
  { id: 'flood', label: 'Flood / बाढ़ 🌊', icon: Waves, color: 'bg-cyan-600' },
  { id: 'electric', label: 'Electric / बिजली ⚡', icon: Zap, color: 'bg-yellow-600' }
];

export default function Emergency() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, dbUser } = useAuth();
  const { location, detectLocation } = useLocation();

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Simulated nearby facilities
  const [facilities, setFacilities] = useState([
    { name: 'Ramanagara District Hospital', type: 'hospital', distance: '1.2 km', phone: '+918023456789' },
    { name: 'Ramanagara Town Police Station', type: 'police', distance: '850 m', phone: '+918098765432' },
    { name: 'Fire Station Ramanagara', type: 'fire', distance: '2.4 km', phone: '101' }
  ]);

  // Listen to active emergencies in the same village
  useEffect(() => {
    if (!dbUser?.village) return;
    
    let unsubscribe = () => {};
    try {
      if (db.isMock) {
        unsubscribe = db.onSnapshotCollection({ name: 'emergencies' }, (data) => {
          const filtered = data
            .filter(e => e.village === dbUser.village && !e.isResolved)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setActiveAlerts(filtered);
        });
      } else {
        const emergenciesRef = collection(db, 'emergencies');
        const q = query(
          emergenciesRef,
          where('village', '==', dbUser.village),
          where('isResolved', '==', false)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = [];
          snapshot.forEach(docSnap => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setActiveAlerts(fetched);
        });
      }
    } catch (err) {
      console.error(err);
    }

    return () => unsubscribe();
  }, [dbUser?.village]);

  // Location detect trigger on category tap
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    detectLocation().catch(err => console.warn(err));
  };

  // Submit manual emergency
  const triggerEmergencyAlert = async () => {
    if (!selectedCategory) return;
    setSending(true);

    const payload = {
      reporterId: user?.uid || 'anonymous',
      reporterName: dbUser?.name || 'Citizen',
      category: selectedCategory.id,
      description: description,
      lat: location.lat,
      lng: location.lng,
      village: dbUser?.village || 'Ramanagara Town',
      ward: dbUser?.ward || 'Ward 6',
      radius: 1000, // 1km radius
      isResolved: false,
      respondersCount: 0,
      createdAt: new Date().toISOString()
    };

    try {
      if (db.isMock) {
        await db.addDoc({ name: 'emergencies' }, payload);
      } else {
        await addDoc(collection(db, 'emergencies'), payload);
      }

      setAlertSent(true);
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to post emergency alert:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] rounded-3xl bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 text-white p-6 relative overflow-hidden border border-red-900/60 shadow-xl">
      
      {/* Background visual pulse ripple */}
      <div className="absolute inset-0 bg-red-900/5 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-red-600 rounded-full blur-3xl opacity-10 animate-pulse" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {selectedCategory ? (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">🚨 Emergency Alert</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-bold">
                Reach community members and officials instantly.
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* CATEGORY GRID */}
          {!selectedCategory && !alertSent && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center py-2">
                Select Crisis Type
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {emergencyCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat)}
                      className="aspect-square bg-slate-900/60 hover:bg-red-950/30 border border-white/10 hover:border-red-600 rounded-2xl flex flex-col items-center justify-center text-center p-5 gap-3 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <div className={`w-14 h-14 ${cat.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-extrabold tracking-wide text-slate-200">
                        {cat.label.split(' / ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TRIGGER FORM */}
          {selectedCategory && !alertSent && (
            <motion.div
              key="trigger-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-white/5"
            >
              <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900/30 rounded-xl">
                <div className={`w-12 h-12 ${selectedCategory.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <selectedCategory.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-red-500 uppercase tracking-wider text-xs">Selected Category</h4>
                  <p className="text-base font-bold text-white">{selectedCategory.label.split(' / ')[0]} Emergency</p>
                </div>
              </div>

              {/* Description inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Description / विवरण (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Fire in wheat field / सड़क पर गंभीर कार दुर्घटना..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-red-600 min-h-[100px]"
                />
              </div>

              {/* Location display */}
              <div className="bg-slate-950 border border-white/10 p-4 rounded-xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>Verified Coordinates Address</span>
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {location.address || 'Locating device coordinates...'}
                </p>
              </div>

              {/* Trigger Alert buttons */}
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full min-h-[56px] bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/20 transition cursor-pointer active:scale-98"
              >
                <Send className="w-5 h-5 fill-white" />
                SEND EMERGENCY ALERT
              </button>
            </motion.div>
          )}

          {/* BROADCAST SENT SCREEN */}
          {alertSent && (
            <motion.div
              key="sent-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center py-6"
            >
              {/* Expanding Ripple animation */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-red-600 text-white rounded-full border-4 border-white dark:border-slate-800 shadow-xl animate-pulse-ring z-10">
                <AlertTriangle className="w-16 h-16 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-red-500">Alert Dispatched!</h3>
                <p className="text-sm font-semibold text-slate-300 max-w-sm mx-auto">
                  Alert has been broadcasted to all community members and district officials within 1km.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/community')}
                  className="flex-1 min-h-[52px] bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  Go to Emergency Chat
                </button>
                <button
                  type="button"
                  onClick={() => { setAlertSent(false); setSelectedCategory(null); setDescription(''); }}
                  className="flex-1 min-h-[52px] bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  Report Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* 6. Active Emergencies List */}
        {!selectedCategory && !alertSent && activeAlerts.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active Alerts Nearby ({activeAlerts.length})
            </h4>

            <div className="space-y-2.5">
              {activeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold capitalize text-white">
                        {alert.category} emergency
                      </p>
                      <p className="text-xs text-slate-300 truncate max-w-[240px]">
                        {alert.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 flex-shrink-0">
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Nearby Facility Helplines */}
        <div className="bg-slate-900/30 p-5 rounded-2xl border border-white/5 text-left space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <HeartPulse className="w-4.5 h-4.5 text-red-500" />
            Nearby Crisis Helplines
          </h4>
          
          <div className="divide-y divide-white/5">
            {facilities.map((fac) => (
              <div key={fac.name} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div>
                  <h5 className="text-sm font-bold text-slate-200">{fac.name}</h5>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {fac.type} • {fac.distance} away
                  </span>
                </div>
                <a
                  href={`tel:${fac.phone}`}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-red-500 transition"
                  title="Call Facility"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CONFIRMATION DIALOG */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-red-900 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white">Broadcast Emergency?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will trigger a high-priority alert to **ALL** registered community members and local officials. Please proceed only for real emergencies.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 min-h-[44px] bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={sending}
                onClick={triggerEmergencyAlert}
                className="w-1/2 min-h-[44px] bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {sending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Send Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
