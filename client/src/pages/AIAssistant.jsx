import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  Mic, 
  Trash2,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { chatWithAI } from '../lib/gemini';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const { t } = useTranslation();
  const { dbUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle');
  
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const isDev = (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') || import.meta.env.DEV;

  useEffect(() => {
    const testGemini = async () => {
      const key = import.meta.env.VITE_GEMINI_API_KEY
      console.log('Testing Gemini. Key present:', !!key)
      console.log('Key prefix:', key?.substring(0, 10))
      
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Say hello in one word' }] }]
            })
          }
        )
        const data = await res.json()
        console.log('Gemini test response:', JSON.stringify(data))
        
        if (data.error) {
          console.error('Gemini error:', data.error.message)
          setAiStatus('error: ' + data.error.message)
        } else {
          console.log('Gemini working!')
          setAiStatus('connected')
        }
      } catch (err) {
        console.error('Gemini fetch failed:', err)
        setAiStatus('fetch_failed')
      }
    }
    testGemini()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      const getSpeechLang = (lang) => {
        const mapping = {
          en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
          ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN'
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
        console.error("Speech recognition error:", err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          toast.error("Microphone permission denied. Please allow microphone access.");
        } else {
          toast.error("Speech input error. Please try again or type your message.");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const mapping = {
      en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
      ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN'
    };
    utterance.lang = mapping[lang] || 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend) => {
    const cleanText = textToSend?.trim() || inputText.trim();
    if (!cleanText) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const userLocation = `${dbUser?.village || 'Ramanagara'}, ${dbUser?.district || 'Bangalore'}`;
      const lang = localStorage.getItem('vanguard_language') || 'en';

      const reply = await chatWithAI(cleanText, userLocation, lang);
      speakText(reply, lang);

      setMessages(prev => [...prev, {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('AI Assistant error:', err);
      setMessages(prev => [...prev, {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        text: "I experienced a connection issue while communicating with Gemini. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat history cleared");
  };

  const promptChips = [
    t('suggested_1', "Water overflowing near school"),
    t('suggested_2', "Who handles electricity issues?"),
    t('suggested_3', "Garbage not collected for 3 days"),
    t('suggested_4', "How to report a pothole?")
  ];

  return (
    <>
      <PageHeader 
        title={t('ai_title', 'AI Assistant')} 
        subtitle={t('ai_subtitle', 'Ask anything about civic procedures, local guidelines, and safety alerts.')} 
        action={
          messages.length > 0 ? (
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition"
              title={t('clear_chat', 'Clear Chat')}
            >
              <Trash2 className="w-4 h-4" /> {t('clear_chat', 'Clear Chat')}
            </button>
          ) : undefined
        }
      />
      <div className="flex flex-col h-[calc(100vh-230px)] rounded-2xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden shadow-sm">

      {/* Development status block */}
      {isDev && (
        <div style={{fontSize:'11px', color:'gray', padding:'4px 8px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', textAlign: 'center'}}>
          AI Status: {aiStatus}
        </div>
      )}

      {/* Messages scrolling view */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Bot className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-[var(--text)]">{t('how_can_i_assist', 'How can I assist you today?')}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-semibold">
                {t('ai_helper_desc', 'I can guide you on local department responsibilities, predicted risks, or help compose a formal civic report.')}
              </p>
            </div>
            
            {/* Suggested prompts chips */}
            <div className="flex flex-col gap-2 w-full pt-2">
              {promptChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="w-full text-left py-2.5 px-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text)] transition cursor-pointer"
                >
                  💡 "{chip}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => {
              const isOwn = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isOwn 
                      ? 'bg-[var(--accent)] text-white rounded-tr-none shadow-sm' 
                      : 'bg-[var(--surface)] text-[var(--text)] rounded-tl-none shadow-sm border border-[var(--border)] font-semibold'
                  }`}>
                    {msg.text}
                  </div>
                  {isOwn && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center flex-shrink-0">
                      <User className="w-4.5 h-4.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start items-center animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="bg-[var(--surface)] border-t border-[var(--border)] p-4 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer border ${
            isListening 
              ? 'bg-red-600 text-white animate-pulse border-red-650' 
              : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
          }`}
          title={t('voice_input', 'Voice input')}
        >
          <Mic className="w-5 h-5 text-[var(--accent)]" />
        </button>

        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('ai_placeholder', 'Ask a question...')}
          className="flex-1 h-11 px-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text)]"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-11 h-11 bg-[var(--accent)] disabled:opacity-40 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-sm animate-fadeIn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
    </>
  );
}
