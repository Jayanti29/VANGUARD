import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { useState, useEffect } from 'react'

export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg)',
      overflow: 'hidden'
    }}>
      {/* Sidebar - desktop only */}
      {!isMobile && (
        <Sidebar />
      )}

      {/* Main content area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        height: '100vh',
        overflow: 'hidden'
      }}>
        <TopBar />
        
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '16px 16px 80px 16px' : '24px 32px',
          width: '100%',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <Outlet />
        </main>

        {/* Bottom nav - mobile only */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  )
}
