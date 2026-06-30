import { NavLink } from 'react-router-dom'
import { Home, Map, MessageSquare, Bot, User } from 'lucide-react'

export default function BottomNav() {
  const items = [
    { path: '/', icon: Home, exact: true },
    { path: '/map', icon: Map },
    { path: '/community', icon: MessageSquare },
    { path: '/ai', icon: Bot },
    { path: '/profile', icon: User },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(({ path, icon: Icon, exact }) => (
        <NavLink
          key={path}
          to={path}
          end={exact}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            textDecoration: 'none',
            flex: 1,
            padding: '6px 0',
          })}
        >
          <Icon size={22} />
        </NavLink>
      ))}
    </nav>
  )
}
