import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  MapPin, 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  CloudSun, 
  Droplets, 
  ShieldAlert, 
  CheckCircle2, 
  Layers,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import { getAgriAdvice } from '../lib/gemini';
import toast from 'react-hot-toast';

// Comprehensive Mandi Crop Price Data
const MANDI_DATA = [
  {
    id: 'paddy-basmati',
    name: 'Paddy / Basmati Rice (धान / ಭತ್ತ / நெல்)',
    crop: 'Paddy',
    category: 'Cereals',
    state: 'Punjab',
    mandi: 'Khanna Mandi',
    distanceKm: 14,
    todayPrice: 3850,
    yesterdayPrice: 3720,
    minPrice: 3500,
    maxPrice: 4100,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '120:60:40 (N:P:K)',
    bestFertilizer: 'Urea + DAP + Zinc Sulphate at tillering stage'
  },
  {
    id: 'paddy-sona',
    name: 'Paddy Sona Masoori (ಸೋನಾ ಮಸೂರಿ / धान)',
    crop: 'Paddy',
    category: 'Cereals',
    state: 'Karnataka',
    mandi: 'Ramanagara APMC',
    distanceKm: 8,
    todayPrice: 3420,
    yesterdayPrice: 3400,
    minPrice: 3200,
    maxPrice: 3600,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '100:50:50 (N:P:K)',
    bestFertilizer: 'Organic Compost + Neem Coated Urea'
  },
  {
    id: 'wheat-sharbati',
    name: 'Wheat Sharbati (गेहूं / ಗೋಧಿ / கோதுமை)',
    crop: 'Wheat',
    category: 'Cereals',
    state: 'Madhya Pradesh',
    mandi: 'Sehore APMC',
    distanceKm: 18,
    todayPrice: 2850,
    yesterdayPrice: 2890,
    minPrice: 2600,
    maxPrice: 3100,
    unit: '₹/Quintal',
    trend: 'down',
    npk: '120:60:40 (N:P:K)',
    bestFertilizer: 'DAP at sowing, Urea top-dress at first irrigation'
  },
  {
    id: 'tomato-hybrid',
    name: 'Tomato Hybrid (टमाटर / ಟೊಮೆಟೊ / தக்காளி)',
    crop: 'Tomato',
    category: 'Vegetables',
    state: 'Karnataka',
    mandi: 'Kolar APMC Market',
    distanceKm: 22,
    todayPrice: 1950,
    yesterdayPrice: 1750,
    minPrice: 1500,
    maxPrice: 2200,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '150:100:120 (N:P:K)',
    bestFertilizer: '19:19:19 water soluble spray + Calcium Nitrate'
  },
  {
    id: 'onion-nasik',
    name: 'Red Onion (लाल प्याज / ಈರುಳ್ಳಿ / வெங்காயம்)',
    crop: 'Onion',
    category: 'Vegetables',
    state: 'Maharashtra',
    mandi: 'Lasalgaon Mandi (Nashik)',
    distanceKm: 25,
    todayPrice: 2450,
    yesterdayPrice: 2580,
    minPrice: 2100,
    maxPrice: 2750,
    unit: '₹/Quintal',
    trend: 'down',
    npk: '100:50:50 (N:P:K) + Sulphur',
    bestFertilizer: 'Single Super Phosphate (SSP) + Sulphur granules'
  },
  {
    id: 'cotton-bt',
    name: 'Cotton Long Staple (कपास / ಹತ್ತಿ / பருத்தி)',
    crop: 'Cotton',
    category: 'Cash Crops',
    state: 'Gujarat',
    mandi: 'Rajkot APMC Yard',
    distanceKm: 30,
    todayPrice: 7250,
    yesterdayPrice: 7100,
    minPrice: 6800,
    maxPrice: 7600,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '120:60:60 (N:P:K) + Boron',
    bestFertilizer: 'MOP (Potash) + DAP + Micronutrient Boron spray'
  },
  {
    id: 'maize-yellow',
    name: 'Maize / Corn (मक्का / ಮೆಕ್ಕೆಜೋಳ / மக்காச்சோளம்)',
    crop: 'Maize',
    category: 'Cereals',
    state: 'Karnataka',
    mandi: 'Davanagere APMC',
    distanceKm: 15,
    todayPrice: 2180,
    yesterdayPrice: 2120,
    minPrice: 1950,
    maxPrice: 2300,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '120:60:40 (N:P:K)',
    bestFertilizer: 'Zinc Sulphate + Urea in split doses'
  },
  {
    id: 'potato-jyoti',
    name: 'Potato Kufri Jyoti (आलू / ಆಲೂಗಡ್ಡೆ / உருளைக்கிழங்கு)',
    crop: 'Potato',
    category: 'Vegetables',
    state: 'Uttar Pradesh',
    mandi: 'Agra Mandi',
    distanceKm: 12,
    todayPrice: 1450,
    yesterdayPrice: 1420,
    minPrice: 1250,
    maxPrice: 1600,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '150:100:150 (N:P:K)',
    bestFertilizer: 'Potassium Schoenite + Well-rotted Farm Yard Manure'
  },
  {
    id: 'soybean-yellow',
    name: 'Soybean (सोयाबीन / ಸೋಯಾಬೀನ್ / সয়াবিন)',
    crop: 'Soybean',
    category: 'Oilseeds',
    state: 'Maharashtra',
    mandi: 'Latur APMC',
    distanceKm: 19,
    todayPrice: 4620,
    yesterdayPrice: 4680,
    minPrice: 4300,
    maxPrice: 4850,
    unit: '₹/Quintal',
    trend: 'down',
    npk: '30:60:30 (N:P:K) + Rhizobium',
    bestFertilizer: 'Bio-fertilizer Rhizobium seed treatment + SSP'
  }
];

const STATES = ['All States', 'Karnataka', 'Maharashtra', 'Punjab', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh'];

const QUICK_PROMPTS = [
  'Best fertilizer ratio for Paddy crop right now?',
  'How to prevent yellow leaves and pests on Tomato plants?',
  'Government subsidy schemes for drip irrigation & solar pumps',
  'Organic bio-pesticides for stem borer in Maize & Cotton',
  'When to sell stored Wheat for maximum market rate?'
];

export default function Farmers() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { dbUser } = useAuth();

  const [selectedState, setSelectedState] = useState('All States');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // AI Advisor State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Filtered Mandi List
  const filteredCrops = MANDI_DATA.filter(item => {
    const matchesState = selectedState === 'All States' || item.state === selectedState;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.mandi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCategory && matchesSearch;
  });

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      const speechLangMap = {
        en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN',
        te: 'te-IN', ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN',
        gu: 'gu-IN', pa: 'pa-IN'
      };
      rec.lang = speechLangMap[currentLang] || 'en-IN';

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setAiQuery(text);
        setIsListening(false);
        handleAskAgriAI(text);
      };

      rec.onerror = (e) => {
        console.error('Speech error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [currentLang]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleAskAgriAI = async (queryText = aiQuery) => {
    const queryToAsk = queryText || aiQuery;
    if (!queryToAsk.trim()) {
      toast.error('Please enter or speak a question.');
      return;
    }

    setAiLoading(true);
    setAiResponse('');
    try {
      const response = await getAgriAdvice(queryToAsk, dbUser?.district || 'India', currentLang);
      setAiResponse(response);
    } catch (err) {
      console.error(err);
      toast.error('Failed to get agricultural advice. Please try again.');
      setAiResponse('AI Advisor is currently unreachable. Please check your internet connection.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }} className="animate-fadeIn">
      {/* Header */}
      <PageHeader 
        title={t('farmers_title') || 'Farmers Mandi & Agri Dashboard'} 
        subtitle="Real-time crop market prices across APMC mandis, AI agriculture advisor, and soil care recommendations."
      />

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="card-vanguard" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10B981' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sprout size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tracked Crops</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>24+ Commodities</div>
          </div>
        </div>

        <div className="card-vanguard" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Connected Mandis</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>120+ APMC Yards</div>
          </div>
        </div>

        <div className="card-vanguard" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CloudSun size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weather Outlook</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>28°C • Good Sowing</div>
          </div>
        </div>

        <div className="card-vanguard" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Krishi Mitra</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>10 Indian Languages</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AI KRISHI MITRA ADVISOR */}
      <div className="card-vanguard" style={{ padding: '24px', border: '1.5px solid rgba(16, 185, 129, 0.35)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {t('ai_agri_advisor') || 'AI Agri Assistant (Krishi Mitra)'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Ask about crop diseases, fertilization ratios, market rates, or government subsidies in your language.
              </p>
            </div>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Volume2 size={15} /> Native Voice Support
          </span>
        </div>

        {/* Input Bar with Voice */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input 
              type="text" 
              value={aiQuery} 
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAgriAI()}
              placeholder={t('ask_ai_voice') || 'Ask AI in your language (Tap mic or type)...'}
              style={{ width: '100%', paddingRight: '50px', height: '48px' }}
            />
            <button 
              type="button" 
              onClick={toggleSpeech}
              title="Speak in your language"
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                background: isListening ? '#DC2626' : 'transparent',
                color: isListening ? '#fff' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          <button 
            type="button"
            onClick={() => handleAskAgriAI()}
            disabled={aiLoading || !aiQuery.trim()}
            style={{
              height: '48px', padding: '0 24px', borderRadius: 'var(--radius)',
              background: '#059669', color: '#fff', border: 'none',
              fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              opacity: (aiLoading || !aiQuery.trim()) ? 0.6 : 1, cursor: (aiLoading || !aiQuery.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {aiLoading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Ask Advice</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Question Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx} 
              type="button"
              onClick={() => {
                setAiQuery(prompt);
                handleAskAgriAI(prompt);
              }}
              style={{
                padding: '8px 14px', borderRadius: '20px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* AI Response Output */}
        {aiResponse && (
          <div style={{
            marginTop: '16px', padding: '18px 20px', borderRadius: '16px',
            background: 'var(--surface-2)', border: '1.5px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--text)', fontSize: '14px', lineHeight: '1.7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Sparkles size={16} />
              <span>Krishi Mitra Recommendation</span>
            </div>
            <div style={{ whiteSpace: 'pre-line' }}>
              {aiResponse}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MANDI CROP PRICE COMPARISON */}
      <div className="card-vanguard" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="var(--accent)" />
              <span>{t('mandi_prices') || 'Local Mandi Crop Rates & Price Comparison'}</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Compare rates across APMC mandis to maximize farm profits.
            </p>
          </div>

          {/* State Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                style={{ padding: '8px 32px 8px 14px', fontSize: '13px', fontWeight: 700, height: '40px' }}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>

            {/* Category Filter */}
            {['All', 'Cereals', 'Vegetables', 'Cash Crops', 'Oilseeds'].map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  height: '40px', padding: '0 16px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 700, border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--accent)' : 'var(--border)',
                  background: selectedCategory === cat ? 'var(--accent)' : 'var(--surface-2)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('crop_search') || 'Search crop (Paddy, Wheat, Tomato, Onion...)...'}
            style={{ width: '100%', paddingLeft: '44px', height: '46px' }}
          />
        </div>

        {/* Crop Price Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '16px'
        }}>
          {filteredCrops.map((crop) => {
            const priceDiff = crop.todayPrice - crop.yesterdayPrice;
            const pctChange = ((priceDiff / crop.yesterdayPrice) * 100).toFixed(1);
            const isPositive = priceDiff >= 0;

            return (
              <div 
                key={crop.id}
                className="card-vanguard"
                style={{
                  padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px',
                  background: 'var(--surface-2)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <span style={{
                        fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                        padding: '3px 8px', borderRadius: '6px',
                        background: 'var(--accent-soft)', color: 'var(--accent)'
                      }}>
                        {crop.category}
                      </span>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                        {crop.name}
                      </h3>
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 800,
                      background: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isPositive ? '#10B981' : '#EF4444'
                    }}>
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{isPositive ? `+${pctChange}%` : `${pctChange}%`}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                    <MapPin size={14} color="#EF4444" />
                    <span>{crop.mandi}, {crop.state} ({crop.distanceKm} km away)</span>
                  </div>
                </div>

                {/* Price Box */}
                <div style={{
                  padding: '12px 14px', borderRadius: '12px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today's Rate</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text)' }}>
                      ₹{crop.todayPrice.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{crop.unit}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Range</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                      ₹{crop.minPrice} - ₹{crop.maxPrice}
                    </div>
                  </div>
                </div>

                {/* Fertilizer Advice */}
                <div style={{
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#10B981', marginBottom: '2px' }}>
                    <Droplets size={14} />
                    <span>NPK: {crop.npk}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {crop.bestFertilizer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCrops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Sprout size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', fontWeight: 700 }}>No crops found matching your search or filters.</p>
            <button 
              type="button" 
              onClick={() => { setSelectedState('All States'); setSelectedCategory('All'); setSearchQuery(''); }}
              style={{ marginTop: '8px', background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textDecoration: 'underline' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: CROP CALENDAR & SOIL HEALTH GUIDE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        <div className="card-vanguard" style={{ padding: '20px', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Layers size={22} color="#06B6D4" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              {t('soil_advisory') || 'Soil Health & NPK Recommendation'}
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Get automated soil test recommendations. Test pH balance before sowing Kharif or Rabi crops to prevent fertilizer wastage by up to 30%.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--surface-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#3B82F6', fontSize: '13px' }}>Nitrogen (N)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leaf Growth</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--surface-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#10B981', fontSize: '13px' }}>Phosphorus (P)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Root Strength</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--surface-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#F59E0B', fontSize: '13px' }}>Potassium (K)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disease Immunity</div>
            </div>
          </div>
        </div>

        <div className="card-vanguard" style={{ padding: '20px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <ShieldAlert size={22} color="#F59E0B" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              Government Agriculture Schemes
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong style={{ color: 'var(--text)' }}>PM-KUSUM:</strong> 60% subsidy on Solar Agriculture Water Pumps.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong style={{ color: 'var(--text)' }}>Per Drop More Crop:</strong> 45-55% subsidy for Drip & Micro Irrigation.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong style={{ color: 'var(--text)' }}>PMFBY:</strong> Crop insurance protection against droughts and floods.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
