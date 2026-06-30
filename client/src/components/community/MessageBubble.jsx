import React from 'react';
import { FileText, Video } from 'lucide-react';

const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Just now';
  }
};

export default function MessageBubble({ msg, isOwn }) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        maxWidth: '70%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
      }}>
        {!isOwn && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 2,
            paddingLeft: 4,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--accent)',
            }}>
              {msg.senderName}
            </span>
            {msg.senderRole && (
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                msg.senderRole.toLowerCase() === 'official' ? 'bg-purple-650 text-white' :
                msg.senderRole.toLowerCase() === 'volunteer' ? 'bg-emerald-650 text-white' :
                'bg-orange-500 text-white'
              }`}>
                {msg.senderRole}
              </span>
            )}
          </div>
        )}

        <div style={{
          background: isOwn ? 'var(--accent)' : 'var(--surface-2)',
          color: isOwn ? '#fff' : 'var(--text)',
          borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          padding: (msg.type === 'audio' || msg.type === 'image' || msg.type === 'pdf') ? '10px 12px' : '8px 12px',
          wordBreak: 'break-word',
          boxSizing: 'border-box',
          border: isOwn ? 'none' : '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}>
          {msg.type === 'audio' ? (
            <div style={{ width: 220, maxWidth: '100%' }}>
              <audio controls src={msg.audioData || msg.audioUrl || msg.mediaUrl}
                     style={{ width: '100%', height: 32 }} />
              <div style={{
                fontSize: 10,
                color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                marginTop: 4,
                fontWeight: 700,
              }}>
                Voice message
              </div>
            </div>
          ) : msg.type === 'image' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', maxWidth: 240 }}>
                <img 
                  src={msg.mediaUrl} 
                  alt="shared" 
                  style={{ width: '100%', objectFit: 'cover', maxHeight: 180, display: 'block', cursor: 'pointer' }}
                  onClick={() => window.open(msg.mediaUrl, '_blank')}
                />
              </div>
              {msg.text && <p style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>{msg.text}</p>}
            </div>
          ) : msg.type === 'pdf' ? (
            <a 
              href={msg.mediaUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                color: isOwn ? '#fff' : 'var(--text)',
                background: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
                textDecoration: 'none',
                fontSize: 11,
                fontWeight: 800,
                maxWidth: 240,
                border: '1px solid var(--border)',
              }}
            >
              <FileText style={{ width: 16, height: 16, flexShrink: 0 }} /> Download PDF Report
            </a>
          ) : msg.type === 'video' ? (
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', maxWidth: 240, position: 'relative' }}>
              <video src={msg.mediaUrl} style={{ width: '100%', objectFit: 'cover', maxHeight: 180, display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                <button 
                  onClick={() => window.open(msg.mediaUrl, '_blank')}
                  className="w-10 h-10 bg-white/25 hover:bg-white/45 text-white flex items-center justify-center rounded-full cursor-pointer shadow-md transition"
                  style={{ border: 'none' }}
                >
                  <Video style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 600 }}>{msg.text}</span>
          )}
        </div>

        <span style={{
          fontSize: 9, color: 'var(--text-muted)',
          marginTop: 2, paddingInline: 4,
          fontWeight: 700,
        }}>
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}
