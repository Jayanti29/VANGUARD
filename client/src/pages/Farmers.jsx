import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  CloudRain, 
  Droplets, 
  Sun, 
  AlertCircle, 
  Sparkles, 
  Mic, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ExternalLink,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Loader2,
  Bot,
  MessageSquare
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useLanguage, getSpeechLang } from '../contexts/LanguageContext';
import { getAgriAdvice } from '../lib/gemini';
import toast from 'react-hot-toast';

// Comprehensive Indian Mandi Crop Datasets
export const MANDI_DATASETS = [
  {
    id: 'paddy',
    name: 'Paddy (Rice / धान / ਭੱਤ)',
    category: 'Grains',
    state: 'Karnataka',
    mandi: 'Ramanagara Main Mandi',
    todayPrice: 2450,
    yesterdayPrice: 2380,
    minPrice: 2200,
    maxPrice: 2600,
    unit: '₹ / Quintal',
    trend: 'up',
    percentChange: '+2.9%',
    arrivals: '620 Quintals',
    quality: 'Grade A',
  },
  {
    id: 'wheat',
    name: 'Wheat (गेहूं / ਕਣਕ)',
    category: 'Grains',
    state: 'Punjab',
    mandi: 'Ludhiana Central Mandi',
    todayPrice: 2275,
    yesterdayPrice: 2275,
    minPrice: 2150,
    maxPrice: 2350,
    unit: '₹ / Quintal',
    trend: 'stable',
    percentChange: '0.0%',
    arrivals: '1200 Quintals',
    quality: 'Sharbati Premium',
  },
  {
    id: 'tomato',
    name: 'Tomato (टमाटर / ಟೊಮೆಟೊ)',
    category: 'Vegetables',
    state: 'Karnataka',
    mandi: 'Kolar Wholesale Mandi',
    todayPrice: 1850,
    yesterdayPrice: 2100,
    minPrice: 1400,
    maxPrice: 2200,
    unit: '₹ / Quintal',
    trend: 'down',
    percentChange: '-11.9%',
    arrivals: '850 Quintals',
    quality: 'Hybrid Red',
  },
  {
    id: 'onion',
    name: 'Onion (प्याज / ಈರುള്ളി)',
    category: 'Vegetables',
    state: 'Maharashtra',
    mandi: 'Lasalgaon Mandi',
    todayPrice: 3200,
    yesterdayPrice: 2950,
    minPrice: 2700,
    maxPrice: 3450,
    unit: '₹ / Quintal',
    trend: 'up',
    percentChange: '+8.4%',
    arrivals: '1500 Quintals',
    quality: 'Nashik Pink',
  },
  {
    id: 'cotton',
    name: 'Cotton (कपास / ಹತ್ತಿ)',
    category: 'Commercial',
    state: 'Maharashtra',
    mandi: 'Nagpur Cotton Market',
    todayPrice: 7150,
    yesterdayPrice: 7000,
    minPrice: 6800,
    maxPrice: 7400,
    unit: '₹ / Quintal',
    trend: 'up',
    percentChange: '+2.1%',
    arrivals: '430 Quintals',
    quality: 'Long Staple',
  },
  {
    id: 'maize',
    name: 'Maize (मक्का / ಮೆಕ್ಕೆಜೋಳ)',
    category: 'Grains',
    state: 'Karnataka',
    mandi: 'Davangere APMC Mandi',
    todayPrice: 1980,
    yesterdayPrice: 2020,
    minPrice: 1850,
    maxPrice: 2100,
    unit: '₹ / Quintal',
    trend: 'down',
    percentChange: '-1.9%',
    arrivals: '980 Quintals',
    quality: 'Yellow Kernel',
  },
  {
    id: 'potato',
    name: 'Potato (आलू / glass)',
    category: 'Vegetables',
    state: 'Uttar Pradesh',
    mandi: 'Agra APMC Yard',
    todayPrice: 1420,
    yesterdayPrice: 1400,
    minPrice: 1250,
    maxPrice: 1550,
    unit: '₹ / Quintal',
    trend: 'up',
    percentChange: '+1.4%',
    arrivals: '1100 Quintals',
    quality: 'Kufri Jyoti',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (गन्ना / sugarcane)',
    category: 'Commercial',
    state: 'Uttar Pradesh',
    mandi: 'Muzaffarnagar Mill Yard',
    todayPrice: 355,
    yesterdayPrice: 355,
    minPrice: 340,
    maxPrice: 370,
    unit: '₹ / Quintal',
    trend: 'stable',
    percentChange: '0.0%',
    arrivals: '3200 Quintals',
    quality: 'High Sucrose',
  },
  {
    id: 'soyabean',
    name: 'Soyabean (सोयाबीन)',
    category: 'Commercial',
    state: 'Madhya Pradesh',
    mandi: 'Indore APMC Yard',
    todayPrice: 4650,
    yesterdayPrice: 4500,
    minPrice: 4300,
    maxPrice: 4850,
    unit: '₹ / Quintal',
    trend: 'up',
    percentChange: '+3.3%',
    arrivals: '750 Quintals',
    quality: 'Yellow Bold',
  },
  {
    id: 'chillies',
    name: 'Red Chillies (लाल मिर्च)',
    category: 'Spices',
    state: 'Andhra Pradesh',
    mandi: 'Guntur Spices Yard',
    todayPrice: 18400,
    yesterdayPrice: 18900,
    minPrice: 16500,
    maxPrice: 19800,
    unit: '₹ / Quintal',
    trend: 'down',
    percentChange: '-2.6%',
    arrivals: '310 Quintals',
    quality: 'Teja Superior',
  }
];

export default function Farmers() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  const [selectedState, setSelectedState] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // AI Advisory state
  const [queryInput, setQueryInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const recognitionRef = useRef(null);

  // States list
  const statesList = ['All', 'Karnataka', 'Punjab', 'Maharashtra', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh'];
  const categoriesList = ['All', 'Grains', 'Vegetables', 'Commercial', 'Spices'];

  // Prompt Pills
  const promptPills = [
    { label: t('ask_fertilizer', 'Best NPK fertilizer ratio for Paddy crop'), query: 'What is the optimal NPK fertilizer ratio and timing for Paddy crop in India?' },
    { label: t('pest_control', 'How to prevent yellow leaves on Tomato'), query: 'How to prevent yellowing leaves and early blight disease in tomato plants organically and chemically?' },
    { label: t('govt_subsidy', 'Government subsidy for drip irrigation'), query: 'What are the government subsidies and application procedures for installing drip irrigation systems under PMKSY?' },
    { label: '🌤 Optimal Sowing & Rainfall Window', query: 'What precautions should farmers take before harvesting crops during unexpected light rain?' }
  ];

  // Configure Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = getSpeechLang(currentLang);

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setQueryInput(text);
        setIsListening(false);
      };

      rec.onerror = (err) => {
        console.error("Agri Speech Recognition Error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [currentLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleAskAI = async (textToAsk = queryInput) => {
    if (!textToAsk.trim()) {
      toast.error("Please enter or record a question first.");
      return;
    }
    setAiLoading(true);
    try {
      const answer = await getAgriAdvice(textToAsk, 'India', currentLang);
      setAiResponse(answer);
    } catch (e) {
      console.error(e);
      toast.error("Failed to get agricultural advice. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filter crops
  const filteredCrops = MANDI_DATASETS.filter(item => {
    const matchesState = selectedState === 'All' || item.state === selectedState;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.mandi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title={t('farmers_title', 'Farmers Mandi & Agri Dashboard')}
        subtitle={t('farmers_subtitle', 'Real-time crop price comparison, AI Agri Advisory & Weather Insights')}
      />

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Active Mandis</span>
            <h4 className="text-base font-black text-[var(--text)]">142+ APMC Yards</h4>
          </div>
        </div>
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Tracked Commodities</span>
            <h4 className="text-base font-black text-[var(--text)]">24+ Major Crops</h4>
          </div>
        </div>
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Weather Alert</span>
            <h4 className="text-base font-black text-[var(--text)]">29°C (Light Rain)</h4>
          </div>
        </div>
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Soil Moisture</span>
            <h4 className="text-base font-black text-[var(--text)]">68% Optimal</h4>
          </div>
        </div>
      </div>

      {/* AI Agricultural Assistant Card */}
      <div className="p-6 bg-gradient-to-br from-emerald-950/40 to-teal-900/30 border border-emerald-500/30 rounded-2xl space-y-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
                {t('ai_agri_advisor', 'AI Agri Assistant (Krishi Mitra)')}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Ask crop advice, pest control solutions, fertilizer schedules in your native Indian language
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            Powered by Gemini AI
          </span>
        </div>

        {/* Input & Voice Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder={t('ai_agri_placeholder', 'Ask Krishi Mitra AI (e.g. Best fertilizer for Paddy, tomato yellow leaf cure...)...')}
              className="w-full pl-4 pr-12 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            <button
              onClick={toggleListening}
              className={`absolute right-2 top-2 p-1.5 rounded-lg transition cursor-pointer ${
                isListening ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-emerald-500'
              }`}
              title="Voice Input in Native Script"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <button
            disabled={aiLoading}
            onClick={() => handleAskAI()}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md flex-shrink-0"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask AI</span>
          </button>
        </div>

        {/* Pre-loaded Smart Prompt Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Suggested Prompts:</span>
          <div className="flex flex-wrap gap-2">
            {promptPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryInput(pill.query);
                  handleAskAI(pill.query);
                }}
                className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500 text-xs font-semibold text-[var(--text)] rounded-xl transition cursor-pointer shadow-sm text-left"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Response Output Display */}
        {aiResponse && (
          <div className="p-4 bg-[var(--surface)] border border-emerald-500/40 rounded-xl space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 border-b border-[var(--border)] pb-2">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4" /> VANGUARD Krishi Mitra Response
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Multi-lingual AI Advice</span>
            </div>
            <div className="text-sm font-medium text-[var(--text)] whitespace-pre-line leading-relaxed">
              {aiResponse}
            </div>
          </div>
        )}
      </div>

      {/* Local Mandi Crop Price Engine Header & Filters */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              {t('mandi_prices', 'Local Mandi Crop Rates')}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live APMC market daily arrivals, price comparison & percentage trends
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('crop_search', 'Search crop (Paddy, Wheat, Tomato...)...')}
              className="w-full pl-9 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[var(--text-muted)] mr-1">{t('state_select', 'State')}:</span>
            {statesList.map(st => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedState === st 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[var(--text-muted)] mr-1">Category:</span>
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-[var(--accent)] text-white shadow-sm' 
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mandi Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredCrops.map(crop => (
            <div 
              key={crop.id}
              className="p-5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 transition shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mb-1">
                      {crop.category} • {crop.state}
                    </span>
                    <h4 className="text-base font-extrabold text-[var(--text)]">{crop.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {crop.mandi}
                    </p>
                  </div>

                  {/* Trend badge */}
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 ${
                    crop.trend === 'up' ? 'bg-emerald-500/15 text-emerald-600' :
                    crop.trend === 'down' ? 'bg-red-500/15 text-red-600' : 'bg-slate-500/15 text-slate-600'
                  }`}>
                    {crop.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {crop.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {crop.trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                    {crop.percentChange}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">{t('today_price', "Today's Rate")}</span>
                    <span className="text-xl font-black text-[var(--text)]">₹{crop.todayPrice.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-1">/ Quintal</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">{t('yesterday_price', "Yesterday's Rate")}</span>
                    <span className="text-sm font-bold text-slate-400 line-through">₹{crop.yesterdayPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Min / Max Range Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)]">
                    <span>Min: ₹{crop.minPrice}</span>
                    <span>Arrivals: {crop.arrivals}</span>
                    <span>Max: ₹{crop.maxPrice}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                      style={{
                        width: `${Math.min(100, Math.max(15, ((crop.todayPrice - crop.minPrice) / (crop.maxPrice - crop.minPrice)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                <span>Quality: <strong className="text-[var(--text)]">{crop.quality}</strong></span>
                <span className="text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                  Mandi History <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCrops.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)] font-bold text-sm">
            No crops found matching your state or search query. Try clearing filters.
          </div>
        )}
      </div>
    </div>
  );
}
