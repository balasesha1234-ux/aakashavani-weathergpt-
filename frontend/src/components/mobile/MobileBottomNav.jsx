import React from 'react';
import { Home, MessageSquare, Map, History, Users, ShieldAlert } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  currentLang = 'te',
  isEmergencyActive = false
}) {
  const labels = {
    te: {
      home: 'హోమ్',
      chat: 'చాట్',
      map: 'మ్యాప్',
      timeline: 'చరిత్ర',
      desk: 'డెస్క్',
      alerts: 'అలర్ట్స్'
    },
    hi: {
      home: 'होम',
      chat: 'चैट',
      map: 'नक्शा',
      timeline: 'इतिहास',
      desk: 'डेस्क',
      alerts: 'अलर्ट'
    },
    en: {
      home: 'Home',
      chat: 'Chat',
      map: 'Map',
      timeline: 'Flow',
      desk: 'Desk',
      alerts: 'Alerts'
    }
  };

  const l = labels[currentLang] || labels.en;

  const tabs = [
    { id: 'home', label: l.home, icon: Home },
    { id: 'chat', label: l.chat, icon: MessageSquare },
    { id: 'map', label: l.map, icon: Map },
    { id: 'timeline', label: l.timeline, icon: History },
    { id: 'desk', label: l.desk, icon: Users },
    { 
      id: 'alerts', 
      label: l.alerts, 
      icon: ShieldAlert, 
      badge: isEmergencyActive ? '!' : null,
      highlight: isEmergencyActive 
    }
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 shrink-0 w-full bg-white/95 dark:bg-[#0B111C]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-3 py-2 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                  : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
