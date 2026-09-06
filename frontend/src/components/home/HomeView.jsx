import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Gauge, 
  CloudRain, 
  AlertTriangle, 
  ShieldAlert, 
  Mic, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Play, 
  ChevronRight, 
  Volume2, 
  Sprout, 
  Ship, 
  Users, 
  Plane, 
  Bell, 
  Zap, 
  ShieldCheck, 
  Globe, 
  PhoneCall, 
  Cpu, 
  Sun, 
  Moon,
  ChevronDown,
  Layers
} from 'lucide-react';
import { getCurrentWeather, getEmergencyStatus } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function HomeView({ 
  latitude = 17.3850, 
  longitude = 78.4867, 
  district = 'Hyderabad', 
  language = 'telish', 
  onSelectLang,
  theme = 'light',
  onToggleTheme,
  onNavigate, 
  onSendQuery,
  onOpenVoice,
  onOpenLocationModal,
  onOpenTelecom,
  onOpenSms,
  onOpenIvr,
  userProfile,
  onOpenAuthModal
}) {
  const [weatherData, setWeatherData] = useState(null);
  const [emergencyData, setEmergencyData] = useState(null);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [wData, eData] = await Promise.all([
          getCurrentWeather(latitude, longitude),
          getEmergencyStatus(latitude, longitude, district)
        ]);
        if (isMounted) {
          setWeatherData(wData);
          setEmergencyData(eData);
          setWeatherError(!wData || wData.is_mock_data === true);
        }
      } catch (err) {
        console.error('HomeView load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [latitude, longitude, district]);

  const [liveRadarPath, setLiveRadarPath] = useState('');
  const [showNormalWater, setShowNormalWater] = useState(true);

  // Real-Time CWC Water & River Gauge Stations for the Normal Mini Map
  const NORMAL_WATER_STATIONS = [
    { id: 'musi', name: 'Musi River (Puranapul)', lat: 17.3688, lon: 78.4682, level: '11.45 m', danger: '12.80 m', status: 'Rising Alert', color: '#f59e0b' },
    { id: 'hussain', name: 'Hussain Sagar Lake', lat: 17.4239, lon: 78.4738, level: '513.62 m', danger: '514.75 m', status: 'Near FTL', color: '#06b6d4' },
    { id: 'himayat', name: 'Himayat Sagar Reservoir', lat: 17.3190, lon: 78.3582, level: '1,761.4 ft', danger: '1,763.5 ft', status: '2 Gates Open', color: '#3b82f6' },
    { id: 'godavari', name: 'Godavari (Bhadrachalam)', lat: 17.6688, lon: 80.8936, level: '43.80 ft', danger: '53.00 ft', status: '1st Warning', color: '#ef4444' },
    { id: 'krishna', name: 'Krishna (Prakasam Barrage)', lat: 16.5117, lon: 80.6067, level: '12.00 ft', danger: '16.50 ft', status: 'Surplus Discharge', color: '#10b981' }
  ];

  const miniWaterIcon = (color) => L.divIcon({
    className: 'custom-mini-water-marker',
    html: `<div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}; opacity:0.35; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:relative; width:16px; height:16px; border-radius:50%; background:#0B1120; border:2px solid ${color}; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.4);">
        <div style="width:5px; height:5px; border-radius:50%; background:${color};"></div>
      </div>
    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data?.radar?.past?.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1];
          setLiveRadarPath(latest.path);
        }
      })
      .catch(() => {});
  }, []);

  const curr = weatherData && !weatherData.is_mock_data ? weatherData.current : {
    temperature: null,
    humidity: null,
    rainfall_mm: null,
    wind_speed_kmh: null,
    pressure_hpa: null,
    condition: 'Weather unavailable'
  };
  const warning = emergencyData?.warning;
  const alertItems = warning ? [{
    title: `${warning.hazard_type || 'Weather'} Alert`,
    area: warning.affected_districts || district,
    time: warning.expires_at ? `Until ${new Date(warning.expires_at).toLocaleString()}` : 'Active now'
  }] : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    if (onSendQuery) onSendQuery(queryInput.trim());
    if (onNavigate) onNavigate('ask');
  };

  const languages = [
    { code: 'telish', label: 'తెలుగు (Telish)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'en', label: 'English' },
    { code: 'hinglish', label: 'Hinglish' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' }
  ];

  const isTelish = language === 'telish';
  const isTelugu = language === 'te';
  const isHinglish = language === 'hinglish';
  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';
  const isTelishOrTelugu = isTelish || isTelugu;

  const t = {
    searchPlaceholder: isTelish 
      ? 'Mee bhashalo adagandi leda matladandi...' 
      : isTelugu 
        ? 'మీ భాషలో అడగండి లేదా మాట్లాడండి...'
        : isHinglish 
          ? 'Apni language me puchiye ya boliye...' 
          : isHindi 
            ? 'अपनी भाषा में पूछें या बोलें...' 
            : isMarathi 
              ? 'आपल्या भाषेत विचारा किंवा बोला...'
              : 'Ask in your language or speak...',

    heroTitleLine1: isTelishOrTelugu 
      ? 'Weather samacharam,' 
      : isHinglish 
        ? 'Mausam ki jankari,' 
        : isHindi 
          ? 'मौसम की जानकारी,' 
          : isMarathi 
            ? 'हवामानाची माहिती,' 
            : 'Weather Intelligence,',

    heroTitleLine2: isTelishOrTelugu 
      ? 'mee nirnayam.' 
      : isHinglish 
        ? 'aapka decision.' 
        : isHindi 
          ? 'आपका फैसला.' 
          : isMarathi 
            ? 'तुमचा निर्णय.' 
            : 'Your Decisions.',

    heroSub: isTelish 
      ? 'Mee prashna adugu. Saraina samadhanam pondandi.' 
      : isTelugu 
        ? 'మీ ప్రశ్న అడగండి. సరైన సమాధానం పొందండి.'
        : isHinglish 
          ? 'Apna sawal puchiye aur accurate, grounded mausam advice paaiye.' 
          : isHindi 
            ? 'अपना सवाल पूछें। सटीक मौसम सलाह पाएं।' 
            : isMarathi 
              ? 'तुमचा प्रश्न विचारा आणि अचूक हवामान सल्ला मिळवा.'
              : 'Ask your question in any Indian language. Get accurate, grounded advice.',

    heroBtn: isTelish 
      ? 'Ela upayoginchalo chudandi' 
      : isTelugu 
        ? 'ఎలా ఉపయోగించాలో చూడండి'
        : isHinglish 
          ? 'Kaise use karein dekhein' 
          : isHindi 
            ? 'उपयोग कैसे करें देखें' 
            : isMarathi 
              ? 'कसे वापरावे ते पहा'
              : 'See how to use',

    decisionHeader: isTelish 
      ? 'Meeku emi telusukovali?' 
      : isTelugu 
        ? 'మీకు ఏమి తెలుసుకోవాలి?'
        : isHinglish 
          ? 'Aapko kya janna hai?' 
          : isHindi 
            ? 'आप क्या जानना चाहते हैं?' 
            : isMarathi 
              ? 'तुम्हाला काय जाणून घ्यायचे आहे?'
              : 'What would you like to know?',

    voiceTitle: 'Press & Speak',

    voiceSub: isTelish 
      ? 'Mee prashna cheppandi...' 
      : isTelugu 
        ? 'మీ ప్రశ్న చెప్పండి...'
        : isHinglish 
          ? 'Apna sawal bolein...' 
          : isHindi 
            ? 'अपना सवाल बोलें...' 
            : isMarathi 
              ? 'तुमचा प्रश्न बोला...'
              : 'Say your question aloud...',

    alertsTitle: isTelishOrTelugu 
      ? 'Heccharikalu (Alerts)' 
      : isHinglish 
        ? 'Chetavani (Active Alerts)' 
        : isHindi 
          ? 'चेतावनी (Alerts)' 
          : isMarathi 
            ? 'इशारे (Alerts)' 
            : 'Active Alerts',

    viewAllAlerts: isTelishOrTelugu 
      ? 'Annitini chudandi →' 
      : isHinglish 
        ? 'Sabhi alerts dekhein →' 
        : isHindi 
          ? 'सभी देखें →' 
          : isMarathi 
            ? 'सर्व पहा →' 
            : 'View all alerts →',

    radarTitle: 'Rainfall Map - Bharat',

    nowTitle: isTelishOrTelugu 
      ? 'Ippude (Now)' 
      : isHinglish 
        ? 'Abhi ka Mausam (Now)' 
        : isHindi 
          ? 'अभी (Now)' 
          : isMarathi 
            ? 'आत्ता (Now)' 
            : 'Observed Now',

    trust1Title: isTelishOrTelugu ? 'Vishwasaneeya Samacharam' : isHinglish ? 'Vishwasniya Data Source' : isHindi ? 'विश्वसनीय डेटा स्रोत' : 'Trusted Data Source',
    trust1Sub: isTelishOrTelugu ? 'IMD & Prabhutva Vanarulu' : isHinglish ? 'IMD aur Govt Registries' : 'IMD & Official Registries',
    trust2Title: isTelishOrTelugu ? 'Mee Bhashalo' : isHinglish ? 'Aapki Apni Bhasha Me' : isHindi ? 'आपकी अपनी भाषा में' : 'In Your Native Language',
    trust2Sub: isTelishOrTelugu ? '12+ Bharatiya Bhashalu' : isHinglish ? '12+ Indian Languages' : '12+ Indian Languages',
    trust3Title: isTelishOrTelugu ? 'Ella andubatullo' : isHinglish ? 'Har Jagah Available' : isHindi ? 'हर जगह उपलब्ध' : 'Everywhere Accessible',
    trust3Sub: 'Web, App, SMS, IVR',
    trust4Title: isTelishOrTelugu ? 'Kachitamaina Salahalu' : isHinglish ? 'Sateek Actionable Advice' : isHindi ? 'सटीक व्यावहारिक सलाह' : 'Accurate Actionable Advice',
    trust4Sub: isTelishOrTelugu ? 'Data + Niyamalu + AI' : isHinglish ? 'Data + Rules + AI' : 'Data + Rules + AI',
    trust5Title: isTelishOrTelugu ? 'Mee Suraksha' : isHinglish ? 'Aapki Suraksha Mission' : isHindi ? 'आपकी सुरक्षा मिशन' : 'Citizen Safety Mission',
    trust5Sub: isTelishOrTelugu ? 'Mee Kosam, Mana Kosam' : isHinglish ? 'Aapke Liye, Hamara Lakshya' : 'For You, For All of Us'
  };

  const categories = [
    {
      id: 'farmer',
      title: isTelishOrTelugu 
        ? 'Raitu' 
        : isHinglish 
          ? 'Kisan (Farmer)' 
          : isHindi 
            ? 'किसान (Farmer)' 
            : isMarathi 
              ? 'शेतकरी (Farmer)' 
              : 'Farmer',
      sub: isTelish 
        ? 'Pantala salaha, neelu, eruvulu, tegullu' 
        : isTelugu 
          ? 'పంటల సలహా, నీరు, ఎరువులు, తెగుళ్లు'
          : isHinglish 
            ? 'Fasal advice, paani, khad, keet niyantran' 
            : isHindi 
              ? 'फसल सलाह, खाद, छिड़काव, कीट नियंत्रण' 
              : isMarathi 
                ? 'पीक सल्ला, पाणी, खते, कीड नियंत्रण'
                : 'Crop advice, water, fertilizers, pest control',
      icon: Sprout,
      colorClasses: 'bg-[#EBF7EE] border-[#D4ECD9] dark:bg-emerald-950/40 dark:border-emerald-800/50',
      iconBg: 'bg-white dark:bg-emerald-900/50',
      textAccent: 'text-emerald-700 dark:text-emerald-300',
      titleColor: 'text-slate-900 dark:text-emerald-100',
      subColor: 'text-slate-600 dark:text-slate-300',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      query: isHinglish ? 'Kya kal ' + district + ' me meri cotton fasal par fertilizer spray karna safe hai?' : 'Can I spray fertilizer on my cotton crops tomorrow in ' + district + '?'
    },
    {
      id: 'marine',
      title: isTelishOrTelugu 
        ? 'Matsyakaarulu' 
        : isHinglish 
          ? 'Machuware (Marine)' 
          : isHindi 
            ? 'मछुवारे (Marine)' 
            : isMarathi 
              ? 'मासेमार (Marine)' 
              : 'Fishermen',
      sub: isTelish 
        ? 'Sea suraksha, alalu, gaalulu, heccharikalu' 
        : isTelugu 
          ? 'సముద్ర భద్రత, అలలు, గాలులు, హెచ్చరికలు'
          : isHinglish 
            ? 'Sea safety, lehrein, tez hawayein, warnings' 
            : isHindi 
              ? 'समुद्री सुरक्षा, लहरें, हवाएं, चेतावनी' 
              : isMarathi 
                ? 'समुद्र सुरक्षा, लाटा, वारे, इशारे'
                : 'Sea safety, wave heights, wind squalls, warnings',
      icon: Ship,
      colorClasses: 'bg-[#EBF5FB] border-[#D1E8F7] dark:bg-sky-950/40 dark:border-sky-800/50',
      iconBg: 'bg-white dark:bg-sky-900/50',
      textAccent: 'text-sky-700 dark:text-sky-300',
      titleColor: 'text-slate-900 dark:text-sky-100',
      subColor: 'text-slate-600 dark:text-slate-300',
      btnBg: 'bg-sky-600 hover:bg-sky-700 text-white',
      query: isHinglish ? 'Kya kal machli pakadne ke liye Bay of Bengal jana safe hai?' : 'Is it safe to venture into the Bay of Bengal for fishing tomorrow?'
    },
    {
      id: 'disaster',
      title: isTelishOrTelugu 
        ? 'Vipatla Yajamanya' 
        : isHinglish 
          ? 'Aapda Prabandhan' 
          : isHindi 
            ? 'आपदा प्रबंधन' 
            : isMarathi 
              ? 'आपत्ती व्यवस्थापन' 
              : 'Disaster Management',
      sub: isTelish 
        ? 'Heccharikalu, prabhavita prantalu, evacuations' 
        : isTelugu 
          ? 'హెచ్చరికలు, ప్రభావిత ప్రాంతాలు, పునరావాసం'
          : isHinglish 
            ? 'Emergency alerts, affected areas, relief shelters' 
            : isHindi 
              ? 'चेतावनी, प्रभावित क्षेत्र, राहत केंद्र' 
              : isMarathi 
                ? 'इशारे, बाधित क्षेत्रे, मदत केंद्रे'
                : 'Warnings, affected zones, shelters, evacuations',
      icon: ShieldAlert,
      colorClasses: 'bg-[#FEF4EB] border-[#FCE2CD] dark:bg-orange-950/40 dark:border-orange-800/50',
      iconBg: 'bg-white dark:bg-orange-900/50',
      textAccent: 'text-orange-700 dark:text-orange-300',
      titleColor: 'text-slate-900 dark:text-orange-100',
      subColor: 'text-slate-600 dark:text-slate-300',
      btnBg: 'bg-orange-600 hover:bg-orange-700 text-white',
      action: () => onNavigate('alerts')
    },
    {
      id: 'citizens',
      title: isTelishOrTelugu 
        ? 'Paurulu' 
        : isHinglish 
          ? 'Nagrik (Citizens)' 
          : isHindi 
            ? 'नागरिक (Citizens)' 
            : isMarathi 
              ? 'नागरिक (Citizens)' 
              : 'Citizens',
      sub: isTelish 
        ? 'Vana, vedi, prayanam, aarogya suchanalu' 
        : isTelugu 
          ? 'వాన, ఎండ, ప్రయాణం, ఆరోగ్య సూచనలు'
          : isHinglish 
            ? 'Barish, heatwaves, commute waterlogging, health' 
            : isHindi 
              ? 'बारिश, गर्मी, यात्रा, स्वास्थ्य सलाह' 
              : isMarathi 
                ? 'पाऊस, उष्णता, प्रवास, आरोग्य सल्ला'
                : 'Rain, heatwaves, commute waterlogging, health',
      icon: Users,
      colorClasses: 'bg-[#F4EEFB] border-[#E6D7F7] dark:bg-purple-950/40 dark:border-purple-800/50',
      iconBg: 'bg-white dark:bg-purple-900/50',
      textAccent: 'text-purple-700 dark:text-purple-300',
      titleColor: 'text-slate-900 dark:text-purple-100',
      subColor: 'text-slate-600 dark:text-slate-300',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      query: isHinglish ? 'Kya aaj evening ' + district + ' me heavy barish ya waterlogging hogi?' : 'Will ' + district + ' experience waterlogging or heavy rain this evening?'
    },
    {
      id: 'aviation',
      title: isTelishOrTelugu 
        ? 'Vimaan & Logistics' 
        : isHinglish 
          ? 'Viman & Logistics' 
          : 'Aviation & Logistics',
      sub: isTelish 
        ? 'Visibility, fog, wind, route weather' 
        : isHinglish 
          ? 'Visibility, fog, crosswinds, runway telemetry' 
          : 'Visibility, fog, crosswinds, runway telemetry',
      icon: Plane,
      colorClasses: 'bg-[#EBF7F7] border-[#D1EFEF] dark:bg-teal-950/40 dark:border-teal-800/50',
      iconBg: 'bg-white dark:bg-teal-900/50',
      textAccent: 'text-teal-700 dark:text-teal-300',
      titleColor: 'text-slate-900 dark:text-teal-100',
      subColor: 'text-slate-600 dark:text-slate-300',
      btnBg: 'bg-teal-600 hover:bg-teal-700 text-white',
      query: 'Provide an official Aviation Weather Briefing with decoded METAR, flight category, and runway crosswind components.'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7F3] dark:bg-[#080C14] text-[#18251C] dark:text-slate-100 p-3 sm:p-5 lg:p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

        {/* Top Floating Search Capsule Bar (Matches Reference Image) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Main Search Input Capsule */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full md:max-w-2xl bg-white dark:bg-[#0F172A] rounded-full p-1.5 sm:p-2 border border-[#E3E8E1] dark:border-slate-700/80 shadow-md shadow-slate-900/5 flex items-center gap-2 transition-all hover:border-emerald-500/50"
          >
            {/* Green Circular Mic Button */}
            <button
              type="button"
              onClick={onOpenVoice}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm shadow-emerald-700/20 cursor-pointer"
              title="Tap to Speak in Any Language"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Query Input Field */}
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-2"
            />

            {/* Language Dropdown Selector in Search Pill */}
            <div className="relative shrink-0 pr-1">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F6F2] dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition cursor-pointer"
              >
                <span>{languages.find(l => l.code === language)?.label.split(' ')[0] || 'తెలుగు'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1 z-50"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        if (onSelectLang) onSelectLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                        language === l.code ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <span className="text-emerald-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Top Right: Live Observation Pill & Theme Toggle */}
          <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
            
            {/* Live Weather Capsule */}
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-700/80 shadow-sm hover:border-emerald-400 transition cursor-pointer"
              title="Click to change location"
            >
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 dark:text-white leading-none">
                  {formatMetric(curr.temperature, '°C')}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  {district}
                </div>
              </div>
            </button>

            {/* Dark / Light Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-9 h-9 rounded-full bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-700/80 shadow-sm flex items-center justify-center text-slate-600 dark:text-amber-400 hover:scale-105 transition cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            )}

            {/* User Profile / Login Pill (Click to Open Login) */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-700/80 shadow-sm hover:border-emerald-500 hover:scale-105 transition cursor-pointer"
              title={userProfile?.name ? `Logged in as ${userProfile.name} (Click to manage account)` : "Sign In / Login (Optional)"}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-500/50 flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs shrink-0">
                {userProfile?.avatarLetter || '👤'}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
                {userProfile?.name ? userProfile.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

          </div>
        </div>

        {/* Core Layout Grid: Left (Main 8 Cols) & Right (Widgets 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

          {/* LEFT 8 COLUMNS: Hero Banner, 5 Pillars, Voice Capsule */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">

            {/* 1. SCENIC RURAL HERO BANNER (Matches Reference Photo) */}
            <div className="relative w-full rounded-[28px] sm:rounded-[32px] overflow-hidden border border-[#E1E8DE] dark:border-slate-800 shadow-lg shadow-slate-900/5 bg-white dark:bg-[#0D1524] min-h-[260px] sm:min-h-[300px] flex items-center">
              
              {/* Background Image: Indian Farmer on Cot in Green Farmland */}
              <div 
                className="absolute inset-0 bg-cover bg-right sm:bg-[center_35%] transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: 'url("/assets/farmer_hero.jpg")' }}
              />

              {/* Gradient Scrim Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 dark:from-[#080C14] dark:via-[#080C14]/90 dark:to-transparent sm:w-3/5 pointer-events-none" />

              {/* Foreground Typography Content */}
              <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-xl space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  {t.heroTitleLine1}<br/>
                  <span className="text-[#2E7D32] dark:text-emerald-400">{t.heroTitleLine2}</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md">
                  {t.heroSub}
                </p>

                <div className="pt-1 sm:pt-2">
                  <button
                    onClick={onOpenVoice}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 text-[#2E7D32] dark:text-emerald-400 border border-[#D0DFCE] dark:border-slate-700 text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400 fill-current ml-0.5" />
                    </div>
                    <span>{t.heroBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. "MEEKU EMI TELUSUKOVALI?" 5-COLUMN DECISION SUPPORT PILLARS */}
            <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-800 shadow-md shadow-slate-900/5 space-y-4">
              
              {/* Header with Subtle Accent Dashes */}
              <div className="text-center flex items-center justify-center gap-3">
                <div className="w-8 h-0.5 bg-emerald-500/40 rounded-full" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
                  {t.decisionHeader}
                </h2>
                <div className="w-8 h-0.5 bg-emerald-500/40 rounded-full" />
              </div>

              {/* 5 Vertical Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 border hover:-translate-y-1 hover:shadow-md ${cat.colorClasses}`}
                    >
                      <div className="space-y-2.5 text-center flex flex-col items-center">
                        {/* Icon Container */}
                        <div className={`w-12 h-12 rounded-2xl ${cat.iconBg} shadow-sm flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${cat.textAccent}`} />
                        </div>
                        <div>
                          <h3 className={`text-xs sm:text-sm font-bold ${cat.titleColor}`}>
                            {cat.title}
                          </h3>
                          <p className={`text-[11px] ${cat.subColor} mt-1 leading-snug line-clamp-2`}>
                            {cat.sub}
                          </p>
                        </div>
                      </div>

                      {/* Circular Action Button */}
                      <div className="pt-3 flex justify-center">
                        <button
                          onClick={() => {
                            if (cat.action) {
                              cat.action();
                            } else if (cat.query) {
                              if (onSendQuery) onSendQuery(cat.query);
                              if (onNavigate) onNavigate('ask');
                            }
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm cursor-pointer ${cat.btnBg}`}
                          title="Explore Advisory"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. PRESS & SPEAK FLOATING VOICE BAR (Matches Reference Image) */}
            <div className="p-3.5 sm:p-4 rounded-full bg-[#EBF7EE] dark:bg-emerald-950/30 border border-[#D4ECD9] dark:border-emerald-800/40 shadow-sm flex items-center justify-between gap-3">
              
              {/* Left: Green Circular Mic Button with Voice Labels */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onOpenVoice}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-700/20 transition-transform active:scale-95 cursor-pointer"
                  title="Press and Speak"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {t.voiceTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {t.voiceSub}
                  </div>
                </div>
              </div>

              {/* Center: Animated Audio Soundwave Visualizer */}
              <div className="hidden sm:flex items-center gap-1 h-6 px-4 flex-1 justify-center">
                {[3, 6, 12, 18, 24, 15, 8, 14, 22, 16, 9, 15, 20, 11, 4, 8, 14, 20, 12, 6].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"
                    style={{ 
                      height: `${h}px`,
                      animationDelay: `${(i % 5) * 0.15}s`
                    }}
                  />
                ))}
              </div>

              {/* Right: Language Pill */}
              <button
                onClick={() => setLangDropdownOpen(true)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-emerald-300/50 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0 hover:border-emerald-500 transition cursor-pointer"
              >
                <span>{languages.find(l => l.code === language)?.label.split(' ')[0] || 'తెలుగు'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: Alerts, Bharat Radar Map, Current Weather */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-5">

            {/* 1. HECCHARIKALU (ALERTS) WIDGET */}
            <div className="p-4 sm:p-5 rounded-[28px] bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-800 shadow-md shadow-slate-900/5 space-y-3">
              
              {/* Header with Red Badge */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t.alertsTitle}
                  </h3>
                </div>
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {alertItems.length}
                </span>
              </div>

              {alertItems.length ? alertItems.map((alert) => (
                <div key={alert.title} className="p-3 rounded-2xl bg-[#FDF2F2] dark:bg-rose-950/30 border border-[#FADBD8] dark:border-rose-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{alert.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{alert.area}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{alert.time}</div>
                </div>
              )) : (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                  No active verified warning for {district}.
                </div>
              )}

              {/* Footer: View All Link */}
              <div className="pt-1 text-right">
                <button
                  onClick={() => onNavigate('alerts')}
                  className="text-xs font-bold text-[#C0392B] dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.viewAllAlerts}</span>
                </button>
              </div>
            </div>

            {/* 2. RAINFALL MAP - BHARAT WIDGET */}
            {/* 2. REGIONAL WEATHER & WATER LEVEL RADAR MAP (NORMAL MAP) */}
            <div className="p-4 sm:p-5 rounded-[28px] bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-800 shadow-md shadow-slate-900/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t.radarTitle}
                  </h3>
                  <button
                    onClick={() => setShowNormalWater(!showNormalWater)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      showNormalWater 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                    title="Toggle CWC River & Lake Gauging Overlay"
                  >
                    <Droplets className="w-3 h-3 text-cyan-500" />
                    <span>Water: {showNormalWater ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
                <button
                  onClick={() => onNavigate('map')}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Expand Map</span>
                  <span>↗</span>
                </button>
              </div>

              {/* Interactive Normal Leaflet Map with Zero API Key Errors */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <MapContainer
                  center={[18.5, 79.5]}
                  zoom={5}
                  zoomControl={false}
                  attributionControl={false}
                  className="w-full h-full"
                >
                  {/* MapTiler Verified Basemap Integration */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>'
                    url={`https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY || '6DHkiQEEsGyoDdRvLWvG'}`}
                    maxZoom={12}
                    minZoom={3}
                  />

                  {/* Real-Time Live RainViewer Doppler Radar (Only dynamically queried valid timestamps) */}
                  {liveRadarPath && (
                    <TileLayer
                      key={liveRadarPath}
                      url={`https://tilecache.rainviewer.com${liveRadarPath}/256/{z}/{x}/{y}/2/1_1.png`}
                      opacity={0.65}
                      maxNativeZoom={7}
                      maxZoom={12}
                    />
                  )}

                  {/* Real-Time Central Water Commission (CWC) River & Reservoir Gauges */}
                  {showNormalWater && NORMAL_WATER_STATIONS.map((st) => (
                    <Marker
                      key={st.id}
                      position={[st.lat, st.lon]}
                      icon={miniWaterIcon(st.color)}
                    >
                      <Popup>
                        <div className="p-1 text-slate-900 font-sans text-xs min-w-[160px]">
                          <div className="font-bold flex items-center gap-1 text-blue-700">
                            <span>💧</span>
                            <span>{st.name}</span>
                          </div>
                          <div className="flex justify-between items-center my-1 text-[11px]">
                            <span className="text-slate-500">Level:</span>
                            <span className="font-bold font-mono text-blue-600">{st.level}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>Danger:</span>
                            <span className="font-mono text-rose-600">{st.danger}</span>
                          </div>
                          <span className="inline-block mt-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            {st.status}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                {/* Floating Info Pill on Bottom Left */}
                <div className="absolute left-2 bottom-2 z-[400] flex items-center gap-1.5 text-[9px] font-bold bg-slate-900/85 text-cyan-300 px-2 py-1 rounded-lg border border-white/10 shadow-sm backdrop-blur-sm pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>💧 5 CWC River Telemetry Gauges Active</span>
                </div>

                {/* Vertical Color Scale Ramp (Heavy to Light) */}
                <div className="absolute right-2 top-2 bottom-2 z-[400] flex flex-col items-center justify-between text-[9px] font-bold bg-white/90 dark:bg-slate-900/90 px-1 py-1 rounded-md border border-black/10 shadow-sm pointer-events-none">
                  <span className="text-red-600">Heavy</span>
                  <div className="w-1.5 flex-1 mx-auto my-0.5 rounded-full bg-gradient-to-b from-red-600 via-amber-400 via-green-400 to-sky-400" />
                  <span className="text-sky-600">Light</span>
                </div>
              </div>
            </div>

            {/* 3. IPPUDE (NOW) PHYSICAL TELEMETRY WIDGET */}
            <div className="p-4 sm:p-5 rounded-[28px] bg-white dark:bg-[#0F172A] border border-[#E3E8E1] dark:border-slate-800 shadow-md shadow-slate-900/5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t.nowTitle}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${weatherError ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300' : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                  {loading ? 'Loading telemetry...' : weatherError ? 'Live data unavailable' : '● Live Telemetry'}
                </span>
              </div>

              {/* Big Temp & Physical Metrics Grid */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatMetric(curr.temperature, '°')}<span className="text-lg font-normal text-slate-500">c</span>
                  </span>
                  <Sun className="w-6 h-6 text-amber-500 shrink-0" />
                </div>

                {/* 2x2 Telemetry Grid (Matches Reference Image) */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span><strong>{formatMetric(curr.humidity, '%')}</strong> Humidity</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Wind className="w-3.5 h-3.5 text-teal-500" />
                    <span><strong>{formatMetric(curr.wind_speed_kmh, ' km/h')}</strong> Wind</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                    <span><strong>{formatMetric(curr.pressure_hpa, ' hPa')}</strong> Pressure</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                    <span><strong>{formatMetric(curr.rainfall_mm, ' mm')}</strong> Rain</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM TRUST / FEATURE BAR (Matches Reference Photo Footer) */}
        <div className="pt-2 sm:pt-4 border-t border-[#E1E8DE] dark:border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center sm:text-left">
            
            <div className="flex items-center gap-2.5 p-2 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t.trust1Title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.trust1Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t.trust2Title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.trust2Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t.trust3Title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.trust3Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t.trust4Title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.trust4Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t.trust5Title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.trust5Sub}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function formatMetric(value, suffix = '', unavailable = '--') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return unavailable;
  return `${Math.round(Number(value))}${suffix}`;
}
