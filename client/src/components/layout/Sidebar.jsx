import { NavLink } from 'react-router-dom'
import { Home, Map, MessageSquare, Users, AlertTriangle, 
         Bot, Building2, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { userProfile } = useAuth()
  const { t } = useTranslation()

  const navItems = [
    { path: '/', icon: Home, label: t('nav_home'), exact: true },
    { path: '/map', icon: Map, label: t('nav_map') },
    { path: '/community', icon: MessageSquare, label: t('nav_community') },
    { path: '/workers', icon: Users, label: t('nav_workers') },
    { path: '/emergency', icon: AlertTriangle, label: t('nav_emergency') },
    { path: '/ai', icon: Bot, label: t('nav_ai') },
    { path: '/officials', icon: Building2, label: t('nav_officials') },
    { path: '/profile', icon: User, label: t('nav_profile') },
  ]

  return (
    <aside style={{
      width: collapsed ? 72 : 220,
      flexShrink: 0,
      height: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      transition: 'width 0.2s ease',
      zIndex: 10,
    }}>
      {/* Logo header */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <img src="/vanguard-logo.png" alt="VANGUARD" 
                 style={{height: 28, width: 28, objectFit:'contain'}} />
            <span style={{fontWeight: 800, fontSize: 16, color: 'var(--text)', letterSpacing: 0.5}}>
              VANGUARD
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, display: 'flex',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav items - vertical stack, NOT grid/floating */}
      <nav style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '12px 8px',
        overflowY: 'auto',
      }}>
        {navItems.map(({ path, icon: Icon, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px' : '10px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: 14,
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            })}
          >
            <Icon size={19} style={{flexShrink: 0}} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>
          {(userProfile?.name || 'U')[0].toUpperCase()}
        </div>
        {!collapsed && (
          <div style={{minWidth: 0, overflow: 'hidden'}}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {userProfile?.name || 'User'}
            </div>
            <div style={{fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize'}}>
              {userProfile?.role || 'citizen'}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
