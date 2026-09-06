import React from 'react';
import { 
  X, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar 
} from 'lucide-react';

export default function DayForecastModal({ day, district, onClose }) {
  if (!day) return null;

  const tempMax = Math.round(day.temp_max);
  const tempMin = Math.round(day.temp_min);
  const rainProb = day.rain_prob_max ?? day.rain_prob ?? 0;
  const rainSum = day.rain_sum_mm ?? 0;
  const isRainy = rainProb > 40 || rainSum > 5;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="glass-panel app-modal-container w-full max-w-md rounded-3xl border border-white/20 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {day.date || "Forecast Day"} • {district}
              </h3>
              <p className="text-xs text-slate-400 font-medium">GFS 0.25° NWP Numerical Forecast</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-sm"
            title="Close Pop-up"
          >
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>

        {/* Temperature & Condition Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {day.condition || "Partly Cloudy"}
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{tempMax}°C</span>
              <span className="text-sm text-slate-400 font-mono">Min {tempMin}°C</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-sky-400 font-mono">
              <CloudRain className="w-4 h-4" />
              <span>{rainProb}% Rain</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{rainSum} mm est.</p>
          </div>
        </div>

        {/* Agricultural & Outdoor Activity Recommendation */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
          isRainy 
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            {isRainy ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{isRainy ? 'High Rain Risk: Postpone Chemical Spraying' : 'Optimal Field Window: Safe for Outdoor Operations'}</span>
          </div>
          <p className="text-[11px] opacity-95">
            {isRainy
              ? `Estimated ${rainSum} mm precipitation may wash away applied pesticides and fertilizers. Maintain open drainage channels and carry an umbrella if commuting.`
              : `Low precipitation probability (${rainProb}%) and moderate wind. Suitable for foliar spraying, crop harvesting, and hassle-free commuting.`}
          </p>
        </div>

        {/* 4-Period Daily Breakdown */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Hourly Day Progression:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { time: "Morning", temp: `${tempMin + 3}°`, rain: `${Math.min(rainProb, 20)}%`, icon: "⛅" },
              { time: "Noon", temp: `${tempMax}°`, rain: `${rainProb}%`, icon: isRainy ? "🌧️" : "☀️" },
              { time: "Evening", temp: `${tempMax - 3}°`, rain: `${Math.max(0, rainProb - 10)}%`, icon: "⛅" },
              { time: "Night", temp: `${tempMin}°`, rain: `${Math.max(0, rainProb - 20)}%`, icon: "🌙" }
            ].map((period, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400">{period.time}</p>
                <span className="text-lg block my-0.5">{period.icon}</span>
                <p className="text-xs font-extrabold text-white font-mono">{period.temp}</p>
                <span className="text-[10px] text-cyan-400 font-mono font-bold block">{period.rain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Prominent Done Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer text-center"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
