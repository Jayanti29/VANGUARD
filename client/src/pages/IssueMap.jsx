import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  GoogleMap, 
  useJsApiLoader, 
  Marker, 
  InfoWindow 
} from '@react-google-maps/api';
import { 
  MapPin, 
  Users, 
  ArrowRight, 
  Navigation,
  Building,
  Phone,
  Mail,
  SlidersHorizontal,
  Compass,
  AlertTriangle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useIssues from '../hooks/useIssues';
import SeverityBadge from '../components/ui/SeverityBadge';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function IssueMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dbUser } = useAuth();
  const { issues } = useIssues();

  const [activeTab, setActiveTab] = useState('issues'); // 'issues' | 'officials'
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'road' | 'electric' | 'water'
  const [selectedPin, setSelectedPin] = useState(null); // issue or official
  const [showFilters, setShowFilters] = useState(false);

  // Set default center coordinates to user coords or Ramanagara
  const mapCenter = {
    lat: dbUser?.lat || 12.7244,
    lng: dbUser?.lng || 77.2911
  };

  // 10 sample officials with realistic Indian names and roles
  const sampleOfficials = [
    { id: 'off_1', name: 'Dr. Srinivas Prasad', role: 'Chief Medical Officer', department: 'Health', lat: mapCenter.lat + 0.0015, lng: mapCenter.lng + 0.002, phone: '+918023456789', email: 'srinivas.p@karnataka.gov.in' },
    { id: 'off_2', name: 'Kiran Gowda', role: 'Ward 6 Assistant Engineer', department: 'Electricity', lat: mapCenter.lat - 0.002, lng: mapCenter.lng + 0.001, phone: '+919845012345', email: 'kiran.g@bescom.co.in' },
    { id: 'off_3', name: 'Rajeshwari M.', role: 'Chief Sanitation Inspector', department: 'Municipality', lat: mapCenter.lat + 0.0025, lng: mapCenter.lng - 0.0015, phone: '+918023451122', email: 'rajeshwari.m@ramanagara.gov.in' },
    { id: 'off_4', name: 'Inspector Anil Kumar', role: 'Circle Inspector', department: 'Police', lat: mapCenter.lat - 0.001, lng: mapCenter.lng - 0.0025, phone: '100', email: 'anil.k@ksp.gov.in' },
    { id: 'off_5', name: 'Manjunatha Swamy', role: 'Sewerage Line Inspector', department: 'Water', lat: mapCenter.lat + 0.0005, lng: mapCenter.lng - 0.003, phone: '+919900112233', email: 'manju.s@bwssb.gov.in' }
  ];

  // Loader check for Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || ''
  });

  // Filter Issues logic
  const getFilteredIssues = () => {
    if (!issues) return [];
    return issues.filter((issue) => {
      // 1. Category filters
      if (filter === 'critical' && issue.severity !== 'red') return false;
      if (filter === 'road' && issue.category !== 'broken_road' && issue.category !== 'pothole') return false;
      if (filter === 'electric' && issue.category !== 'electrical_wire' && issue.category !== 'broken_streetlight') return false;
      if (filter === 'water' && issue.category !== 'water_leakage' && issue.category !== 'open_drain' && issue.category !== 'sewage') return false;
      return true;
    });
  };

  const getFilteredOfficials = () => {
    if (filter === 'electric') return sampleOfficials.filter(o => o.department === 'Electricity');
    if (filter === 'water') return sampleOfficials.filter(o => o.department === 'Water');
    if (filter === 'road') return sampleOfficials.filter(o => o.department === 'Municipality');
    return sampleOfficials;
  };

  const filteredIssues = getFilteredIssues();
  const filteredOfficials = getFilteredOfficials();

  // Helper colors mapping for pins
  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'red': return '#DC2626';
      case 'orange': return '#EA580C';
      case 'yellow': return '#EAB308';
      case 'green':
      default: return '#16A34A';
    }
  };

  // Renders the bottom sheet info card
  const renderBottomSheet = () => {
    if (!selectedPin) return null;

    const isIssue = selectedPin.reporterId !== undefined;

    return (
      <motion.div 
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="fixed bottom-[72px] md:bottom-6 left-4 right-4 md:left-[270px] md:right-6 bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 p-4 shadow-xl z-50 flex gap-4 max-w-xl mx-auto"
      >
        <button 
          onClick={() => setSelectedPin(null)}
          className="absolute top-2.5 right-2.5 w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full flex items-center justify-center text-text-muted"
        >
          <XIcon className="w-4 h-4" />
        </button>

        {isIssue ? (
          <>
            {/* Left side thumbnail preview */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-border dark:border-slate-600">
              <img 
                src={selectedPin.photoUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80'} 
                alt="Selected" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Info details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                    {selectedPin.categoryLabel || selectedPin.category}
                  </span>
                  <SeverityBadge severity={selectedPin.severity} />
                </div>
                <h4 className="text-sm font-bold text-text dark:text-white truncate mt-1">
                  {selectedPin.title || selectedPin.description}
                </h4>
                <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>{selectedPin.confirmations?.length || 0} residents confirmed</span>
                </p>
              </div>
              
              <button
                onClick={() => navigate(`/issues/${selectedPin.id}`)}
                className="text-xs text-accent dark:text-blue-400 font-bold flex items-center gap-1 hover:underline mt-2 self-start"
              >
                View Full Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Official Info Bottom Sheet */}
            <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
              <div>
                <h4 className="text-sm font-bold text-text dark:text-white truncate">
                  {selectedPin.name}
                </h4>
                <p className="text-xs text-text-muted font-semibold mt-0.5">{selectedPin.role}</p>
                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 uppercase">
                  {selectedPin.department}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <a 
                  href={`tel:${selectedPin.phone}`}
                  className="h-9 px-3 bg-accent text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-opacity-95"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a 
                  href={`mailto:${selectedPin.email}`}
                  className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-text dark:text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  // Rendering fully premium Interactive Mock Map Fallback if API key fails or loads in mock mode
  const renderMockMap = () => {
    return (
      <div className="h-[calc(100vh-210px)] md:h-[calc(100vh-160px)] w-full rounded-2xl bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-700 relative overflow-hidden flex flex-col items-center justify-center">
        
        {/* Mock Map Background Visual grid grid-layout */}
        <div className="absolute inset-0 bg-blue-50/5 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_1.5px,transparent_1.5px)] bg-[size:16px_16px]" />
        </div>

        {/* Dynamic Mock Map Roads layout */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[40%] left-0 right-0 h-4 bg-slate-400 dark:bg-slate-700 transform rotate-1" />
          <div className="absolute top-0 bottom-0 left-[50%] w-4 bg-slate-400 dark:bg-slate-700 transform -rotate-3" />
          <div className="absolute top-[20%] bottom-0 right-[20%] w-4 bg-slate-400 dark:bg-slate-700 transform rotate-45" />
        </div>

        {/* User Current Location marker */}
        <div 
          className="absolute w-8 h-8 flex items-center justify-center pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <span className="absolute w-6 h-6 bg-accent rounded-full opacity-35 animate-ping" />
          <span className="w-3.5 h-3.5 bg-accent rounded-full border-2 border-white shadow-md z-10" />
        </div>

        {/* Mock Map Pins mapping (Issues) */}
        {activeTab === 'issues' && filteredIssues.map((issue, idx) => {
          // Deterministic mock lat offset placement relative to mapCenter
          const latDiff = (issue.lat - mapCenter.lat) * 25000;
          const lngDiff = (issue.lng - mapCenter.lng) * 25000;
          const topPercent = Math.min(85, Math.max(15, 50 - latDiff));
          const leftPercent = Math.min(85, Math.max(15, 50 + lngDiff));

          const pinColor = getSeverityColor(issue.severity);

          return (
            <button
              key={issue.id}
              onClick={() => setSelectedPin(issue)}
              className="absolute group flex flex-col items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer z-10"
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                style={{ backgroundColor: pinColor }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="hidden group-hover:block absolute bottom-8 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-md">
                {issue.categoryLabel || issue.category}
              </span>
            </button>
          );
        })}

        {/* Mock Map Pins mapping (Officials) */}
        {activeTab === 'officials' && filteredOfficials.map((off, idx) => {
          const latDiff = (off.lat - mapCenter.lat) * 25000;
          const lngDiff = (off.lng - mapCenter.lng) * 25000;
          const topPercent = Math.min(85, Math.max(15, 50 - latDiff));
          const leftPercent = Math.min(85, Math.max(15, 50 + lngDiff));

          return (
            <button
              key={off.id}
              onClick={() => setSelectedPin(off)}
              className="absolute group flex flex-col items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer z-10"
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Building className="w-4 h-4" />
              </div>
              <span className="hidden group-hover:block absolute bottom-9 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-md">
                {off.name}
              </span>
            </button>
          );
        })}

        {/* Bottom map metadata controls */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded font-bold backdrop-blur-sm">
          Simulated map interface active • Ramanagara Rural
        </div>

        {/* Reset location button */}
        <button
          onClick={() => { setSelectedPin(null); }}
          className="absolute bottom-4 right-4 w-12 h-12 bg-surface hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text dark:text-white rounded-xl shadow-lg flex items-center justify-center border border-border dark:border-slate-700 cursor-pointer transition active:scale-95"
          title="Recenter"
        >
          <Compass className="w-5 h-5 text-accent" />
        </button>
      </div>
    );
  };

  // Filter chips list
  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: '🔴 Critical' },
    { id: 'road', label: '🟡 Road / Infrastructure' },
    { id: 'electric', label: '⚡ Electricity' },
    { id: 'water', label: '💧 Water & Sewage' }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header controls overlay */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        
        {/* Toggle between Issues/Officials */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex gap-1.5 self-start">
          <button
            onClick={() => { setActiveTab('issues'); setSelectedPin(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
              activeTab === 'issues' 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-text-muted hover:text-text dark:text-slate-300'
            }`}
          >
            Reported Issues
          </button>
          <button
            onClick={() => { setActiveTab('officials'); setSelectedPin(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
              activeTab === 'officials' 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-text-muted hover:text-text dark:text-slate-300'
            }`}
          >
            Officials Directory
          </button>
        </div>

        {/* Toggle Filters bar */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="min-h-[44px] px-4 bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-text-muted hover:text-text cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter Listings
        </button>
      </div>

      {/* 2. Horizontal Filter chips overlay */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                filter === chip.id
                  ? 'bg-accent border-accent text-white shadow-sm'
                  : 'bg-surface dark:bg-slate-800 border-border dark:border-slate-700 text-text-muted hover:text-text'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* 3. Render Google Maps / Simulated Map Fallback */}
      {isLoaded ? (
        // Renders actual Google Map if key loaded
        <div className="h-[calc(100vh-210px)] md:h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden border border-border dark:border-slate-700 relative shadow-sm">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={14}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            }}
          >
            {/* User Current position marker */}
            <Marker 
              position={mapCenter} 
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 7,
                fillColor: '#1B6FD8',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
              }}
            />

            {/* Render Issues pins */}
            {activeTab === 'issues' && filteredIssues.map(issue => (
              <Marker
                key={issue.id}
                position={{ lat: Number(issue.lat), lng: Number(issue.lng) }}
                onClick={() => setSelectedPin(issue)}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE,
                  scale: 10,
                  fillColor: getSeverityColor(issue.severity),
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2
                }}
              />
            ))}

            {/* Render Officials pins */}
            {activeTab === 'officials' && filteredOfficials.map(off => (
              <Marker
                key={off.id}
                position={{ lat: Number(off.lat), lng: Number(off.lng) }}
                onClick={() => setSelectedPin(off)}
                label="🏛"
              />
            ))}
          </GoogleMap>

          {/* Reset location button overlay */}
          <button
            onClick={() => setSelectedPin(null)}
            className="absolute bottom-4 right-4 w-12 h-12 bg-surface hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text dark:text-white rounded-xl shadow-lg flex items-center justify-center border border-border dark:border-slate-700 cursor-pointer"
          >
            <Compass className="w-5 h-5 text-accent" />
          </button>
        </div>
      ) : (
        renderMockMap()
      )}

      {/* 4. Tapping pin Bottom Info Sheet */}
      <AnimatePresence>
        {selectedPin && renderBottomSheet()}
      </AnimatePresence>
    </div>
  );
}

// Simple icons
function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
