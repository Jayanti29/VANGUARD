import { Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' },
  { code: 'kn', label: 'ಕನ್ನಡ' }, { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' }, { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' }, { code: 'mr', label: 'ಮರಾठी' },
  { code: 'gu', label: 'ગુજરાતી' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' },
]

export default function TopBar() {
  const { userProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { i18n } = useTranslation()

  const handleLangChange = (e) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('vanguard_language', lang)
  }

  return (
    <header style={{
      height: 64,
      flexShrink: 0,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      gap: 16,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <img src="/vanguard-logo.png" alt="" 
             style={{height: 26, width: 26, objectFit:'contain'}} />
        <span style={{fontWeight:700, fontSize:15, color:'var(--text)'}}>
          VANGUARD
        </span>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
        <select
          value={i18n.language}
          onChange={handleLangChange}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 13,
            color: 'var(--text)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <button onClick={toggleTheme} style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text)',
        }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text)', position: 'relative',
        }}>
          <Bell size={16} />
        </button>

        <div style={{
          display:'flex', alignItems:'center', gap:8,
          paddingLeft: 12, borderLeft: '1px solid var(--border)',
        }}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>
              {userProfile?.name || 'User'}
            </div>
            <div style={{
              fontSize:10, color:'var(--accent)', fontWeight:600,
              textTransform:'capitalize',
            }}>
              {userProfile?.role || 'citizen'}
            </div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--accent-soft)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            {(userProfile?.name || 'U')[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
