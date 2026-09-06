import React, { useState } from 'react';
import { 
  Menu, 
  Settings, 
  MapPin, 
  LocateFixed, 
  Home,
  MessageSquare, 
  AlertOctagon, 
  Layers, 
  Mic,
  Activity,
  Globe,
  ChevronDown,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import PhasesRoadmapModal from '../modals/PhasesRoadmapModal';

export default function Navbar({
  onToggleSidebar,
  sidebarOpen,
  setSidebarOpen,
  onNewChat,
  onOpenSettings,
  onOpenVoice,
  onDetectGPS,
  onOpenLocationModal,
  activeWorkspace = 'home',
  setActiveWorkspace,
  onSelectWorkspace,
  isEmergencyActive,
  activeDistrict,
  isGPSActive,
  currentLang = 'en',
  onSelectLang,
  theme = 'dark',
  onToggleTheme,
  userProfile,
  onOpenAuthModal,
  appMode = 'live',
  onToggleAppMode,
  onToggleMobileMode,
  isMobileMode = false
}) {
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const switchWorkspace = onSelectWorkspace || setActiveWorkspace;
  const toggleSidebar = onToggleSidebar || (() => setSidebarOpen && setSidebarOpen(!sidebarOpen));

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ask', label: 'Ask', icon: MessageSquare },
    { id: 'map', label: 'Map', icon: Layers },
    { id: 'alerts', label: 'Alerts', icon: AlertOctagon, isBadge: isEmergencyActive }
  ];

  const quickLangs = [
    { code: 'en', label: 'English' },
    { code: 'hinglish', label: 'Hinglish (Hindi+Eng)' },
    { code: 'telish', label: 'Telish (Telugu+Eng)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' }
  ];

  const getLangBadge = (c) => {
    if (c === 'hinglish') return 'Hinglish';
    if (c === 'telish') return 'Telish';
    if (c === 'hi') return 'हिन्दी';
    if (c === 'te') return 'తెలుగు';
    if (c === 'mr') return 'मराठी';
    return c.toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full app-navbar border-b border-slate-200/80 dark:border-white/5 bg-white/90 dark:bg-[#080C14]/95 backdrop-blur-xl px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 transition-colors">
        
        {/* Left: Sidebar Toggle, Brand & Live Location */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Toggle Sidebar & History"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Model / Brand Badge */}
          <button
            onClick={() => setRoadmapOpen(true)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl glass-panel text-xs font-semibold shadow-sm hover:border-emerald-500 dark:hover:border-cyan-400 transition-all cursor-pointer group shrink-0"
            title="Click to view Architecture"
          >
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600 dark:bg-cyan-400 group-hover:animate-ping"></div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">AakashaVani</span>
            <span className="text-[10px] text-emerald-700 dark:text-cyan-400 font-mono font-bold hidden md:inline group-hover:text-emerald-600 dark:group-hover:text-cyan-300">
              • V1.0
            </span>
          </button>

          {/* Live Location Chip (Search & Change Location) */}
          <button
            onClick={onOpenLocationModal || onDetectGPS}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl glass-panel text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-cyan-400 hover:border-emerald-500/40 dark:hover:border-cyan-500/40 transition-all shadow-sm group cursor-pointer"
            title="Click to change location or use GPS"
          >
            <MapPin className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isGPSActive ? 'text-emerald-500 animate-pulse' : 'text-emerald-600 dark:text-cyan-400'}`} />
            <span className="truncate max-w-[70px] xs:max-w-[95px] sm:max-w-[130px] text-slate-900 dark:text-white">
              {activeDistrict || "Set Location"}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-cyan-400/90 font-normal underline ml-0.5 hidden sm:inline">
              Change
            </span>
          </button>

          {/* Mode Switcher Pill (Live Production vs Test Cases) */}
          <button
            onClick={() => onToggleAppMode && onToggleAppMode(appMode === 'live' ? 'demo' : 'live')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
              appMode === 'live'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
            }`}
            title={`Operational Mode: ${appMode === 'live' ? 'Live Production (100% Real Live IMD Data)' : 'Disaster Test Cases'}. Click to toggle.`}
          >
            {appMode === 'live' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Mode</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Test Cases</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Primary 4-Tab Navigation (Home, Ask, Map, Alerts) */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeWorkspace === item.id;

            return (
              <button
                key={item.id}
                onClick={() => switchWorkspace(item.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="hidden xs:inline">{item.label}</span>

                {item.isBadge && !isActive && (
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Language Pill, Voice Mic & Settings Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Quick Vernacular & Code-Mixed Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl glass-panel text-[11px] font-bold text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer"
              title="Switch Language (Hinglish, Telish, Hindi, Telugu, etc.)"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[55px] sm:max-w-[70px]">{getLangBadge(currentLang)}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl p-1.5 z-50 backdrop-blur-xl"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Language
                </div>
                {quickLangs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      if (onSelectLang) onSelectLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentLang === l.code 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.label}</span>
                    {currentLang === l.code && <span className="text-[10px] text-cyan-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </button>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
            </button>
          )}

          {/* Switch to Mobile View Toggle */}
          {onToggleMobileMode && (
            <button
              onClick={onToggleMobileMode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-105"
              title={isMobileMode ? "Switch to Desktop Workstation" : "Switch to Citizen/Farmer Mobile App"}
            >
              <span>{isMobileMode ? '💻 Desktop' : '📱 Mobile App'}</span>
            </button>
          )}

          {/* User Account / Sign In Pill (Optional) */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                userProfile?.name && userProfile?.authProvider !== 'GUEST_PUBLIC'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-emerald-500'
              }`}
              title={userProfile?.name ? `Logged in as ${userProfile.name} (${userProfile.email})` : "Sign In / Profile (Optional)"}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {userProfile?.avatar_letter || userProfile?.avatarLetter || (userProfile?.name ? userProfile.name.slice(0, 1).toUpperCase() : '👤')}
              </div>
              <span className="hidden sm:inline">
                {userProfile?.name && userProfile.auth_provider !== 'GUEST_PUBLIC' ? userProfile.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Settings & Privacy"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

      </header>

      {/* Architecture Roadmap Modal */}
      <PhasesRoadmapModal isOpen={roadmapOpen} onClose={() => setRoadmapOpen(false)} />
    </>
  );
}
