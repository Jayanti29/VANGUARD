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
      role: 'user',
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
        role: 'ai',
        text: reply,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('AI Assistant error:', err);
      setMessages(prev => [...prev, {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        role: 'ai',
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
      <div 
        className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden shadow-sm p-4"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 180px)', // full viewport minus topbar+header
          minHeight: 500,
        }}
      >

      {/* Development status block */}
      {isDev && (
        <div style={{fontSize:'11px', color:'gray', padding:'4px 8px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', textAlign: 'center', marginBottom: 8}}>
          AI Status: {aiStatus}
        </div>
      )}

      {/* messages area — scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            gap: 20,
          }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={36} color="var(--accent)" />
            </div>

            <div style={{ textAlign: 'center', maxWidth: 480 }}>
              <h3 style={{
                fontSize: 20, fontWeight: 700,
                color: 'var(--text)', margin: '0 0 8px',
              }}>
                {t('how_can_i_assist', 'How can I assist you today?')}
              </h3>
              <p style={{
                fontSize: 15, color: 'var(--text-muted)',
                lineHeight: 1.6, margin: 0,
              }}>
                {t('ai_helper_desc', 'I can guide you on local department responsibilities, predicted risks, or help compose a formal civic report.')}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              width: '100%',
              maxWidth: 560,
            }}>
              {[
                t('suggested_1', 'Water overflowing near school'),
                t('suggested_2', 'Who handles electricity issues?'),
                t('suggested_3', 'Garbage not collected for 3 days'),
                t('suggested_4', 'How to report a pothole?'),
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    color: 'var(--text)',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    lineHeight: 1.5,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
          }}>
            {messages.map((msg, i) => (
              <div key={msg.id || i} style={{
                display: 'flex',
                justifyContent: (msg.role === 'user' || msg.sender === 'user') ? 'flex-end' : 'flex-start',
                width: '100%',
                gap: 10,
                alignItems: 'flex-start',
              }}>
                {!(msg.role === 'user' || msg.sender === 'user') && (
                  <div style={{
                    width: 32, height: 32, flexShrink: 0,
                    borderRadius: '50%',
                    background: 'var(--accent-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bot size={16} color="var(--accent)" />
                  </div>
                )}
                <div style={{
                  maxWidth: '72%',
                  padding: '12px 16px',
                  borderRadius: (msg.role === 'user' || msg.sender === 'user')
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  background: (msg.role === 'user' || msg.sender === 'user') ? 'var(--accent)' : 'var(--surface-2)',
                  color: (msg.role === 'user' || msg.sender === 'user') ? '#fff' : 'var(--text)',
                  fontSize: 15,
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
                gap: 10,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={16} color="var(--accent)" />
                </div>
                <div style={{
                  maxWidth: '72%',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'var(--surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* input bar — always at bottom */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 0 0',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={toggleListening}
          style={{
            width: 44, height: 44, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '1px solid var(--border)',
            background: isListening ? '#DC2626' : 'var(--surface-2)',
            color: isListening ? '#fff' : 'var(--text-muted)',
            flexShrink: 0,
          }}
          title={t('voice_input', 'Voice input')}
        >
          <Mic size={20} color={isListening ? '#fff' : 'var(--accent)'} />
        </button>

        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('ai_placeholder', 'Ask a question...')}
          style={{
            flex: 1,
            height: 44,
            padding: '0 16px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
            outline: 'none',
            color: 'var(--text)',
          }}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            width: 44, height: 44,
            background: 'var(--accent)',
            opacity: !inputText.trim() ? 0.4 : 1,
            color: '#fff',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: !inputText.trim() ? 'default' : 'pointer',
            border: 'none',
            flexShrink: 0,
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
    </>
  );
}
