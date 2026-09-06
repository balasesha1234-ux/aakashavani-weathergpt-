import React from 'react';
import { 
  Plus, 
  Home,
  MessageSquare, 
  Trash2, 
  Settings, 
  ShieldAlert, 
  ChevronLeft, 
  AlertOctagon, 
  Layers, 
  Sparkles,
  Bookmark,
  CloudSun,
  Wifi,
  Radio,
  PhoneCall,
  Globe,
  Sprout,
  Ship,
  Plane,
  MoreHorizontal,
  MapPin,
  Activity,
  Check
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  setIsOpen,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenSettings,
  activeWorkspace = 'home',
  setActiveWorkspace,
  userProfile,
  isEmergencyActive,
  activeDistrict = "Manikonda",
  onSelectScenario,
  currentLang = 'telish',
  onSelectLang,
  onOpenSms,
  onOpenIvr,
  appMode = 'live',
  onToggleAppMode,
  onOpenLocationPicker,
  onSelectLocation
}) {
  const navItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'ask', label: 'Ask AakashaVani', icon: MessageSquare },
    { id: 'map', label: 'WebGIS Studio Map', icon: Layers },
    { id: 'alerts', label: 'Disaster Alerts Center', icon: AlertOctagon, isBadge: isEmergencyActive }
  ];

  const demoPresets = [
    { 
      id: 'scenario_flood_hyderabad',
      title: '🌊 Flash Flood & Musi Water Surge (Hyderabad)', 
      query: 'FLASH FLOOD ALERT in Hyderabad: Musi river and lake water levels are rising rapidly! What immediate actions must I take, how should I behave, and where is the nearest verified relief center to evacuate?',
      district: 'Hyderabad',
      latitude: 17.3850,
      longitude: 78.4867
    },
    { 
      id: 'scenario_cyclone_puri',
      title: '🚨 Cyclone Red Alert (Puri)', 
      query: 'What is the cyclone landfall status and where are nearby emergency shelters in Puri?',
      district: 'Puri',
      latitude: 19.8135,
      longitude: 85.8312
    },
    { 
      id: 'scenario_farmer_wardha',
      title: '🌾 Cotton Farmer (Wardha)', 
      query: 'Can I spray fertilizer on my cotton crops tomorrow in Wardha?',
      district: 'Wardha',
      latitude: 20.7453,
      longitude: 78.6022
    },
    { 
      id: 'scenario_fisherman_vizag',
      title: '⛵ Marine Squall (Vizag)', 
      query: 'Is it safe to venture into the Bay of Bengal for fishing tomorrow?',
      district: 'Visakhapatnam',
      latitude: 17.6868,
      longitude: 83.2185
    },
    { 
      id: 'scenario_monsoon_mumbai',
      title: '🏙️ Monsoon Commute (Mumbai)', 
      query: 'Will Dadar experience waterlogging or heavy rain this evening?',
      district: 'Mumbai',
      latitude: 19.0760,
      longitude: 72.8777
    },
    {
      id: 'scenario_aviation_delhi',
      title: '✈️ Aviation Briefing (Delhi DEL)',
      query: 'Provide an official Aviation Weather Briefing with decoded METAR, flight category, and runway crosswind components for Delhi IGI Airport.',
      district: 'Delhi',
      latitude: 28.5562,
      longitude: 77.1000
    },
    {
      id: 'scenario_climate_wardha',
      title: '📊 Climate Analytics (Wardha)',
      query: 'Analyze 50-year climate normal baseline deviations, warming trends, and precipitation anomalies for agricultural research in Wardha.',
      district: 'Wardha',
      latitude: 20.7453,
      longitude: 78.6022
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-[280px] app-sidebar border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header (Matches Reference Image) */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-slate-900 dark:text-white leading-tight tracking-tight">AakashaVani</div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">WeatherGPT</div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation Section */}
        <div className="p-3 border-b border-inherit space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeWorkspace === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveWorkspace(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E8F5E9] dark:bg-emerald-950/50 text-[#1B5E20] dark:text-emerald-300 border border-[#C8E6C9] dark:border-emerald-800/60 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1B5E20] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.isBadge && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Connectivity Mode Box (Matches Reference Image) */}
        <div className="p-3 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            How do you want to connect?
          </div>
          <div className="space-y-1.5">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Internet</span>
              <span className="ml-auto text-[9px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-full">Active</span>
            </div>

            <button
              onClick={onOpenSms}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span>Low Data</span>
            </button>

            <button
              onClick={onOpenIvr || onOpenSms}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
              <span>SMS / IVR</span>
            </button>
          </div>
        </div>

        {/* Active Emergency Alert Banner */}
        {isEmergencyActive && (
          <div 
            onClick={() => {
              setActiveWorkspace('alerts');
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className="p-3 mx-3 my-2 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center gap-2.5 text-xs animate-emergency-pulse cursor-pointer hover:bg-rose-500/25 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate text-[11px]">Active Red Alert</p>
              <p className="text-[10px] text-rose-300 truncate">{activeDistrict} Zone</p>
            </div>
          </div>
        )}

        {/* Mode Switcher Banner: Live Production vs Test Benchmarks */}
        <div className="px-3 pt-3 pb-2 border-b border-inherit">
          <div className="flex items-center justify-between p-1 rounded-xl bg-slate-900/60 dark:bg-black/40 border border-slate-700/50 text-[10px] font-bold">
            <button
              onClick={() => onToggleAppMode && onToggleAppMode('live')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                appMode === 'live'
                  ? 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 border border-emerald-500/40 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="100% Real Live IMD Satellite Telemetry across 780+ Districts"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Mode</span>
            </button>
            <button
              onClick={() => onToggleAppMode && onToggleAppMode('demo')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                appMode === 'demo'
                  ? 'bg-amber-500/20 text-amber-400 dark:text-amber-300 border border-amber-500/40 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pre-packaged Disaster Benchmark Scenarios (Puri Cyclone, Wardha Rain, etc.)"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Test Cases</span>
            </button>
          </div>
        </div>

        {/* Live Monitored Locations Section (When in Live Mode) */}
        {appMode === 'live' ? (
          <div className="px-3 pt-3 pb-2 border-b border-inherit space-y-2">
            <div className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active Location</span>
              </span>
              {onOpenLocationPicker && (
                <button
                  onClick={onOpenLocationPicker}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>Search 780+</span>
                </button>
              )}
            </div>

            {/* Current Active Location Card */}
            <div 
              onClick={onOpenLocationPicker}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-left">
                  <div className="font-bold text-xs text-white truncate">{activeDistrict}</div>
                  <div className="text-[10px] text-emerald-400/80">Live Telemetry Active</div>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                LIVE
              </span>
            </div>

            {/* Quick Switch Major Indian Hubs */}
            <div className="space-y-1 pt-1">
              <div className="text-[9px] font-bold uppercase text-slate-400 px-1">Quick Switch Cities</div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { name: "New Delhi", lat: 28.6139, lon: 77.2090, state: "Delhi" },
                  { name: "Mumbai", lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
                  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, state: "Karnataka" },
                  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, state: "Telangana" }
                ].filter(c => c.name.toLowerCase() !== activeDistrict.toLowerCase()).slice(0, 4).map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onSelectLocation) {
                        onSelectLocation({
                          district: city.name,
                          latitude: city.lat,
                          longitude: city.lon,
                          state: city.state
                        });
                      }
                    }}
                    className="text-left px-2 py-1 rounded-lg text-[10px] text-slate-300 bg-slate-800/40 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/5 transition truncate flex items-center gap-1 cursor-pointer"
                  >
                    <span className="truncate">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Live Weather & Disaster Simulations (When in Test Cases Mode) */
          <div className="px-3 pt-3 pb-1 border-b border-inherit space-y-1">
            <div className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Disaster Test Cases</span>
              </div>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                DEMO
              </span>
            </div>

            <div className="space-y-1">
              {demoPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onSelectScenario) {
                      onSelectScenario(preset);
                    }
                    setActiveWorkspace('ask');
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-amber-300 hover:bg-slate-800/40 transition truncate flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3 h-3 text-amber-500/60 shrink-0" />
                  <span className="truncate">{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs px-2">
              <MessageSquare className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
              <p>No previous conversations.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setActiveWorkspace('ask');
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive && activeWorkspace === 'ask'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate text-slate-200">{conv.title || "Weather Discussion"}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Change Language Selector (Matches Reference Image) */}
        <div className="p-3 border-t border-inherit">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Change Language</span>
            </div>
            <select
              value={currentLang}
              onChange={(e) => onSelectLang && onSelectLang(e.target.value)}
              className="bg-transparent text-emerald-700 dark:text-emerald-400 font-bold text-xs outline-none cursor-pointer"
            >
              <option value="telish" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">తెలుగు (Telish)</option>
              <option value="te" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">తెలుగు (Telugu)</option>
              <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">English</option>
              <option value="hinglish" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hinglish</option>
              <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">हिन्दी</option>
              <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">मराठी</option>
            </select>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-inherit">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800/80 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] shadow-sm shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {userProfile?.avatar_letter || userProfile?.avatarLetter || (userProfile?.name ? userProfile.name.slice(0, 1).toUpperCase() : "👤")}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{userProfile?.name || "Guest Citizen"}</p>
                <p className="text-[10px] text-slate-400 truncate">{userProfile?.district || "Public Access"}</p>
              </div>
            </div>

            <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:rotate-45 transition-all" />
          </button>
        </div>

      </aside>
    </>
  );
}
