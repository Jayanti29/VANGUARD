import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import { seedOfficials } from './lib/seedData';
import ProtectedRoute from './components/ProtectedRoute';
import './lib/i18n'; // import to initialize translation engine

// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import IssueMap from './pages/IssueMap';
import Community from './pages/Community';
import Workers from './pages/Workers';
import Emergency from './pages/Emergency';
import AIAssistant from './pages/AIAssistant';
import Officials from './pages/Officials';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import TopBar from './components/layout/TopBar';

// Helper Protected Route Layout Wrapper
function AppLayout() {
  const { user, dbUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-text-muted">Verifying Credentials...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user is authenticated but hasn't set up location/profile settings, redirect to onboarding
  // Allow Onboarding route itself to pass through
  const isProfileIncomplete = !dbUser?.village;
  if (isProfileIncomplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg dark:bg-slate-950 text-text dark:text-slate-100 overflow-x-hidden">
      {/* Sidebar on desktop */}
      <Sidebar />

      {/* Main body content */}
      <div className="flex-1 flex flex-col min-w-0 pb-[72px] md:pb-0">
        <TopBar />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/map" element={<IssueMap />} />
            <Route path="/community" element={<Community />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/officials" element={<Officials />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin only route */}
            <Route 
              path="/admin" 
              element={
                dbUser?.role === 'Official' 
                  ? <AdminDashboard /> 
                  : <Navigate to="/" replace />
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Bottom nav bar on mobile devices */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Seed default officials and workers on load
    seedOfficials();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Toaster 
            position="top-center" 
            reverseOrder={false}
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#0F2B4E',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600'
              }
            }}
          />
          <Routes>
            {/* Public/wizard routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected application layout */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
