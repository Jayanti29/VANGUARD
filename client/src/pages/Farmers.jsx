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
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import { getAgriAdvice } from '../lib/gemini';
import toast from 'react-hot-toast';

// Comprehensive Mandi Crop Price Data for major Indian States & Mandis
const MANDI_DATA = [
  {
    id: 'paddy-basmati',
    name: 'Paddy / Rice (धान / ಭತ್ತ / நெல்)',
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
    optimalSoil: 'Clay Loam (pH 6.0-7.0)',
    bestFertilizer: 'Urea + DAP + Zinc Sulphate at tillering stage'
  },
  {
    id: 'paddy-sona',
    name: 'Paddy Sona Masoori (ಸೋನಾ ಮಸೂರಿ)',
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
    optimalSoil: 'Alluvial Loam',
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
    optimalSoil: 'Loamy Soil (pH 6.5-7.5)',
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
    optimalSoil: 'Sandy Loam (pH 6.0-6.8)',
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
    optimalSoil: 'Well-drained Fertile Loam',
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
    optimalSoil: 'Black Deep Cotton Soil',
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
    optimalSoil: 'Well Drained Loam',
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
    optimalSoil: 'Loose Sandy Loam (pH 5.2-6.4)',
    bestFertilizer: 'Potassium Schoenite + Well-rotted Farm Yard Manure'
  },
  {
    id: 'soybean-yellow',
    name: 'Soybean (सोयाबीन / ಸೋಯಾಬೀನ್)',
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
    optimalSoil: 'Clay Loam with good drainage',
    bestFertilizer: 'Bio-fertilizer Rhizobium seed treatment + SSP'
  },
  {
    id: 'chilli-guntur',
    name: 'Dry Red Chilli (सूखी लाल मिर्च / ಒಣ ಮೆಣಸಿನಕಾಯಿ)',
    crop: 'Chilli',
    category: 'Spices',
    state: 'Andhra Pradesh',
    mandi: 'Guntur Mirchi Yard',
    distanceKm: 28,
    todayPrice: 18500,
    yesterdayPrice: 18200,
    minPrice: 16500,
    maxPrice: 20500,
    unit: '₹/Quintal',
    trend: 'up',
    npk: '120:60:60 (N:P:K) + Magnesium',
    optimalSoil: 'Light Loam Soil',
    bestFertilizer: 'NPK 13:0:45 + Micronutrient spray for flowering'
  }
];

const STATES = ['All States', 'Karnataka', 'Maharashtra', 'Punjab', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh', 'Andhra Pradesh'];

const QUICK_PROMPTS = [
  'Best fertilizer ratio for Paddy crop right now?',
  'How to prevent yellow leaves and pests on Tomato plants?',
  'Government subsidy schemes for drip irrigation & solar pumps',
  'Organic bio-pesticides for stem borer in Maize & Cotton',
  'Current market price trend & when to sell stored Wheat?'
];

export default function Farmers() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { dbUser } = useAuth();

  // State Management
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
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <PageHeader 
        title={t('farmers_title') || 'Farmers Mandi & Agri Dashboard'} 
        subtitle="Compare real-time local mandi crop rates, calculate fertilization needs, and consult AI in your language."
      />

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-vanguard p-4 flex items-center gap-3 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-muted uppercase">Tracked Crops</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">24+ Commodities</div>
          </div>
        </div>

        <div className="card-vanguard p-4 flex items-center gap-3 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-muted uppercase">Connected Mandis</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">120+ APMC Yards</div>
          </div>
        </div>

        <div className="card-vanguard p-4 flex items-center gap-3 border-l-4 border-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-muted uppercase">Weather Outlook</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">28°C • Good Sowing</div>
          </div>
        </div>

        <div className="card-vanguard p-4 flex items-center gap-3 border-l-4 border-cyan-500">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-muted uppercase">AI Krishi Mitra</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">10 Indian Languages</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AI KRISHI MITRA ADVISOR */}
      <div className="card-vanguard p-6 bg-gradient-to-br from-emerald-500/5 via-surface to-cyan-500/5 border-emerald-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('ai_agri_advisor') || 'AI Agri Assistant (Krishi Mitra)'}
              </h2>
              <p className="text-xs text-text-muted font-medium">
                Ask about fertilization ratios, pest solutions, government subsidies, or sowing tips.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            🌾 Active Voice Engine
          </span>
        </div>

        {/* Input Bar with Voice */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              value={aiQuery} 
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAgriAI()}
              placeholder={t('ask_ai_voice') || 'Ask AI in your language (Tap mic or type)...'}
              className="w-full pl-4 pr-12 py-3 bg-surface-2 border border-border rounded-xl text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              type="button" 
              onClick={toggleSpeech}
              title="Speak in your language"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-text-muted hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="button"
            onClick={() => handleAskAgriAI()}
            disabled={aiLoading || !aiQuery.trim()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            {aiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask Advice</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Question Pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx} 
              type="button"
              onClick={() => {
                setAiQuery(prompt);
                handleAskAgriAI(prompt);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-emerald-500 text-[11px] font-semibold text-text-muted hover:text-emerald-600 transition-colors text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* AI Response Output */}
        {aiResponse && (
          <div className="mt-4 p-4 rounded-2xl bg-surface border border-emerald-500/40 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Krishi Mitra Recommendation</span>
            </div>
            <div className="text-sm text-text font-normal leading-relaxed whitespace-pre-line">
              {aiResponse}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MANDI CROP PRICE COMPARISON */}
      <div className="card-vanguard p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>{t('mandi_prices') || 'Local Mandi Crop Rates & Price Comparison'}</span>
            </h2>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              Compare rates across APMC mandis to maximize farm profits.
            </p>
          </div>

          {/* State Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="appearance-none bg-surface-2 border border-border rounded-xl px-4 py-2 pr-8 text-xs font-bold text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
            </div>

            {/* Category Filter */}
            {['All', 'Cereals', 'Vegetables', 'Cash Crops', 'Oilseeds', 'Spices'].map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-accent text-white shadow-sm' 
                    : 'bg-surface-2 text-text-muted hover:text-text border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('crop_search') || 'Search crop (Paddy, Wheat, Tomato...)...'}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-xs font-medium text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Crop Price Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => {
            const priceDiff = crop.todayPrice - crop.yesterdayPrice;
            const pctChange = ((priceDiff / crop.yesterdayPrice) * 100).toFixed(1);
            const isPositive = priceDiff >= 0;

            return (
              <div 
                key={crop.id}
                className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-accent/40 transition-all hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent px-2 py-0.5 rounded-md bg-accent/10">
                        {crop.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {crop.name}
                      </h3>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isPositive ? `+${pctChange}%` : `${pctChange}%`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium mt-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{crop.mandi}, {crop.state} ({crop.distanceKm} km away)</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-3 rounded-xl bg-surface border border-border/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase">Today's Rate</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{crop.todayPrice.toLocaleString()} <span className="text-[11px] font-semibold text-text-muted">{crop.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-text-muted uppercase">Range (Min-Max)</div>
                    <div className="text-xs font-extrabold text-text">
                      ₹{crop.minPrice} - ₹{crop.maxPrice}
                    </div>
                  </div>
                </div>

                {/* Fertilization & Soil Health Pill */}
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>NPK Ratio: {crop.npk}</span>
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-2">
                    {crop.bestFertilizer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCrops.length === 0 && (
          <div className="text-center py-12 text-text-muted space-y-2">
            <Sprout className="w-10 h-10 mx-auto text-text-light opacity-50" />
            <p className="text-sm font-bold">No crops found matching your filters.</p>
            <button 
              type="button"
              onClick={() => { setSelectedState('All States'); setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-xs text-accent font-bold underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: CROP CALENDAR & SOIL HEALTH GUIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-vanguard p-5 space-y-3 border-l-4 border-cyan-500">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('soil_advisory') || 'Soil Health & NPK Recommendation'}
            </h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Get automated soil test recommendations. Test pH balance before sowing Kharif or Rabi crops to prevent fertilizer wastage by up to 30%.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-surface-2 border border-border">
              <div className="font-extrabold text-blue-600 dark:text-blue-400">Nitrogen (N)</div>
              <div className="text-[10px] text-text-muted">Leaf Growth</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-2 border border-border">
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400">Phosphorus (P)</div>
              <div className="text-[10px] text-text-muted">Root Strength</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-2 border border-border">
              <div className="font-extrabold text-amber-600 dark:text-amber-400">Potassium (K)</div>
              <div className="text-[10px] text-text-muted">Disease Resistance</div>
            </div>
          </div>
        </div>

        <div className="card-vanguard p-5 space-y-3 border-l-4 border-amber-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Government Agriculture Schemes
            </h3>
          </div>
          <ul className="text-xs text-text-muted space-y-2">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>PM-KUSUM:</strong> 60% subsidy on Solar Agriculture Pumps.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Per Drop More Crop:</strong> 45-55% subsidy for Micro/Drip Irrigation systems.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>PMFBY:</strong> Comprehensive Crop Insurance for natural calamity protection.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
