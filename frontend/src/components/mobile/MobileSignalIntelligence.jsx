import React from 'react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  Satellite, 
  Radio, 
  Wifi, 
  Thermometer, 
  Waves, 
  Anchor, 
  CloudRain, 
  Zap, 
  Wind,
  TrendingUp
} from 'lucide-react';

export default function MobileSignalIntelligence({ onBack }) {
  const sources = [
    { name: 'Satellites', status: 'Online', count: 'INSAT-3DS', icon: Satellite, color: 'text-indigo-500' },
    { name: 'Radar', status: 'Online', count: '39 Stations', icon: Radio, color: 'text-cyan-500' },
    { name: 'IoT Sensors', status: '1,248 Online', count: '99.2%', icon: Wifi, color: 'text-emerald-500' },
    { name: 'Weather Stations', status: '2,356 Online', count: 'IMD AWS', icon: Thermometer, color: 'text-amber-500' },
    { name: 'River Gauges', status: '187 Monitoring', count: 'CWC Telemetry', icon: Waves, color: 'text-blue-500' },
    { name: 'Ocean Buoys', status: '32 Active', count: 'INCOIS Moored', icon: Anchor, color: 'text-teal-500' }
  ];

  const signals = [
    {
      title: 'Rainfall Intensity',
      value: '24.6 mm/h',
      tag: 'Moderate',
      sub: 'All India Doppler Mosaic',
      icon: CloudRain,
      color: 'text-cyan-500',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
    },
    {
      title: 'River Level Trend',
      value: '18.50 m',
      tag: 'Rising ▲',
      sub: 'Godavari at Bhadrachalam (Warning: 16.2m)',
      icon: Waves,
      color: 'text-rose-500',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
    },
    {
      title: 'Lightning Activity',
      value: '2,847',
      unit: 'Strikes',
      tag: 'Active Surge',
      sub: 'Damini Network (Last 30 min)',
      icon: Zap,
      color: 'text-amber-500',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
    },
    {
      title: 'Wind Pattern',
      value: '28 km/h',
      tag: 'NE Direction',
      sub: 'Bay of Bengal Coastal Sector',
      icon: Wind,
      color: 'text-teal-500',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
    }
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-white p-4 space-y-4 pb-24">
      {/* Top App Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Signal Intelligence</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time data fusion from multiple sources</p>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Sensor Data Sources Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {sources.map((s, i) => {
          const Icon = s.icon;
          return (
            <div 
              key={i}
              className="p-3 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{s.status}</span>
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2.5">{s.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">{s.count}</p>
            </div>
          );
        })}
      </div>

      {/* Key Signals Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Key Signals</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">Live Feeds</span>
        </div>

        {signals.map((sig, i) => {
          const Icon = sig.icon;
          return (
            <div 
              key={i}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${sig.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sig.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sig.badgeBg}`}>
                      {sig.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sig.sub}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {sig.value}
                </div>
                {sig.unit && <span className="text-[9px] text-slate-400">{sig.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
