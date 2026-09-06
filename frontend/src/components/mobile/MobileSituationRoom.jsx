import React from 'react';
import { 
  CloudRain, 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Wind, 
  Zap, 
  Waves,
  Radio,
  Bell
} from 'lucide-react';

export default function MobileSituationRoom({
  district = 'Waradha',
  onNavigateToForecast,
  onOpenAdvisory
}) {
  return (
    <div className="min-h-full bg-[#070B14] text-white p-4 space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-extrabold uppercase tracking-wider text-rose-400">Tactical Command</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-0.5">Situation Room</h2>
          <p className="text-[11px] font-mono text-slate-400">02 Sep 2026, 09:42 AM IST</p>
        </div>

        <button className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>
      </div>

      {/* Active Alert Hero Card (Red Gradient) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/80 via-rose-900/60 to-red-950/80 border border-rose-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold tracking-wider uppercase border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
              <span>Active Alert</span>
            </div>
            <h3 className="text-lg font-black text-white pt-1">Heavy Rainfall</h3>
            <p className="text-xs font-semibold text-rose-200">Telangana, Coastal AP & Vidarbha</p>
            <p className="text-[11px] text-rose-300/80 pt-1">Stay alert. Avoid low-lying roads and waterlogged bridges.</p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center flex-shrink-0 border border-rose-400/30">
            <CloudRain className="w-9 h-9 text-rose-400" />
          </div>
        </div>
      </div>

      {/* 4 Stat Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Threats</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">07</div>
          <p className="text-[10px] text-slate-400">High severity alerts</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Districts Affected</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">23</div>
          <p className="text-[10px] text-slate-400">Under orange alert</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <Users className="w-4 h-4" />
            <span>People Impacted</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">18.7K</div>
          <p className="text-[10px] text-slate-400">In advisory buffer</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Systems Online</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">98%</div>
          <p className="text-[10px] text-slate-400">Radar & IoT healthy</p>
        </div>
      </div>

      {/* What's Happening Now */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>What's Happening Now</span>
          <span className="text-cyan-400 font-mono text-[10px]">REAL-TIME FEED</span>
        </div>

        <div 
          onClick={onOpenAdvisory}
          className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between hover:bg-white/[0.07] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Heavy Rainfall</h4>
              <p className="text-[11px] text-slate-400">Ongoing in 10 districts (35 mm/h peak)</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 3 Mini Live Telemetry Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <Waves className="w-4 h-4 text-blue-400 mx-auto" />
            <span className="text-[10px] text-slate-400 block mt-1">River Level</span>
            <span className="text-xs font-bold text-rose-400">Rising ▲</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <Wind className="w-4 h-4 text-teal-400 mx-auto" />
            <span className="text-[10px] text-slate-400 block mt-1">Wind Speed</span>
            <span className="text-xs font-bold text-cyan-300">28 km/h</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <Zap className="w-4 h-4 text-amber-400 mx-auto" />
            <span className="text-[10px] text-slate-400 block mt-1">Lightning</span>
            <span className="text-xs font-bold text-amber-400">High Risk</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNavigateToForecast}
        className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
      >
        <span>View Detailed Forecast & Maps</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
