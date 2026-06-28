import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import { seedOfficials } from './lib/seedData'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import './lib/i18n' // import to initialize translation engine

// Pages
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import ReportIssue from './pages/ReportIssue'
import IssueDetail from './pages/IssueDetail'
import IssueMap from './pages/IssueMap'
import Community from './pages/Community'
import Workers from './pages/Workers'
import Emergency from './pages/Emergency'
import AIAssistant from './pages/AIAssistant'
import Officials from './pages/Officials'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

// Components
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import TopBar from './components/layout/TopBar'

function AppLayout() {
  const { dbUser } = useAuth()
  
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
      <Sidebar />
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
            <Route 
              path="/admin" 
              element={
                (dbUser?.role || '').toLowerCase() === 'official' 
                  ? <AdminDashboard /> 
                  : <Navigate to="/" replace />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  useEffect(() => {
    seedOfficials()
  }, [])

  return (
    <ThemeProvider>
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
              {/* Public routes */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected routes wrapped in ProtectedRoute */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
