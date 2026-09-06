import React, { useState } from 'react';
import MobileHomeView from './MobileHomeView';
import MobileBottomNav from './MobileBottomNav';
import MobileSituationRoom from './MobileSituationRoom';
import MobileSignalIntelligence from './MobileSignalIntelligence';
import MobileEventFlow from './MobileEventFlow';
import MobileDecisionDesk from './MobileDecisionDesk';
import MobileAdvisoryCenter from './MobileAdvisoryCenter';
import MobileMapView from './MobileMapView';
import MobileVoiceSheet from './MobileVoiceSheet';
import MobileChatView from './MobileChatView';
import { 
  X, 
  Radio, 
  MessageSquare, 
  FileText, 
  Phone, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  User,
  SlidersHorizontal,
  Compass,
  Sun,
  Moon
} from 'lucide-react';

export default function MobileApp({
  district = 'Waradha, Maharashtra',
  latitude = 20.7453,
  longitude = 78.6022,
  currentLang = 'te',
  onSelectLang,
  isEmergencyActive = false,
  emergencyData = null,
  onDetectGPS,
  messages = [],
  isLoading = false,
  onSendMessage,
  onOpenLiveVoice,
  onClearChat,
  onOpenDesktopMode,
  onOpenSms,
  onOpenIvr,
  onOpenSettings,
  userProfile,
  onLogout,
  theme = 'dark',
  onToggleTheme
}) {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'map', 'timeline', 'desk', 'alerts', 'signals', 'advisory', 'chat'
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  // Handle Quick Category Click
  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'alerts') {
      setActiveTab('alerts');
    } else if (categoryId === 'water') {
      setActiveTab('signals');
    } else if (categoryId === 'rain') {
      setActiveTab('map');
    } else if (categoryId === 'crop') {
      setActiveTab('desk');
    } else if (categoryId === 'marine') {
      setActiveTab('advisory');
    }
  };

  const handleSendVoicePrompt = (promptText) => {
    if (onSendMessage) {
      onSendMessage(promptText);
    }
    setActiveTab('chat');
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto bg-[#F5F8F5] dark:bg-[#070B14] flex flex-col font-sans transition-colors duration-200">
      
      {/* Active Screen Rendering with Smooth Touch & Mouse Scrolling */}
      <main className={`flex-1 w-full ${activeTab === 'chat' ? 'overflow-hidden flex flex-col min-h-0' : 'overflow-y-auto overscroll-contain touch-pan-y'}`}>
        {activeTab === 'home' && (
          <MobileHomeView
            district={district}
            temperature={28}
            humidity={72}
            windSpeed={15}
            pressure={1010}
            weatherCondition={currentLang === 'te' ? 'కొద్దిగా మేఘావృతం' : currentLang === 'hi' ? 'आंशिक रूप से बादल' : 'Partly Cloudy'}
            crop="Cotton"
            currentLang={currentLang}
            onSelectLang={onSelectLang}
            onOpenMenu={() => setMenuDrawerOpen(true)}
            onOpenNotifications={() => setActiveTab('advisory')}
            onDetectGPS={onDetectGPS}
            onOpenVoice={() => setVoiceSheetOpen(true)}
            onCategoryClick={handleCategoryClick}
            onOpenSituationRoom={() => setActiveTab('alerts')}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
        )}

        {activeTab === 'chat' && (
          <MobileChatView
            district={district}
            messages={messages}
            isLoading={isLoading}
            currentLang={currentLang}
            onSendMessage={onSendMessage}
            onOpenLiveVoice={onOpenLiveVoice}
            onOpenSms={onOpenSms}
            onOpenIvr={onOpenIvr}
            onBack={() => setActiveTab('home')}
            onClearChat={onClearChat}
          />
        )}

        {activeTab === 'map' && (
          <MobileMapView
            latitude={latitude}
            longitude={longitude}
            district={district}
            isEmergencyMode={isEmergencyActive}
            emergencyResources={emergencyData?.emergency_resources || []}
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'timeline' && (
          <MobileEventFlow
            onBack={() => setActiveTab('home')}
            onOpenImpact={() => setActiveTab('desk')}
          />
        )}

        {activeTab === 'desk' && (
          <MobileDecisionDesk
            onBack={() => setActiveTab('home')}
            onOpenRationale={() => setActiveTab('signals')}
          />
        )}

        {activeTab === 'alerts' && (
          <MobileSituationRoom
            district={district}
            onNavigateToForecast={() => setActiveTab('map')}
            onOpenAdvisory={() => setActiveTab('advisory')}
          />
        )}

        {activeTab === 'signals' && (
          <MobileSignalIntelligence
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'advisory' && (
          <MobileAdvisoryCenter
            onBack={() => setActiveTab('home')}
            onSelectAdvisory={() => setActiveTab('desk')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLang={currentLang}
        isEmergencyActive={isEmergencyActive}
      />

      {/* Voice Interaction Bottom Sheet */}
      <MobileVoiceSheet
        isOpen={voiceSheetOpen}
        onClose={() => setVoiceSheetOpen(false)}
        onSendPrompt={handleSendVoicePrompt}
        currentLang={currentLang}
        district={district}
      />

      {/* Left Navigation Drawer / Slide-Over Menu */}
      {menuDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMenuDrawerOpen(false)}
        >
          <div 
            className="w-72 max-w-[80vw] h-full bg-white dark:bg-[#0E1626] p-5 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    AV
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">AakashaVani</h3>
                    <span className="text-[10px] text-emerald-600 font-bold">WeatherGPT Mobile</span>
                  </div>
                </div>

                <button 
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                {[
                  { id: 'home', label: 'Farmer Dashboard', icon: Compass },
                  { id: 'chat', label: 'Ask AakashaVani (AI Chat)', icon: MessageSquare },
                  { id: 'alerts', label: 'Situation Room', icon: ShieldAlert, badge: 'TACTICAL' },
                  { id: 'signals', label: 'Signal Intelligence', icon: Radio },
                  { id: 'timeline', label: 'Event Flow Timeline', icon: Compass },
                  { id: 'desk', label: 'Decision Desk', icon: User },
                  { id: 'advisory', label: 'Advisory Center', icon: FileText },
                  { id: 'map', label: 'Interactive WebGIS Map', icon: Compass }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMenuDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        activeTab === item.id 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Offline & Voice Options */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                  Degraded Mode
                </span>
                <button
                  onClick={() => {
                    setMenuDrawerOpen(false);
                    if (onOpenSms) onOpenSms();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>2G SMS Fallback</span>
                </button>
                <button
                  onClick={() => {
                    setMenuDrawerOpen(false);
                    if (onOpenIvr) onOpenIvr();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>IVR Toll-Free Hotline</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom: Switch to Desktop View */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
              <button
                onClick={() => {
                  setMenuDrawerOpen(false);
                  if (onOpenDesktopMode) onOpenDesktopMode();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>💻 Switch to Desktop Mode</span>
              </button>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span>Theme</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setMenuDrawerOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Profile</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
