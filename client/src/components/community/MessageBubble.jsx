import React, { useState, useRef } from 'react';
import { Play, Pause, FileText, Download, Eye, Video } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const isMe = message.senderId === user?.uid;

  // Role Badge Resolver
  const renderRoleBadge = (role) => {
    if (role === 'Official') {
      return (
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[9px] font-black px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-wider">
          Official 🔵
        </span>
      );
    }
    if (role === 'Volunteer') {
      return (
        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-wider">
          Volunteer 🟢
        </span>
      );
    }
    return null;
  };

  const getSenderNameColor = (role) => {
    if (role === 'Official') return 'text-blue-600 dark:text-blue-400';
    if (role === 'Volunteer') return 'text-emerald-600 dark:text-emerald-400';
    return 'text-slate-700 dark:text-slate-300';
  };

  // Audio Playback
  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
      
      {/* Sender Name & Role (Only for others) */}
      {!isMe && (
        <span className={`text-xs font-bold mb-1 ml-2 flex items-center ${getSenderNameColor(message.senderRole)}`}>
          {message.senderName}
          {renderRoleBadge(message.senderRole)}
        </span>
      )}

      {/* Bubble Container */}
      <div 
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${
          isMe 
            ? 'bg-accent text-white border-accent-soft rounded-tr-none' 
            : 'bg-surface dark:bg-slate-800 text-text dark:text-white border-border dark:border-slate-700 rounded-tl-none'
        }`}
      >
        
        {/* Render content based on type */}

        {/* 1. TEXT TYPE */}
        {message.type === 'text' && (
          <p className="text-sm font-semibold leading-relaxed break-words whitespace-pre-wrap">
            {message.text}
          </p>
        )}

        {/* 2. IMAGE TYPE */}
        {message.type === 'image' && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 max-w-[260px] aspect-square">
              <img 
                src={message.mediaUrl} 
                alt="Uploaded file" 
                className="w-full h-full object-cover"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            </div>
            {message.text && (
              <p className="text-sm font-semibold leading-relaxed break-words">
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* 3. AUDIO TYPE (Waveform Player) */}
        {message.type === 'audio' && (
          <div className="flex items-center gap-3 w-56">
            <button
              onClick={handlePlayToggle}
              className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition ${
                isMe 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-accent text-white hover:bg-opacity-95'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <div className="flex-1 flex flex-col gap-1">
              {/* Fake Audio Waveform */}
              <div className="flex items-center gap-0.5 h-6">
                {[...Array(16)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-0.5 rounded-full ${
                      isMe ? 'bg-white' : 'bg-accent'
                    } ${isPlaying ? 'animate-pulse' : 'opacity-60'}`}
                    style={{ 
                      height: `${(i % 3 === 0 ? 12 : i % 2 === 0 ? 20 : 6)}px`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
              <span className={`text-[9px] font-bold ${isMe ? 'text-white/80' : 'text-text-muted'}`}>
                Voice Note
              </span>
            </div>
            
            <audio 
              ref={audioRef} 
              src={message.audioUrl} 
              onEnded={() => setIsPlaying(false)}
              className="hidden" 
            />
          </div>
        )}

        {/* 4. VIDEO TYPE */}
        {message.type === 'video' && (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 max-w-[260px] aspect-video flex items-center justify-center">
            <video src={message.mediaUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button 
                onClick={() => window.open(message.mediaUrl, '_blank')}
                className="w-12 h-12 bg-white/25 hover:bg-white/45 text-white flex items-center justify-center rounded-full cursor-pointer shadow-md transition"
              >
                <Video className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* 5. PDF TYPE */}
        {message.type === 'pdf' && (
          <div className={`flex items-center gap-3 p-2 rounded-xl border max-w-[260px] ${
            isMe 
              ? 'bg-white/15 border-white/20 text-white' 
              : 'bg-slate-50 dark:bg-slate-700/40 border-border dark:border-slate-700 text-text dark:text-white'
          }`}>
            <FileText className={`w-8 h-8 flex-shrink-0 ${isMe ? 'text-white' : 'text-accent'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate leading-tight">
                {message.text || 'Document.pdf'}
              </p>
              <span className={`text-[9px] font-medium block mt-0.5 ${isMe ? 'text-white/60' : 'text-text-muted'}`}>
                PDF File
              </span>
            </div>
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noreferrer"
              className={`p-2 rounded-lg cursor-pointer ${
                isMe ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-accent'
              }`}
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-[9px] font-semibold mt-1.5 block text-right leading-none ${
          isMe ? 'text-white/65' : 'text-text-muted'
        }`}>
          {formatTime(message.timestamp)}
        </span>

      </div>
    </div>
  );
}
