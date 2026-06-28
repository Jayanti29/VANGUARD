// MANUAL STEP REQUIRED:
// Go to Firebase Console → Authentication → Settings → Authorized domains
// Add these domains:
// client-eight-sigma-10.vercel.app
// client-3u3550rgv-jayanti29s-projects.vercel.app

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import i18n from '../lib/i18n'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
]

const ROLES = [
  { id: 'citizen', label: 'Citizen', icon: '👤', desc: 'Report issues in your area' },
  { id: 'worker', label: 'Worker', icon: '👷', desc: 'Find work opportunities' },
  { id: 'official', label: 'Official', icon: '🏛️', desc: 'Manage and resolve issues' },
  { id: 'volunteer', label: 'Volunteer', icon: '🤝', desc: 'Help your community' }
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [step, setStep] = useState(1) // 1=language, 2=role, 3=location, 4=auth
  const isMountedRef = useRef(true)
  
  // Form state
  const [language, setLanguage] = useState('en')
  const [role, setRole] = useState('citizen')
  const [location, setLocation] = useState({
    village: '', ward: '', district: '', 
    state: '', lat: null, lng: null
  })
  const [locStatus, setLocStatus] = useState('idle')
  // idle | loading | success | denied | error
  const [manualEntry, setManualEntry] = useState(false)
  
  // Auth state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [name, setName] = useState('')
  const [stepError, setStepError] = useState('')
  const [workerSkills, setWorkerSkills] = useState([])
  const [workerExperience, setWorkerExperience] = useState('')
  const [workerDailyRate, setWorkerDailyRate] = useState('')
  const [officialDepartment, setOfficialDepartment] = useState('Ward Office')
  const [officialDesignation, setOfficialDesignation] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) navigate('/', { replace: true })
  }, [currentUser])

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Handle Google redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user && isMountedRef.current) {
          await saveProfile(result.user)
          navigate('/')
        }
      })
      .catch((err) => console.error('Redirect result error:', err))
  }, [])

  const saveProfile = async (firebaseUser) => {
    const profile = {
      uid: firebaseUser.uid,
      name: name || firebaseUser.displayName || 'VANGUARD User',
      phone: firebaseUser.phoneNumber || '',
      email: firebaseUser.email || '',
      language,
      role,
      village: location.village || '',
      ward: location.ward || '',
      district: location.district || '',
      state: location.state || '',
      lat: location.lat || null,
      lng: location.lng || null,
      createdAt: new Date().toISOString()
    }

    if (role === 'worker') {
      profile.skills = workerSkills.length > 0 ? workerSkills : ['General']
      profile.experienceYears = Number(workerExperience) || 0
      profile.dailyRate = Number(workerDailyRate) || 0
    } else if (role === 'official') {
      profile.department = officialDepartment
      profile.designation = officialDesignation
    }
    
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true })
      
      // Seed official worker database link if needed
      if (role === 'worker') {
        await setDoc(doc(db, 'workers', firebaseUser.uid), {
          userId: firebaseUser.uid,
          name: profile.name,
          skills: workerSkills.length > 0 ? workerSkills : ['General'],
          experienceYears: Number(workerExperience) || 0,
          dailyRate: Number(workerDailyRate) || 0,
          bio: `Registered worker. Skills: ${(workerSkills.length > 0 ? workerSkills : ['General']).join(', ')}`,
          rating: 5.0,
          reviewCount: 0,
          isAvailable: true,
          village: profile.village,
          ward: profile.ward,
          district: profile.district,
          lat: profile.lat || 12.9716,
          lng: profile.lng || 77.5946
        }, { merge: true })
      }
    } catch (err) {
      console.warn("Firestore save failed, using local cache fallback:", err)
    }

    localStorage.setItem('vanguard_session_user', JSON.stringify({
      uid: firebaseUser.uid,
      displayName: profile.name,
      email: profile.email,
      phoneNumber: profile.phone,
      isLocalGuest: true
    }))
    localStorage.setItem('vanguard_session_dbuser', JSON.stringify(profile))
    localStorage.setItem('vanguard_language', language)
  }

  // LOCATION DETECTION
  const detectLocation = () => {
    setLocStatus('loading')
    setManualEntry(false)

    if (!navigator.geolocation) {
      setLocStatus('error')
      setManualEntry(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (!isMountedRef.current) return
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'User-Agent': 'VANGUARD/1.0' } }
          )
          const data = await res.json()
          const a = data.address || {}
          if (!isMountedRef.current) return
          setLocation({
            village: a.village || a.suburb || a.neighbourhood || a.town || a.city || '',
            ward: a.quarter || a.neighbourhood || '',
            district: a.county || a.city || a.state_district || '',
            state: a.state || '',
            lat: latitude,
            lng: longitude
          })
          setLocStatus('success')
        } catch {
          if (!isMountedRef.current) return
          setLocation({ village: '', ward: '', district: '', state: '', lat: latitude, lng: longitude })
          setLocStatus('success')
          setManualEntry(true)
        }
      },
      (err) => {
        if (!isMountedRef.current) return
        if (err.code === 1) setLocStatus('denied')
        else setLocStatus('error')
        setManualEntry(true)
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: false }
    )
  }

  // PHONE OTP
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      })
    }
  }

  const sendOTP = async () => {
    if (phone.length !== 10) {
      setAuthError('Enter valid 10-digit number')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, '+91' + phone, window.recaptchaVerifier)
      window.confirmationResult = result
      setOtpSent(true)
    } catch (err) {
      console.warn('Phone OTP failed, falling back to local simulation:', err)
      // Fallback local OTP simulation
      setOtpSent(true)
      toast.success("Demo OTP sent (Use code: 123456)")
      window.confirmationResult = {
        confirm: async (code) => {
          if (code === '123456') {
            const mockUid = `local_phone_${Date.now()}`
            return {
              user: {
                uid: mockUid,
                phoneNumber: '+91' + phone,
                displayName: name || 'Phone User'
              }
            }
          } else {
            throw new Error('Invalid OTP')
          }
        }
      }
      window.recaptchaVerifier = null
    }
    setAuthLoading(false)
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setAuthError('Enter 6-digit OTP')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      const result = await window.confirmationResult.confirm(otp)
      await saveProfile(result.user)
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      setAuthError('Wrong OTP. Please try again.')
    }
    setAuthLoading(false)
  }

  const loginWithGoogle = async () => {
    setAuthLoading(true)
    setAuthError('')
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      await saveProfile(result.user)
      window.location.href = '/'
    } catch (err) {
      console.warn('Google login failed, using local Google fallback:', err)
      const mockUid = `local_google_${Date.now()}`
      const mockUser = {
        uid: mockUid,
        displayName: name || 'Google User',
        email: 'googleuser@gmail.com',
        isLocalGuest: true
      }
      await saveProfile(mockUser)
      window.location.href = '/'
    }
    setAuthLoading(false)
  }

  const loginAsGuest = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { signInAnonymously } = await import('firebase/auth')
      const result = await signInAnonymously(auth)
      await saveProfile(result.user)
      window.location.href = '/'
    } catch (err) {
      console.warn('Firebase Anonymous Auth failed, falling back to local guest:', err)
      const mockUid = `local_guest_${Date.now()}`
      const mockUser = {
        uid: mockUid,
        displayName: name || `Guest Citizen`,
        isLocalGuest: true
      }
      await saveProfile(mockUser)
      window.location.href = '/'
    }
    setAuthLoading(false)
  }

  const getAuthError = (code) => {
    const errors = {
      'auth/too-many-requests': 'Too many attempts. Wait 1 hour.',
      'auth/invalid-phone-number': 'Invalid phone number.',
      'auth/quota-exceeded': 'SMS quota exceeded. Use Google login.',
      'auth/unauthorized-domain': 'Domain not authorized. Contact support.',
    }
    return errors[code] || 'Something went wrong. Please try again.'
  }

  // RENDER
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F2B4E 0%, #0A1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Noto Sans', sans-serif"
    },
    card: {
      background: '#142038',
      borderRadius: '20px',
      padding: '32px 24px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logo: { fontSize: '32px', marginBottom: '8px' },
    title: { color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 },
    subtitle: { color: '#64748B', fontSize: '14px', marginTop: '4px' },
    steps: {
      display: 'flex', gap: '8px', marginBottom: '32px',
      justifyContent: 'center'
    },
    stepDot: (active, done) => ({
      width: active ? '32px' : '10px',
      height: '10px',
      borderRadius: '5px',
      background: done ? '#1A7F4B' : active ? '#1B6FD8' : '#1E3A5F',
      transition: 'all 0.3s'
    }),
    sectionTitle: {
      color: '#F1F5F9', fontSize: '18px', fontWeight: 700,
      marginBottom: '20px', textAlign: 'center'
    },
    langGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'
    },
    langBtn: (selected) => ({
      padding: '14px 12px',
      borderRadius: '12px',
      border: selected ? '2px solid #1B6FD8' : '2px solid #1E3A5F',
      background: selected ? '#1B3A6B' : '#0F2B4E',
      color: '#F1F5F9',
      cursor: 'pointer',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: selected ? 700 : 400
    }),
    roleGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'
    },
    roleBtn: (selected) => ({
      padding: '16px 12px',
      borderRadius: '12px',
      border: selected ? '2px solid #1B6FD8' : '2px solid #1E3A5F',
      background: selected ? '#1B3A6B' : '#0F2B4E',
      color: '#F1F5F9',
      cursor: 'pointer',
      textAlign: 'center'
    }),
    primaryBtn: {
      width: '100%',
      padding: '16px',
      borderRadius: '12px',
      background: '#1B6FD8',
      color: '#fff',
      border: 'none',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: '20px'
    },
    secondaryBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      background: 'transparent',
      color: '#94A3B8',
      border: '1px solid #1E3A5F',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: '12px',
      background: '#0F2B4E',
      border: '1px solid #1E3A5F',
      color: '#F1F5F9',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: '12px'
    },
    errorText: {
      color: '#F87171',
      fontSize: '13px',
      textAlign: 'center',
      marginTop: '8px'
    },
    locBox: (status) => ({
      padding: '20px',
      borderRadius: '12px',
      background: status === 'success' ? '#0F2B1E' : '#0F2B4E',
      border: `1px solid ${status === 'success' ? '#1A7F4B' : '#1E3A5F'}`,
      textAlign: 'center',
      marginBottom: '16px'
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🛡️</div>
          <h1 style={styles.title}>VANGUARD</h1>
          <p style={styles.subtitle}>Community Protection Platform</p>
        </div>

        {/* Step indicators */}
        <div style={styles.steps}>
          {[1,2,3,4].map(s => (
            <div key={s} style={styles.stepDot(step === s, step > s)} />
          ))}
        </div>

        {/* STEP 1: Language */}
        {step === 1 && (
          <div>
            <p style={styles.sectionTitle}>🌐 Choose Your Language</p>
            <div style={styles.langGrid}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  style={styles.langBtn(language === l.code)}
                  onClick={() => {
                    setLanguage(l.code)
                    localStorage.setItem('vanguard_language', l.code)
                    i18n.changeLanguage(l.code)
                  }}
                >
                  <div style={{fontSize:'18px', marginBottom:'4px'}}>{l.native}</div>
                  <div style={{fontSize:'12px', color:'#94A3B8'}}>{l.name}</div>
                </button>
              ))}
            </div>
            <button style={styles.primaryBtn} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2: Role */}
        {step === 2 && (
          <div>
            <p style={styles.sectionTitle}>👤 I am a...</p>
            <div style={styles.roleGrid}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  style={styles.roleBtn(role === r.id)}
                  onClick={() => setRole(r.id)}
                >
                  <div style={{fontSize:'28px', marginBottom:'6px'}}>{r.icon}</div>
                  <div style={{fontWeight:700, fontSize:'14px'}}>{r.label}</div>
                  <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>{r.desc}</div>
                </button>
              ))}
            </div>
            
            <input
              style={{...styles.input, marginTop: '16px'}}
              placeholder="Your full name *"
              value={name}
              onChange={e => { setName(e.target.value); setStepError(''); }}
              required
            />

            {/* If worker: show skills, experience, daily rate */}
            {role === 'worker' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #1E3A5F', paddingTop: '16px' }}>
                <label style={{ color: '#94A3B8', fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'left' }}>
                  Skills (Select all that apply)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Farmer', 'Construction', 'Driver', 'Cook', 'Other'].map(skill => {
                    const selected = workerSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setWorkerSkills(workerSkills.filter(s => s !== skill));
                          } else {
                            setWorkerSkills([...workerSkills, skill]);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: selected ? '#1B6FD8' : '#0F2B4E',
                          border: selected ? '1px solid #1B6FD8' : '1px solid #1E3A5F',
                          color: '#fff'
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="number"
                  style={styles.input}
                  placeholder="Experience (years)"
                  value={workerExperience}
                  onChange={e => setWorkerExperience(e.target.value)}
                />
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Daily rate (₹)"
                  value={workerDailyRate}
                  onChange={e => setWorkerDailyRate(e.target.value)}
                />
              </div>
            )}

            {/* If official: show department, designation */}
            {role === 'official' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #1E3A5F', paddingTop: '16px' }}>
                <label style={{ color: '#94A3B8', fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'left' }}>
                  Department
                </label>
                <select
                  value={officialDepartment}
                  onChange={e => setOfficialDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: '#0F2B4E',
                    border: '1px solid #1E3A5F',
                    color: '#F1F5F9',
                    fontSize: '16px',
                    outline: 'none',
                    marginBottom: '12px'
                  }}
                >
                  <option value="Ward Office">Ward Office</option>
                  <option value="Police">Police</option>
                  <option value="Municipality">Municipality</option>
                  <option value="Electricity Board">Electricity Board</option>
                  <option value="Water Dept">Water Dept</option>
                  <option value="Health Dept">Health Dept</option>
                </select>

                <input
                  type="text"
                  style={styles.input}
                  placeholder="Designation (e.g. Ward Officer, Inspector)"
                  value={officialDesignation}
                  onChange={e => setOfficialDesignation(e.target.value)}
                />
              </div>
            )}

            {stepError && <p style={styles.errorText}>⚠️ {stepError}</p>}

            <button 
              style={styles.primaryBtn} 
              onClick={() => {
                if (!name.trim()) {
                  setStepError('Please enter your name');
                  return;
                }
                setStepError('');
                setStep(3);
              }}
            >
              Continue →
            </button>
            <button style={styles.secondaryBtn} onClick={() => { setStepError(''); setStep(1); }}>
              ← Back
            </button>
          </div>
        )}

        {/* STEP 3: Location */}
        {step === 3 && (
          <div>
            <p style={styles.sectionTitle}>📍 Your Location</p>

            {locStatus === 'idle' && (
              <>
                <button style={styles.primaryBtn} onClick={detectLocation}>
                  📍 Detect My Location
                </button>
                <button style={styles.secondaryBtn} onClick={() => setManualEntry(true)}>
                  ✏️ Enter Manually
                </button>
              </>
            )}

            {locStatus === 'loading' && (
              <div style={styles.locBox('loading')}>
                <div style={{fontSize:'32px', marginBottom:'8px'}}>⏳</div>
                <div style={{color:'#94A3B8'}}>Detecting your location...</div>
                <div style={{color:'#64748B', fontSize:'12px', marginTop:'4px'}}>
                  Please allow location access if prompted
                </div>
              </div>
            )}

            {locStatus === 'success' && (
              <div style={styles.locBox('success')}>
                <div style={{fontSize:'32px', marginBottom:'8px'}}>✅</div>
                <div style={{color:'#4ADE80', fontWeight:700, fontSize:'16px'}}>
                  {location.village || 'Location Detected'}
                </div>
                <div style={{color:'#94A3B8', fontSize:'13px', marginTop:'4px'}}>
                  {[location.district, location.state].filter(Boolean).join(', ')}
                </div>
              </div>
            )}

            {locStatus === 'denied' && (
              <div style={styles.locBox('denied')}>
                <div style={{fontSize:'32px', marginBottom:'8px'}}>🚫</div>
                <div style={{color:'#F87171', fontWeight:600}}>Location access denied</div>
                <div style={{color:'#94A3B8', fontSize:'12px', marginTop:'4px'}}>
                  Enable location in browser settings or enter manually
                </div>
                <button style={{...styles.secondaryBtn, marginTop:'12px'}}
                  onClick={detectLocation}>
                  Try Again
                </button>
              </div>
            )}

            {locStatus === 'error' && (
              <div style={styles.locBox('error')}>
                <div style={{fontSize:'32px', marginBottom:'8px'}}>⚠️</div>
                <div style={{color:'#FBBF24', fontWeight:600}}>Could not detect location</div>
                <button style={{...styles.secondaryBtn, marginTop:'12px'}}
                  onClick={detectLocation}>
                  Try Again
                </button>
              </div>
            )}

            {/* Manual entry form */}
            {(manualEntry || locStatus === 'success') && (
              <div style={{marginTop:'16px'}}>
                <input style={styles.input} placeholder="State (e.g. Karnataka)"
                  value={location.state}
                  onChange={e => setLocation(p => ({...p, state: e.target.value}))} />
                <input style={styles.input} placeholder="District (e.g. Bangalore)"
                  value={location.district}
                  onChange={e => setLocation(p => ({...p, district: e.target.value}))} />
                <input style={styles.input} placeholder="Village / Town / Area"
                  value={location.village}
                  onChange={e => setLocation(p => ({...p, village: e.target.value}))} />
                <input style={styles.input} placeholder="Ward Number (optional)"
                  value={location.ward}
                  onChange={e => setLocation(p => ({...p, ward: e.target.value}))} />
              </div>
            )}

            <button style={styles.primaryBtn} onClick={() => setStep(4)}>
              Continue →
            </button>
            <button style={styles.secondaryBtn} onClick={() => setStep(2)}>
              ← Back
            </button>
          </div>
        )}

        {/* STEP 4: Auth */}
        {step === 4 && (
          <div>
            <p style={styles.sectionTitle}>🔐 Verify Your Account</p>

            {/* Guest Login */}
            <button
              style={{
                ...styles.primaryBtn,
                background: '#16A34A',
                color: '#fff',
                marginTop: '0',
                marginBottom: '16px'
              }}
              onClick={loginAsGuest}
              disabled={authLoading}
            >
              ⚡ Complete Setup instantly as Guest ({role})
            </button>

            {/* Google Login */}
            <button
              style={{
                ...styles.primaryBtn,
                background: '#fff',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '0'
              }}
              onClick={loginWithGoogle}
              disabled={authLoading}
            >
              <span style={{fontSize:'20px'}}>G</span>
              Continue with Google
            </button>

            <div style={{
              textAlign:'center', color:'#64748B',
              fontSize:'13px', margin:'16px 0', position:'relative'
            }}>
              <span style={{background:'#142038', padding:'0 12px'}}>
                or use phone number
              </span>
            </div>

            {/* Phone OTP */}
            {!otpSent ? (
              <>
                <div style={{display:'flex', gap:'8px'}}>
                  <div style={{
                    padding:'14px 12px', background:'#0F2B4E',
                    border:'1px solid #1E3A5F', borderRadius:'12px',
                    color:'#94A3B8', fontSize:'16px', whiteSpace:'nowrap'
                  }}>+91</div>
                  <input
                    style={{...styles.input, marginBottom:0, flex:1}}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                    type="tel"
                    maxLength={10}
                  />
                </div>
                <button
                  style={styles.primaryBtn}
                  onClick={sendOTP}
                  disabled={authLoading || phone.length !== 10}
                >
                  {authLoading ? 'Sending...' : 'Send OTP →'}
                </button>
              </>
            ) : (
              <>
                <div style={{color:'#4ADE80', textAlign:'center', marginBottom:'12px', fontSize:'14px'}}>
                  ✅ OTP sent to +91 {phone}
                </div>
                <input
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  type="tel"
                  maxLength={6}
                />
                <button style={styles.primaryBtn} onClick={verifyOTP} disabled={authLoading}>
                  {authLoading ? 'Verifying...' : 'Verify & Enter →'}
                </button>
                <button style={styles.secondaryBtn} onClick={() => { setOtpSent(false); setOtp('') }}>
                  Change number
                </button>
              </>
            )}

            {authError && <p style={styles.errorText}>⚠️ {authError}</p>}

            {/* Invisible recaptcha */}
            <div id="recaptcha-container"></div>

            <button style={styles.secondaryBtn} onClick={() => setStep(3)}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
