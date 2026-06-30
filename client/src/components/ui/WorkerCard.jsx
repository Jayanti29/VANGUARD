import React from 'react';

export default function WorkerCard({ worker, onHire }) {
  const initials = (worker.name || 'W')[0].toUpperCase()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 20px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      transition: 'box-shadow 0.15s',
    }}>
      {/* Avatar circle — NO robot image, just initials */}
      <div style={{
        width: 52, height: 52, flexShrink: 0,
        borderRadius: '50%',
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 800,
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          marginBottom: 4,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            {worker.name}
          </span>
          {worker.isNearYou && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: '#DCFCE7', color: '#16A34A',
              padding: '2px 8px', borderRadius: 20,
            }}>
              Near you
            </span>
          )}
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{
              color: s <= Math.round(worker.rating||0) ? '#FBBF24' : 'var(--border)',
              fontSize: 14,
            }}>★</span>
          ))}
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
            ({worker.reviewCount || 0} reviews)
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(worker.skills || []).map(skill => (
            <span key={skill} style={{
              fontSize: 12, fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {skill}
            </span>
          ))}
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
            ₹{worker.dailyRate || 0}/day
          </span>
        </div>
      </div>

      {/* Hire button — rectangular, not pill */}
      <button
        onClick={() => onHire?.(worker)}
        style={{
          flexShrink: 0,
          padding: '10px 22px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Hire
      </button>
    </div>
  )
}
