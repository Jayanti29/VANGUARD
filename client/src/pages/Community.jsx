import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paperclip, 
  Send, 
  Mic, 
  Volume2, 
  PhoneOff, 
  Users, 
  X, 
  Image, 
  FileText, 
  Film,
  Radio,
  Loader2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useCommunity from '../hooks/useCommunity';
import ChannelTabs from '../components/community/ChannelTabs';
import MessageBubble from '../components/community/MessageBubble';
import VoiceRecorder from '../components/community/VoiceRecorder';

export default function Community() {
  const { t } = useTranslation();
  const { user, dbUser } = useAuth();
  
  const [activeChannel, setActiveChannel] = useState('General');
  const { 
    messages, 
    loading, 
    members, 
    voiceRoomActive, 
    voiceRoomUsers, 
    sendMessage, 
    joinVoiceRoom, 
    leaveVoiceRoom 
  } = useCommunity(activeChannel);

  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRoom, setShowVoiceRoom] = useState(false);
  const [pttSpeaking, setPttSpeaking] = useState(false);
  const [attType, setAttType] = useState(null); // 'image' | 'video' | 'pdf'
  const [attUrl, setAttUrl] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send textual/mixed messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attUrl) return;

    setSendingMessage(true);
    try {
      const payload = {
        text: inputText,
        type: attType || 'text',
        mediaUrl: attUrl || '',
        audioUrl: ''
      };

      await sendMessage(payload);
      setInputText('');
      setAttType(null);
      setAttUrl('');
      setShowAttachments(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Send voice recorded message
  const handleVoiceRecordComplete = async ({ blob, url }) => {
    setSendingMessage(true);
    try {
      // Simulate file upload -> returns url (local blob url for demo fallback)
      const payload = {
        text: '',
        type: 'audio',
        audioUrl: url,
        mediaUrl: ''
      };
      await sendMessage(payload);
    } catch (e) {
      console.error("Failed to send audio message:", e);
    } finally {
      setSendingMessage(false);
    }
  };

  // Attachment Picker Select
  const handleFileSelect = (type) => {
    setAttType(type);
    // Simulate prompt/local upload URL or camera inputs
    if (type === 'image') {
      const url = prompt("Enter an Image URL or press OK to use mock:", 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80');
      if (url) setAttUrl(url);
    } else if (type === 'pdf') {
      const url = prompt("Enter a PDF URL or press OK to use mock:", 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      if (url) setAttUrl(url);
    } else if (type === 'video') {
      const url = prompt("Enter a Video URL or press OK to use mock:", 'https://www.w3.org/2010/05/video/media/movie_300.mp4');
      if (url) setAttUrl(url);
    }
    setShowAttachments(false);
  };

  // Simulated Voice Room connection
  const handleJoinVoiceRoom = async () => {
    await joinVoiceRoom();
    setShowVoiceRoom(true);
  };

  const handleLeaveVoiceRoom = async () => {
    await leaveVoiceRoom();
    setShowVoiceRoom(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative bg-surface dark:bg-slate-800 rounded-3xl border border-border dark:border-slate-700 overflow-hidden shadow-md">
      
      {/* 1. Chat Header */}
      <div className="p-4 border-b border-border dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
        <div>
          <h3 className="text-base font-black text-text dark:text-white leading-tight">
            {dbUser?.village || 'Community Group'}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-text-muted mt-0.5 font-bold">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span>{members.length} Members Active</span>
          </div>
        </div>

        {/* 🎙 Voice Room Toggler */}
        <button
          onClick={handleJoinVoiceRoom}
          className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer min-h-[44px] ${
            voiceRoomActive 
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-accent-soft text-accent dark:bg-slate-700 dark:text-blue-300'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>
            {voiceRoomActive ? `Voice Room Live (${voiceRoomUsers.length})` : 'Join Voice Room'}
          </span>
        </button>
      </div>

      {/* 2. Channel Tabs */}
      <div className="px-4 py-2">
        <ChannelTabs activeChannel={activeChannel} onChange={setActiveChannel} />
      </div>

      {/* 3. Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-slate-950/15">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-text-muted font-bold animate-pulse">
              Syncing real-time channel messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted space-y-2 p-6">
            <MessageSquareIcon className="w-12 h-12 opacity-30" />
            <p className="font-bold text-sm">No messages yet in this channel</p>
            <p className="text-xs max-w-[200px]">Be the first to post notifications or query locals!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Selected Attachment Preview Box */}
      {attUrl && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700/60 flex items-center justify-between border-t border-border dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold">
            {attType === 'image' && <Image className="w-4 h-4 text-blue-500" />}
            {attType === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
            {attType === 'video' && <Film className="w-4 h-4 text-emerald-500" />}
            <span className="truncate max-w-[200px] text-text dark:text-slate-200">
              Attached {attType} File
            </span>
          </div>
          <button 
            onClick={() => { setAttUrl(''); setAttType(null); }}
            className="text-text-muted hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Bottom Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-border dark:border-slate-700 flex items-center gap-2 relative bg-surface dark:bg-slate-800">
        
        {/* Attachment Toggle */}
        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          className={`btn-icon !w-11 !h-11 !rounded-xl text-text-muted hover:text-accent border-border ${
            showAttachments ? 'bg-slate-100 dark:bg-slate-700' : ''
          }`}
          title="Attach Media"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Attachment Selector Sheet */}
        {showAttachments && (
          <div className="absolute bottom-16 left-4 bg-surface dark:bg-slate-700 border border-border dark:border-slate-600 rounded-2xl p-2 shadow-xl flex flex-col gap-1 z-30 min-w-[140px]">
            <button
              type="button"
              onClick={() => handleFileSelect('image')}
              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-left text-xs font-bold rounded-lg text-text dark:text-white cursor-pointer"
            >
              <Image className="w-4 h-4 text-blue-500" /> Photo Upload
            </button>
            <button
              type="button"
              onClick={() => handleFileSelect('video')}
              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-left text-xs font-bold rounded-lg text-text dark:text-white cursor-pointer"
            >
              <Film className="w-4 h-4 text-emerald-500" /> Video File
            </button>
            <button
              type="button"
              onClick={() => handleFileSelect('pdf')}
              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-left text-xs font-bold rounded-lg text-text dark:text-white cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-500" /> PDF Document
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message #${activeChannel}...`}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl px-4 text-sm font-semibold text-text dark:text-white outline-none focus:border-accent min-h-[44px]"
        />

        {/* Real-time Voice Recording trigger */}
        <VoiceRecorder onRecordComplete={handleVoiceRecordComplete} />

        {/* Submit Send Button */}
        <button
          type="submit"
          disabled={(!inputText.trim() && !attUrl) || sendingMessage}
          className="w-12 h-12 bg-accent hover:bg-opacity-95 text-white flex items-center justify-center rounded-xl cursor-pointer shadow-md disabled:opacity-40 transition active:scale-95 flex-shrink-0"
        >
          {sendingMessage ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 fill-white" />
          )}
        </button>
      </form>

      {/* 5. Voice Room Overlay Panel */}
      {showVoiceRoom && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-between p-6 z-50">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-bold tracking-widest uppercase">Live Voice Room</span>
            </div>
            <button 
              onClick={handleLeaveVoiceRoom}
              className="w-9 h-9 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Speakers avatars grid */}
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-black text-white">{dbUser?.village || 'Community Group'}</h4>
              <p className="text-xs text-slate-400 mt-1 font-bold">
                {voiceRoomUsers.length} villagers connected in room
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-sm">
              {voiceRoomUsers.map((p) => (
                <div key={p.uid} className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${p.name}`}
                      alt={p.name}
                      className={`w-16 h-16 rounded-full border-3 bg-slate-800 ${
                        pttSpeaking && p.uid === user?.uid
                          ? 'border-green-500 animate-pulse'
                          : 'border-white/10'
                      }`}
                    />
                    {pttSpeaking && p.uid === user?.uid && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-950">
                        <Volume2 className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white font-bold max-w-[80px] truncate">{p.name}</span>
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide leading-none">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Push To Talk big trigger button */}
          <div className="flex flex-col items-center space-y-4 w-full">
            <button
              type="button"
              onMouseDown={() => setPttSpeaking(true)}
              onMouseUp={() => setPttSpeaking(false)}
              onTouchStart={() => setPttSpeaking(true)}
              onTouchEnd={() => setPttSpeaking(false)}
              className={`w-28 h-28 rounded-full flex items-center justify-center border-4 border-white/20 cursor-pointer transition-all duration-200 select-none ${
                pttSpeaking 
                  ? 'bg-green-600 text-white animate-pulse-ring' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              {pttSpeaking ? 'Speaking... Release to Mute' : 'Hold to Speak (Push-to-Talk)'}
            </p>

            <button
              onClick={handleLeaveVoiceRoom}
              type="button"
              className="mt-6 min-h-[52px] w-full max-w-xs bg-red-950 text-red-200 font-bold rounded-xl flex items-center justify-center gap-2 border border-red-900 cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" /> Leave Voice Room
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple icons fallback
function MessageSquareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
