import React, { useState } from 'react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  AlertOctagon, 
  Waves, 
  Zap, 
  Sailboat, 
  Sprout, 
  ArrowRight,
  Clock
} from 'lucide-react';

export default function MobileAdvisoryCenter({ onBack, onSelectAdvisory }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Weather', 'Flood', 'Cyclone', 'Agriculture'];

  const advisories = [
    {
      id: 1,
      type: 'Weather',
      title: 'Severe Weather Advisory',
      severity: 'CRITICAL',
      severityColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30',
      region: 'Telangana, Coastal Andhra Pradesh & Vidarbha',
      desc: 'Heavy to very heavy rainfall likely at isolated places. Inundation of low-lying roadways expected. Stay alert.',
      time: '02 Sep 2026, 08:30 AM IST',
      icon: AlertOctagon,
      iconColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
    },
    {
      id: 2,
      type: 'Flood',
      title: 'Flood Advisory',
      severity: 'HIGH',
      severityColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      region: 'Godavari, Krishna Basins',
      desc: 'Water levels rising past warning marks at upstream barrages. Avoid low-lying riverbanks. Follow administration updates.',
      time: '02 Sep 2026, 08:45 AM IST',
      icon: Waves,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
    },
    {
      id: 3,
      type: 'Weather',
      title: 'Thunderstorm Advisory',
      severity: 'MEDIUM',
      severityColor: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
      region: 'Coastal Gujarat & Konkan',
      desc: 'Thunderstorms with cloud-to-ground lightning and gusty winds (40-50 km/h) likely. Stay indoors during squalls.',
      time: '02 Sep 2026, 07:20 AM IST',
      icon: Zap,
      iconColor: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40'
    },
    {
      id: 4,
      type: 'Cyclone',
      title: 'Fishermen Warning',
      severity: 'LOW',
      severityColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
      region: 'Bay of Bengal & Andhra Coast',
      desc: 'High winds and rough to very rough sea conditions. Fishermen are advised not to venture into deep sea waters.',
      time: '02 Sep 2026, 06:50 AM IST',
      icon: Sailboat,
      iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40'
    },
    {
      id: 5,
      type: 'Agriculture',
      title: 'Cotton Spraying Advisory',
      severity: 'HIGH',
      severityColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
      region: 'Maharashtra & Telangana Cotton Belt',
      desc: 'Postpone pesticide spraying due to incoming convective precipitation. Clear drainage channels to prevent root rot.',
      time: '02 Sep 2026, 06:00 AM IST',
      icon: Sprout,
      iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
    }
  ];

  const filtered = selectedCategory === 'All' 
    ? advisories 
    : advisories.filter(a => a.type === selectedCategory);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-white p-4 space-y-4 pb-24">
      {/* Top Header */}
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
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Advisory Center</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Official advisories and emergency bulletins</p>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips Horizontal Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-[#0E1626] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advisory Cards Stack */}
      <div className="space-y-3">
        {filtered.map((adv) => {
          const Icon = adv.icon;
          return (
            <div
              key={adv.id}
              onClick={() => onSelectAdvisory && onSelectAdvisory(adv)}
              className="p-4 rounded-3xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2.5 transition-all cursor-pointer hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${adv.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{adv.title}</h4>
                    <span className="text-[10px] text-slate-400 block">{adv.region}</span>
                  </div>
                </div>

                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${adv.severityColor}`}>
                  {adv.severity}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {adv.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{adv.time}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
