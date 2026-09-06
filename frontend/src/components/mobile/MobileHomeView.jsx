import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  MapPin, 
  ChevronDown, 
  Droplets, 
  Wind, 
  Gauge, 
  Volume2, 
  HelpCircle, 
  Sprout, 
  CloudRain, 
  AlertTriangle, 
  Sailboat, 
  Mic, 
  ShieldCheck, 
  Clock, 
  Info,
  Sun,
  Moon,
  CloudSunRain
} from 'lucide-react';
import FarmerIllustration from './FarmerIllustration';
import MobileWhyAdvisoryModal from './MobileWhyAdvisoryModal';

export default function MobileHomeView({
  district = 'Waradha, Maharashtra',
  temperature = 28,
  humidity = 72,
  windSpeed = 15,
  pressure = 1010,
  weatherCondition = 'కొద్దిగా మేఘావృతం',
  crop = 'Cotton',
  currentLang = 'te',
  onSelectLang,
  onOpenMenu,
  onOpenNotifications,
  onDetectGPS,
  onOpenVoice,
  onCategoryClick,
  onOpenSituationRoom,
  theme = 'dark',
  onToggleTheme
}) {
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Localization strings
  const strings = {
    te: {
      locationBtn: 'నా ప్రాంతం',
      condition: weatherCondition || 'కొద్దిగా మేఘావృతం',
      humidityLabel: 'ఆర్ద్రత',
      windLabel: 'గాలి',
      pressureLabel: 'పీడనం',
      advisoryTag: 'ఈరోజు సలహా',
      advisoryHeadline: 'ఈ రోజు మందు పిచికారీ చేయకండి.',
      advisoryDesc: 'రేపు మోస్తరు వర్షం (25-40 mm) వచ్చే అవకాశం ఉంది. పిచికారీ చేస్తే ఫలితం తగ్గే అవకాశం ఉంది.',
      confidenceLabel: 'సమ్మకం',
      confidenceVal: 'High',
      validityLabel: 'చెల్లుబాటు',
      validityVal: '24 గంటలు',
      sourceLabel: 'మూలం',
      sourceVal: 'IMD Nowcast',
      listenBtn: 'వినండి',
      whyBtn: 'ఎందుకు ఈ సలహా?',
      categoryTitle: 'మీకు ఏమి తెలుసుకోవాలి?',
      catCrop: 'నా పంట',
      catWater: 'నీరు',
      catRain: 'వర్షం',
      catAlerts: 'హెచ్చరికలు',
      catMarine: 'సముద్రం',
      voicePrompt: 'మాట్లాడండి...',
      voiceSub: 'మీ ప్రశ్నను అడగండి'
    },
    hi: {
      locationBtn: 'मेरा स्थान',
      condition: 'आंशिक रूप से बादल',
      humidityLabel: 'नमी',
      windLabel: 'हवा',
      pressureLabel: 'दबाव',
      advisoryTag: 'आज की सलाह',
      advisoryHeadline: 'आज कीटनाशक का छिड़काव न करें।',
      advisoryDesc: 'कल मध्यम वर्षा (25-40 mm) होने की संभावना है। आज छिड़काव करने से दवा बह जाएगी।',
      confidenceLabel: 'सटीकता',
      confidenceVal: 'High',
      validityLabel: 'वैधता',
      validityVal: '24 घंटे',
      sourceLabel: 'स्रोत',
      sourceVal: 'IMD Nowcast',
      listenBtn: 'सुनें',
      whyBtn: 'यह सलाह क्यों?',
      categoryTitle: 'आप क्या जानना चाहते हैं?',
      catCrop: 'मेरी फसल',
      catWater: 'पानी',
      catRain: 'बारिश',
      catAlerts: 'चेतावनी',
      catMarine: 'समुद्र',
      voicePrompt: 'बोलिए...',
      voiceSub: 'अपना प्रश्न पूछें'
    },
    en: {
      locationBtn: 'My Location',
      condition: 'Partly Cloudy',
      humidityLabel: 'Humidity',
      windLabel: 'Wind',
      pressureLabel: 'Pressure',
      advisoryTag: "Today's Advisory",
      advisoryHeadline: 'Do not spray pesticide today.',
      advisoryDesc: 'Moderate rainfall (25-40 mm) expected tomorrow. Spraying today will wash away chemicals.',
      confidenceLabel: 'Confidence',
      confidenceVal: 'High',
      validityLabel: 'Validity',
      validityVal: '24 Hours',
      sourceLabel: 'Source',
      sourceVal: 'IMD Nowcast',
      listenBtn: 'Listen',
      whyBtn: 'Why this advisory?',
      categoryTitle: 'What do you want to know?',
      catCrop: 'My Crop',
      catWater: 'Water',
      catRain: 'Rain',
      catAlerts: 'Alerts',
      catMarine: 'Marine',
      voicePrompt: 'Speak now...',
      voiceSub: 'Ask your question'
    }
  };

  const t = strings[currentLang] || strings.en;

  // Audio Speech Readout
  const handleListenAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert("Audio speech synthesis is not supported on this device.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `${t.advisoryHeadline} ${t.advisoryDesc}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const langCodeMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };
    utterance.lang = langCodeMap[currentLang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-full bg-[#F5F8F5] dark:bg-[#070B14] text-slate-800 dark:text-slate-100 pb-6 font-sans transition-colors duration-200">
      
      {/* Top App Bar */}
      <div className="sticky top-0 z-30 bg-[#F5F8F5]/90 dark:bg-[#070B14]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-white/10">
        
        {/* Left: Hamburger Menu */}
        <button 
          onClick={onOpenMenu}
          className="p-2 rounded-xl bg-white dark:bg-[#0E1626] shadow-sm border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <CloudSunRain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              AakashaVani
            </h1>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              WeatherGPT
            </span>
          </div>
        </div>

        {/* Right: Language Pill, Theme Toggle & Notifications */}
        <div className="flex items-center gap-1.5">
          {/* Dark / Light Theme Toggle Button on Phone */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#0E1626] shadow-sm border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0E1626] border border-slate-200/70 dark:border-white/10 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>{currentLang === 'te' ? 'తెలుగు' : currentLang === 'hi' ? 'हिंदी' : 'English'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-10 w-28 bg-white dark:bg-[#0E1626] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 py-1 z-50 animate-fade-in">
                {[
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'en', label: 'English' }
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSelectLang(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold cursor-pointer ${
                      currentLang === l.code ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button 
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-white dark:bg-[#0E1626] shadow-sm border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </button>
        </div>

      </div>

      <div className="px-4 space-y-4 pt-2">
        
        {/* Location & GPS Bar */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/70 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {district}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">11 May, 9:30 AM</p>
            </div>
          </div>

          <button
            onClick={onDetectGPS}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/50 transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.locationBtn}</span>
          </button>
        </div>

        {/* Hero 3D Weather Display Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1626] border border-slate-200/70 dark:border-white/10 shadow-sm flex items-center justify-between">
          
          {/* 3D Cloud + Sun Illustration */}
          <div className="w-20 h-20 relative flex items-center justify-center flex-shrink-0">
            {/* Soft Sun Behind */}
            <div className="absolute top-1 left-2 w-10 h-10 rounded-full bg-amber-400 shadow-md animate-pulse"></div>
            {/* 3D Raincloud SVG */}
            <svg viewBox="0 0 64 64" className="w-16 h-16 relative z-10 drop-shadow-md">
              <path
                d="M 18 42 C 12 42, 8 36, 12 30 C 12 24, 20 20, 26 24 C 30 18, 42 18, 46 24 C 52 24, 56 30, 52 36 C 56 42, 48 42, 44 42 Z"
                fill="#CBD5E1"
              />
              <path
                d="M 16 40 C 10 40, 8 34, 12 28 C 12 22, 20 18, 26 22 C 30 16, 42 16, 46 22 C 52 22, 56 28, 52 34 C 56 40, 48 40, 44 40 Z"
                fill="#F1F5F9"
              />
              {/* Falling Raindrops */}
              <line x1="22" y1="46" x2="19" y2="54" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="30" y1="46" x2="27" y2="54" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="38" y1="46" x2="35" y2="54" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Temperature & Condition */}
          <div className="text-left px-2">
            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-start">
              <span>{temperature}</span>
              <span className="text-xl font-bold mt-1 text-slate-500 dark:text-slate-400">°C</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{t.condition}</p>
          </div>

          {/* Vertical Telemetry Metrics */}
          <div className="space-y-1.5 text-right pl-2 border-l border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Droplets className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-bold">{humidity}%</span>
              <span className="text-[10px] text-slate-400">{t.humidityLabel}</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Wind className="w-3.5 h-3.5 text-teal-500" />
              <span className="font-bold">{windSpeed} km/h</span>
              <span className="text-[10px] text-slate-400">{t.windLabel}</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold">{pressure} hPa</span>
              <span className="text-[10px] text-slate-400">{t.pressureLabel}</span>
            </div>
          </div>

        </div>

        {/* Agromet Advisory Hero Card with Farmer Artwork */}
        <div className="p-4 rounded-3xl bg-[#EBF7EE] dark:bg-[#082015] border border-emerald-200/80 dark:border-emerald-600/30 shadow-md space-y-3 relative overflow-hidden">
          
          {/* Header Row: Today's Advisory + Crop Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.advisoryTag}</span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#0E2C1E] text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300/50 dark:border-emerald-600/30 shadow-sm flex items-center gap-1">
              <span>🌿</span>
              <span>{crop}</span>
            </span>
          </div>

          {/* Headline + Description + Farmer Illustration Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 flex-1 z-10">
              <h3 className="text-lg font-black text-[#B91C1C] dark:text-rose-400 leading-snug tracking-tight">
                {t.advisoryHeadline}
              </h3>
              <p className="text-xs text-slate-700 dark:text-emerald-100/90 leading-relaxed font-medium pr-1">
                {t.advisoryDesc}
              </p>
            </div>

            {/* Farmer Illustration */}
            <FarmerIllustration className="w-24 h-32 flex-shrink-0" />
          </div>

          {/* 3 Metric Trust Cards */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-2xl bg-white/90 dark:bg-[#0B2A1D] border border-emerald-200/60 dark:border-emerald-750/30 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t.confidenceLabel}</span>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">{t.confidenceVal}</span>
            </div>

            <div className="p-2 rounded-2xl bg-white/90 dark:bg-[#0B2A1D] border border-emerald-200/60 dark:border-emerald-750/30 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t.validityLabel}</span>
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-0.5">{t.validityVal}</span>
            </div>

            <div className="p-2 rounded-2xl bg-white/90 dark:bg-[#0B2A1D] border border-emerald-200/60 dark:border-emerald-750/30 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <Info className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t.sourceLabel}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-0.5 leading-tight">{t.sourceVal}</span>
            </div>
          </div>

          {/* 2 Action Buttons: Listen (Audio) & Why Advisory? */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleListenAudio}
              className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? 'ఆపండి' : t.listenBtn}</span>
            </button>

            <button
              onClick={() => setWhyModalOpen(true)}
              className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#0B2A1D] hover:bg-slate-50 dark:hover:bg-[#0E3524] text-slate-700 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200/70 dark:border-emerald-600/30 shadow-sm transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.whyBtn}</span>
            </button>
          </div>

        </div>

        {/* 5 Quick Action Category Grid ("మీకు ఏమి తెలుసుకోవాలి?") */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">
            {t.categoryTitle}
          </h4>

          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'crop', label: t.catCrop, icon: Sprout, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
              { id: 'water', label: t.catWater, icon: Droplets, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
              { id: 'rain', label: t.catRain, icon: CloudRain, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
              { id: 'alerts', label: t.catAlerts, icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400', onClick: onOpenSituationRoom },
              { id: 'marine', label: t.catMarine, icon: Sailboat, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' }
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.onClick) cat.onClick();
                    else if (onCategoryClick) onCategoryClick(cat.id);
                  }}
                  className="p-2.5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/70 dark:border-white/10 shadow-xs flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <div className={`p-2 rounded-xl ${cat.color} mb-1`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Voice Bar docked inside the view - smooth and never blocks touches */}
        <div className="sticky bottom-2 z-30 pt-2 pb-1">
          <div 
            onClick={onOpenVoice}
            className="p-2.5 rounded-3xl bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-xl border border-emerald-300/60 dark:border-emerald-600/40 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Green Circular Mic Button */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 flex-shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-none">
                  {t.voicePrompt}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t.voiceSub}
                </p>
              </div>
            </div>

            {/* Animated Green Frequency Waveform */}
            <div className="flex items-center gap-1 pr-2">
              {[30, 60, 90, 45, 80, 50, 100, 40, 70, 30].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h * 0.22}px` }}
                  className="w-0.5 rounded-full bg-emerald-500 animate-pulse"
                ></span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Why This Advisory Modal */}
      <MobileWhyAdvisoryModal
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        currentLang={currentLang}
        district={district}
        crop={crop}
      />

    </div>
  );
}
