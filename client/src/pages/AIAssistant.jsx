import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  Send, 
  Mic, 
  Square,
  Building, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Volume2,
  Trash2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { askAIAssistant } from '../lib/gemini';
import SeverityBadge from '../components/ui/SeverityBadge';

export default function AIAssistant() {
  const { t } = useTranslation();
  const { dbUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech API Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      const getSpeechLang = (lang) => {
        const mapping = {
          en: 'en-IN',
          hi: 'hi-IN',
          kn: 'kn-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          ml: 'ml-IN',
          bn: 'bn-IN',
          mr: 'mr-IN',
          gu: 'gu-IN',
          pa: 'pa-IN'
        };
        return mapping[lang] || 'en-IN';
      };

      rec.lang = getSpeechLang(localStorage.getItem('vanguard_language') || 'en');

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        setIsListening(false);
      };

      rec.onerror = (err) => {
        console.error("Speech Recognition error: ", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Speech recognition already active", e);
      }
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Triggers assistant response
  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // 2. Fetch Gemini Response
      const userInfo = {
        village: dbUser?.village || 'Ramanagara Town',
        ward: dbUser?.ward || 'Ward 6',
        district: dbUser?.district || 'Ramanagara',
        state: dbUser?.state || 'Karnataka',
        language: localStorage.getItem('vanguard_language') || 'en'
      };

      const aiResponse = await askAIAssistant(textToSend, messages, userInfo);

      // 3. Add AI Message
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: aiResponse.text,
        recommendedAuthority: aiResponse.recommendedAuthority,
        riskLevel: aiResponse.riskLevel,
        suggestedAction: aiResponse.suggestedAction,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Add Error Fallback
      setMessages(prev => [...prev, {
        id: 'ai_error_' + Date.now(),
        sender: 'ai',
        text: "I experienced a connection issue while communicating with Gemini AI. Please check your network and ask again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Clear chat logs
  const handleClearChat = () => {
    setMessages([]);
  };

  const suggestedPrompts = [
    { label: "Water overflowing near school 🏫", text: "Water overflowing near school" },
    { label: "Who handles electricity issues? ⚡", text: "Who handles electricity issues?" },
    { label: "Garbage not collected for 3 days 🗑", text: "Garbage not collected for 3 days" },
    { label: "How do I report a pothole? 🕳", text: "How do I report a pothole?" }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-surface dark:bg-slate-800 rounded-3xl border border-border dark:border-slate-700 overflow-hidden shadow-md">
      
      {/* 1. Header */}
      <div className="p-4 border-b border-border dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-soft text-accent rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-text dark:text-white leading-tight">VANGUARD AI</h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-bold">Ask anything about community rules or hazards</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={handleClearChat}
            className="w-9 h-9 text-text-muted hover:text-red-500 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* 2. Chat Conversation View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-slate-950/15">
        
        {/* Suggest prompts chips when empty */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
            <div className="w-16 h-16 bg-accent-soft text-accent rounded-2xl flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-black text-text dark:text-white">How can I help you today?</h4>
              <p className="text-xs text-text-muted mt-1 leading-normal max-w-xs mx-auto">
                Ask about local department guidelines, report methods, or risk predictions for safety hazards.
              </p>
            </div>

            {/* Suggested prompts list */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {suggestedPrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSendMessage(p.text)}
                  className="px-4 py-3 bg-surface hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-border dark:border-slate-700 rounded-2xl text-left text-xs font-bold text-text dark:text-slate-200 transition shadow-sm cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles list */}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm border space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-accent text-white border-accent-soft rounded-tr-none'
                  : 'bg-surface dark:bg-slate-800 text-text dark:text-white border-border dark:border-slate-700 rounded-tl-none'
              }`}
            >
              {/* Text message */}
              <p className="text-sm font-semibold leading-relaxed break-words">
                {msg.text}
              </p>

              {/* Renders dynamic cards inside AI responses */}
              {msg.sender === 'ai' && (msg.recommendedAuthority || msg.riskLevel) && (
                <div className="space-y-2.5 pt-2 border-t border-border dark:border-slate-700/60">
                  {/* Severity Badge */}
                  {msg.riskLevel && (
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-muted">Hazard Level:</span>
                      <SeverityBadge severity={msg.riskLevel} />
                    </div>
                  )}

                  {/* Authority helpline Card */}
                  {msg.recommendedAuthority && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-border dark:border-slate-700 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2 text-text dark:text-white font-bold text-xs">
                        <Building className="w-4.5 h-4.5 text-accent" />
                        <span className="truncate max-w-[140px]">{msg.recommendedAuthority}</span>
                      </div>
                      <button 
                        onClick={() => alert(`Calling ${msg.recommendedAuthority} Helpline`)}
                        className="h-8 px-3 bg-accent text-white text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        Helpline
                      </button>
                    </div>
                  )}

                  {/* Action alert box */}
                  {msg.suggestedAction && (
                    <div className="flex gap-2 text-xs text-text-muted leading-relaxed font-semibold">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Next Step: {msg.suggestedAction}</span>
                    </div>
                  )}
                </div>
              )}

              <span className={`text-[8px] font-semibold mt-1 block text-right leading-none ${
                msg.sender === 'user' ? 'text-white/60' : 'text-text-muted'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* AI Thinking Loader */}
        {loading && (
          <div className="flex items-center gap-2 p-4 bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 max-w-[140px]">
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.4s' }} />
            <span className="text-[10px] font-bold text-text-muted uppercase">Vanguard AI</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 3. Bottom Input Area */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-border dark:border-slate-700 flex items-center gap-2 relative bg-surface dark:bg-slate-800">
        
        {/* Voice Input mic */}
        {isListening ? (
          <button
            type="button"
            onClick={stopListening}
            className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center animate-pulse shadow-md cursor-pointer"
            title="Stop listening"
          >
            <Square className="w-5 h-5 fill-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startListening}
            className="w-12 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-text-muted hover:text-accent rounded-xl flex items-center justify-center cursor-pointer transition"
            title="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* Text Area */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Listening... Speak now" : "Ask VANGUARD assistant anything..."}
          disabled={loading || isListening}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl px-4 text-sm font-semibold text-text dark:text-white outline-none focus:border-accent min-h-[44px]"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="w-12 h-12 bg-accent hover:bg-opacity-95 text-white flex items-center justify-center rounded-xl cursor-pointer shadow-md disabled:opacity-40 transition active:scale-95 flex-shrink-0"
        >
          <Send className="w-5 h-5 fill-white" />
        </button>
      </form>
    </div>
  );
}
