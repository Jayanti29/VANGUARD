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
  Calendar
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useLanguage, getSpeechLang } from '../contexts/LanguageContext';
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
    name: 'Onion (प्याज / ಈరుള്ളി)',
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
    name: 'Potato (आलू / ಆಲೂಗಡ್ಡೆ)',
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
    name: 'Sugarcane (गन्ना / ಕಬ್ಬು)',
    category: 'Commercial',
    state: 'Uttar Pradesh',
    mandi: 'Muzaffarnagar Mill Yard',
    todayPrice: 355,
    yesterdayPrice: 355,
    minPrice: 340,
    maxPrice: 370,
    unit: '₹ / Quintal (FRP)',
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

  // AI Assistant state
  const [queryInput, setQueryInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const recognitionRef = useRef(null);

  // States list
  const statesList = ['All', 'Karnataka', 'Punjab', 'Maharashtra', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Tamil Nadu', 'West Bengal', 'Gujarat'];
  const categoriesList = ['All', 'Grains', 'Vegetables', 'Commercial', 'Spices'];

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
    </div>
  );
}
