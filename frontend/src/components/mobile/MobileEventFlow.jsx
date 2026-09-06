import React from 'react';
import { 
  ArrowLeft, 
  CloudRain, 
  Waves, 
  Zap, 
  Cloud, 
  Compass, 
  ArrowRight 
} from 'lucide-react';

export default function MobileEventFlow({ onBack, onOpenImpact }) {
  const events = [
    {
      title: 'Heavy Rainfall',
      location: 'Hyderabad, Telangana & Waradha Sector',
      time: '09:30 AM',
      isLive: true,
      icon: CloudRain,
      color: 'bg-blue-600 text-white',
      ringColor: 'ring-blue-400'
    },
    {
      title: 'River Level Rising',
      location: 'Water levels rising in Godavari & Krishna basins',
      time: '08:45 AM',
      isLive: false,
      icon: Waves,
      color: 'bg-teal-600 text-white',
      ringColor: 'ring-teal-400'
    },
    {
      title: 'Thunderstorm Activity',
      location: 'Coastal Gujarat & Maharashtra interior',
      time: '07:50 AM',
      isLive: false,
      icon: Zap,
      color: 'bg-amber-500 text-slate-950',
      ringColor: 'ring-amber-400'
    },
    {
      title: 'Cloud Formation',
      location: 'Deep convective convective clusters in Bay of Bengal',
      time: '08:30 AM',
      isLive: false,
      icon: Cloud,
      color: 'bg-indigo-600 text-white',
      ringColor: 'ring-indigo-400'
    },
    {
      title: 'Low Pressure Area',
      location: 'Detected over West Central Bay of Bengal',
      time: 'Yesterday, 11:00 PM',
      isLive: false,
      icon: Compass,
      color: 'bg-slate-600 text-white',
      ringColor: 'ring-slate-400'
    }
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-white p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2.5 pt-1">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Event Flow</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Track how events are evolving in real-time</p>
        </div>
      </div>

      {/* Vertical Connected Timeline */}
      <div className="relative pl-6 space-y-6 pt-2">
        {/* Connecting Vertical Line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-teal-500 to-slate-400 dark:to-slate-700"></div>

        {events.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div key={i} className="relative flex items-start gap-4">
              {/* Event Icon Bubble */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-md ${ev.color} ${ev.isLive ? `ring-4 ${ev.ringColor}/30` : ''}`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Event Card */}
              <div className="flex-1 p-3.5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                    {ev.isLive && (
                      <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                        <span className="w-1 h-1 rounded-full bg-white"></span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{ev.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {ev.location}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <button
        onClick={onOpenImpact}
        className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer mt-4"
      >
        <span>View Impact Projection</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
