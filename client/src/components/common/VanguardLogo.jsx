import React from 'react';

/**
 * VanguardLogo - Polished high-tech SVG Logo component for VANGUARD
 * @param {Object} props
 * @param {number|string} [props.size=32] - Icon dimensions (px)
 * @param {'icon'|'full'|'badge'} [props.variant='icon'] - Logo presentation style
 * @param {boolean} [props.animated=false] - Enables subtle pulse glow animation
 * @param {string} [props.className=''] - Additional CSS classes
 */
export default function VanguardLogo({ 
  size = 32, 
  variant = 'icon', 
  animated = false,
  className = '' 
}) {
  const iconSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon Mark */}
      <div 
        className={`relative flex items-center justify-center transition-transform duration-300 hover:scale-105 ${animated ? 'animate-pulse' : ''}`}
        style={{ width: iconSize, height: iconSize, flexShrink: 0 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="vgShieldBgComp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="vgChevronComp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            <linearGradient id="vgCoreGlowComp" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <filter id="vgGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Glowing Aura */}
          <path 
            d="M 50 6 C 75 6 90 20 90 48 C 90 76 68 92 50 97 C 32 92 10 76 10 48 C 10 20 25 6 50 6 Z" 
            fill="none" 
            stroke="#38BDF8" 
            strokeWidth="2" 
            opacity="0.4" 
            filter="url(#vgGlowFilter)" 
          />

          {/* Main Shield Body */}
          <path 
            d="M 50 8 C 72 8 86 21 86 46 C 86 73 66 88 50 93 C 34 88 14 73 14 46 C 14 21 28 8 50 8 Z" 
            fill="url(#vgShieldBgComp)" 
            stroke="#1E293B" 
            strokeWidth="2" 
          />

          {/* Shield Inner Border Accent */}
          <path 
            d="M 50 14 C 67 14 79 25 79 45 C 79 67 62 80 50 84 C 38 80 21 67 21 45 C 21 25 33 14 50 14 Z" 
            fill="none" 
            stroke="url(#vgCoreGlowComp)" 
            strokeWidth="1.5" 
            opacity="0.6" 
          />

          {/* Faceted "V" Chevron */}
          <path d="M 26 26 L 50 78 L 42 78 L 20 30 Z" fill="#0284C7" />
          <path d="M 74 26 L 50 78 L 58 78 L 80 30 Z" fill="#38BDF8" />
          <path 
            d="M 24 24 L 50 74 L 76 24 L 62 24 L 50 56 L 38 24 Z" 
            fill="url(#vgChevronComp)" 
            filter="url(#vgGlowFilter)" 
          />

          {/* Central Pulse Energy Starburst */}
          <polygon points="50,32 53,42 63,45 53,48 50,58 47,48 37,45 47,42" fill="#FFFFFF" opacity="0.95" />
          <circle cx="50" cy="45" r="3" fill="#22D3EE" filter="url(#vgGlowFilter)" />
        </svg>
      </div>

      {/* Typography for 'full' or 'badge' variants */}
      {(variant === 'full' || variant === 'badge') && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold tracking-wider text-slate-900 dark:text-white uppercase font-sans" style={{ fontSize: typeof size === 'number' ? size * 0.55 : '1.1rem' }}>
            VANGUARD
          </span>
          {variant === 'badge' && (
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase mt-0.5">
              CIVIC GUARDIAN
            </span>
          )}
        </div>
      )}
    </div>
  );
}
