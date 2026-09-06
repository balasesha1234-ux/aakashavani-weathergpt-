import React from 'react';
import { BarChart3, CloudRain, Sun, Droplets } from 'lucide-react';

export default function MeteogramChart({ meteogram }) {
  if (!meteogram || meteogram.length === 0) return null;

  // Take next 12 hours for compact high-impact display
  const hours = meteogram.slice(0, 12);
  const totalRain = hours.reduce((acc, h) => acc + (h.rain_mm || 0), 0);
  const maxRain = Math.max(...hours.map(h => h.rain_mm || 0), 2.0);

  const formatHourLabel = (timeStr, i) => {
    if (!timeStr) return `${i}h`;
    const h = parseInt(timeStr.slice(0, 2), 10);
    if (isNaN(h)) return timeStr.slice(0, 2);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}${ampm}`;
  };

  return (
    <div className="bg-slate-900/95 p-4 rounded-2xl border border-slate-800 my-2 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Hourly Precipitation & Temperature Meteogram</span>
        </div>
        <div className="flex items-center gap-2">
          {totalRain === 0 ? (
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> 0.0mm (Dry Skies)
            </span>
          ) : (
            <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" /> {totalRain.toFixed(1)}mm Total Rain
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-mono font-medium bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            GFS NWP Grid
          </span>
        </div>
      </div>

      {/* Visual Bar & Temperature Chart */}
      <div className="flex items-end justify-between gap-1.5 h-28 pt-6 border-b border-slate-800/80 pb-2">
        {hours.map((h, i) => {
          const rainVal = h.rain_mm || 0;
          const heightPct = Math.min(100, Math.max(14, (rainVal / maxRain) * 100));
          const hasRain = rainVal > 0.1;

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              
              {/* Temperature Badge Above Bar */}
              <span className="text-[9px] text-slate-400 font-semibold mb-1 group-hover:text-cyan-300 transition-colors">
                {Math.round(h.temp)}°
              </span>

              {/* Tooltip on hover */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-cyan-300 text-[10px] font-medium py-0.5 px-2 rounded-lg border border-slate-700 whitespace-nowrap z-20 shadow-xl pointer-events-none">
                {rainVal}mm rain • {h.temp}°C • {h.rain_prob || 0}% prob
              </div>

              {/* Rain Bar Slot */}
              <div 
                style={{ height: hasRain ? `${heightPct}%` : '18%' }}
                className={`w-full rounded-t-md transition-all duration-500 flex items-center justify-center ${
                  hasRain 
                    ? 'bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-300 shadow-md shadow-cyan-500/30' 
                    : 'bg-slate-800/60 border-t border-slate-700/50 group-hover:bg-slate-700/60'
                }`}
              >
                {hasRain && (
                  <span className="text-[8px] font-black text-slate-950 truncate px-0.5">
                    {rainVal}
                  </span>
                )}
              </div>
              
              {/* Hour Label */}
              <span className="text-[9px] text-slate-400 font-semibold mt-1.5 whitespace-nowrap">
                {formatHourLabel(h.time, i)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
        <span className="flex items-center gap-1.5">
          <span>🕒 Next 12 Hours Forecast</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Temperatures (°C) labeled above</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-cyan-400"></span> Rain (mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-slate-700"></span> Dry (0mm)
          </span>
        </span>
      </div>
    </div>
  );
}
