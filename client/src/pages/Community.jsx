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
  Image as ImageIcon, 
  FileText, 
  Loader2,
  Radio,
  FileUp,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '../lib/imageUpload';
import toast from 'react-hot-toast';

export default function Community() {
  const { t } = useTranslation();
  const { currentUser, dbUser, userProfile } = useAuth();
  
  const [activeChannel, setActiveChannel] = useState('General');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRoom, setShowVoiceRoom] = useState(false);
  const [pttSpeaking, setPttSpeaking] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Compute community id from user district & village
  const communityId = `${dbUser?.district || 'bangalore'}_${dbUser?.village || 'ward6'}`.toLowerCase().replace(/\s+/g, '');

  // Real-time messages listener
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'communities', communityId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      console.error("Firestore listener failed:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [communityId]);

  // CRITICAL: Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      // Use supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        chunksRef.current = [];
        
        // CRITICAL: Stop all tracks to turn off mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
          });
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start(100); // collect data every 100ms
      setIsRecording(true);
      
    } catch (err) {
      console.error('Mic error:', err);
      if (err.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow mic access.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && 
        mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
    
    const uploadToast = toast.loading("Sending voice note...");
    // Convert blob to base64 for Firestore storage
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onload = async () => {
      const base64Audio = reader.result;
      
      try {
        await addDoc(collection(db, 'communities', communityId, 'messages'), {
          senderId: currentUser.uid,
          senderName: dbUser?.name || userProfile?.name || 'User',
          senderRole: dbUser?.role || userProfile?.role || 'citizen',
          audioData: base64Audio, // store as base64
          type: 'audio',
          channel: activeChannel,
          timestamp: serverTimestamp()
        });
        toast.dismiss(uploadToast);
        toast.success("Voice note sent!");
      } catch (err) {
        console.error(err);
        toast.dismiss(uploadToast);
        toast.error("Failed to send voice note.");
      }
      
      // Reset recording state
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageToSend = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'communities', communityId, 'messages'), {
        senderId: currentUser?.uid || 'anonymous',
        senderName: dbUser?.name || 'Citizen',
        senderRole: dbUser?.role || 'Citizen',
        text: messageToSend,
        type: 'text',
        channel: activeChannel,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Message send failed:", err);
      toast.error("Failed to send message.");
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachments(false);
    setUploadingFile(true);
    const uploadToast = toast.loading(`Uploading ${type}...`);

    try {
      const downloadUrl = await uploadImage(file);
      await addDoc(collection(db, 'communities', communityId, 'messages'), {
        senderId: currentUser?.uid || 'anonymous',
        senderName: dbUser?.name || 'Citizen',
        senderRole: dbUser?.role || 'Citizen',
        text: type === 'image' ? 'Sent an image' : file.name,
        mediaUrl: downloadUrl,
        type: type,
        channel: activeChannel,
        timestamp: serverTimestamp()
      });
      toast.dismiss(uploadToast);
      toast.success(`${type} sent!`);
    } catch (err) {
      console.error(err);
      toast.dismiss(uploadToast);
      toast.error(`Failed to upload ${type}.`);
    } finally {
      setUploadingFile(false);
    }
  };

  const channelsList = [
    { id: 'General', label: 'General' },
    { id: 'Emergency', label: 'Emergency' },
    { id: 'Workers', label: 'Workers' },
    { id: 'Announcements', label: 'Announcements' },
    { id: 'Agriculture', label: 'Agriculture' }
  ];

  // Helper function for message alignment and backgrounds
  const getMessageBubbleStyle = (senderId, type) => {
    const isOwn = senderId === currentUser?.uid;
    if (isOwn) {
      return {
        containerClass: "justify-end",
        bubbleClass: "bg-accent text-white rounded-2xl rounded-tr-none shadow-sm"
      };
    }
    return {
      containerClass: "justify-start",
      bubbleClass: "bg-white dark:bg-slate-800 text-text dark:text-white rounded-2xl rounded-tl-none shadow-sm border border-border dark:border-slate-700"
    };
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'official': return <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Official</span>;
      case 'volunteer': return <span className="bg-green-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Volunteer</span>;
      case 'worker': return <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Worker</span>;
      default: return null;
    }
  };

  const filteredMessages = messages.filter(m => m.channel === activeChannel);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] rounded-2xl border border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-sm">
      
      {/* Community Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-border dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-sm font-black text-text dark:text-white capitalize">
            {dbUser?.village || 'Our Village'} Community Hub
          </h2>
          <span className="text-[10px] text-text-muted font-bold block mt-0.5">
            {dbUser?.district || 'District'} District &bull; {activeChannel} Room
          </span>
        </div>
        
        <button
          onClick={() => setShowVoiceRoom(!showVoiceRoom)}
          className="min-h-[40px] px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <Radio className="w-4 h-4 animate-pulse" /> Live Voice Room
        </button>
      </div>

      {/* Voice Room interface if toggled */}
      {showVoiceRoom && (
        <div className="bg-red-500 text-white p-4 flex flex-col items-center justify-center gap-4 animate-fadeIn border-b border-red-600">
          <h4 className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
            <Radio className="w-4 h-4 animate-ping" /> Community Voice Broadcast Room
          </h4>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                <img 
                  src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
                  alt="avatar" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              {pttSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              )}
            </div>
            <button
              onMouseDown={() => setPttSpeaking(true)}
              onMouseUp={() => setPttSpeaking(false)}
              className="px-6 py-3 bg-white text-red-600 text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1 active:scale-95 transition"
            >
              🎤 Hold to Speak
            </button>
            <button
              onClick={() => { setShowVoiceRoom(false); setPttSpeaking(false); }}
              className="w-10 h-10 bg-red-700 text-white rounded-lg flex items-center justify-center cursor-pointer"
              title="Leave Room"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Scrollable Channel Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-border dark:border-slate-700 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none z-10">
        {channelsList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChannel(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition cursor-pointer ${
              activeChannel === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs mt-2 font-bold">Synchronizing community logs...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
            <Users className="w-12 h-12 text-slate-300" />
            <p className="text-xs font-bold mt-2 text-text dark:text-white">No discussions here yet</p>
            <p className="text-[10px] text-text-muted mt-1">Be the first to start the conversation in #{activeChannel}!</p>
          </div>
        ) : (
          filteredMessages.map(msg => {
            const isOwn = msg.senderId === currentUser?.uid;
            const bubbleStyle = getMessageBubbleStyle(msg.senderId, msg.type);
            const timeStr = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

            return (
              <div key={msg.id} className={`flex ${bubbleStyle.containerClass} animate-fadeIn`}>
                <div className={`max-w-[75%] p-3.5 ${bubbleStyle.bubbleClass} space-y-1`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black tracking-wide text-accent-soft block">
                      {isOwn ? "You" : msg.senderName}
                    </span>
                    {getRoleBadge(msg.senderRole)}
                  </div>

                  {msg.type === 'text' && (
                    <p className="text-xs leading-relaxed font-semibold">{msg.text}</p>
                  )}

                  {msg.type === 'image' && (
                    <div className="space-y-1">
                      <div className="rounded-lg overflow-hidden border border-white/20 max-w-[240px]">
                        <img 
                          src={msg.mediaUrl} 
                          alt="shared" 
                          className="w-full object-cover max-h-[180px] cursor-pointer hover:scale-105 transition"
                          onClick={() => window.open(msg.mediaUrl, '_blank')}
                        />
                      </div>
                      {msg.text && <p className="text-xs font-medium italic mt-1">{msg.text}</p>}
                    </div>
                  )}

                  {msg.type === 'pdf' && (
                    <a 
                      href={msg.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white/20 p-2.5 rounded-lg text-white hover:bg-white/30 transition text-xs font-bold max-w-[240px]"
                    >
                      <FileText className="w-5 h-5" /> Download PDF Report
                    </a>
                  )}

                  {msg.type === 'audio' && msg.audioData && (
                    <audio 
                      controls 
                      src={msg.audioData}
                      style={{maxWidth:'200px', height:'36px'}}
                      preload="metadata"
                    />
                  )}

                  <span className="text-[8px] text-white/70 block text-right font-black mt-1">
                    ⏰ {timeStr}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Attachment panel overlay */}
      {showAttachments && (
        <div className="bg-white dark:bg-slate-800 border-t border-border dark:border-slate-700 p-4 grid grid-cols-2 gap-3 animate-slideUp">
          <label className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 p-3 rounded-xl border border-border dark:border-slate-700 text-xs font-bold cursor-pointer text-text dark:text-white">
            <ImageIcon className="w-4 h-4 text-accent" /> Share Photo
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'image')}
              className="hidden"
            />
          </label>
          <label className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 p-3 rounded-xl border border-border dark:border-slate-700 text-xs font-bold cursor-pointer text-text dark:text-white">
            <FileUp className="w-4 h-4 text-orange-500" /> Share PDF File
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => handleFileUpload(e, 'pdf')}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Show audio preview before sending */}
      {audioUrl && !isRecording && (
        <div className="bg-white dark:bg-slate-800 border-t border-border dark:border-slate-700 p-4 flex gap-3 items-center justify-between">
          <audio controls src={audioUrl} style={{height:'32px', flex:1}} />
          <div className="flex gap-2">
            <button 
              onClick={sendVoiceMessage}
              className="px-4 py-2 bg-accent text-white font-bold text-xs rounded-xl hover:bg-opacity-90 transition cursor-pointer"
            >
              Send
            </button>
            <button 
              onClick={() => { setAudioUrl(null); setAudioBlob(null); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-text dark:text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div className="bg-white dark:bg-slate-800 border-t border-border dark:border-slate-700 p-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-text-muted hover:text-text cursor-pointer border border-border dark:border-slate-650"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5 text-accent" />
        </button>

        <button
          onMouseDown={startRecording}   // desktop: hold to record
          onMouseUp={stopRecording}
          onTouchStart={startRecording}  // mobile: touch to record
          onTouchEnd={stopRecording}
          style={{
            background: isRecording ? '#DC2626' : '#1B6FD8',
            border: 'none',
            borderRadius: '50%',
            width: '44px', height: '44px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
          title="Hold to speak"
        >
          {isRecording ? '⏹' : '🎤'}
        </button>

        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${activeChannel}...`}
            className="flex-1 h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent dark:text-white"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 bg-accent disabled:opacity-40 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
