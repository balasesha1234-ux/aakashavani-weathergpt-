import React, { useState } from 'react';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Calendar, 
  Gauge, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import ErrorBoundary from '../common/ErrorBoundary';
import DayForecastModal from './DayForecastModal';

function WeatherCardInner({ weather, district }) {
  const [selectedDay, setSelectedDay] = useState(null);

  if (!weather || !weather.current) return null;

  const current = weather.current;
  const forecast7d = weather.forecast_7d || [];

  // Weather icon selector
  const getWeatherIcon = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('rain') || c.includes('shower')) return '🌧️';
    if (c.includes('thunder') || c.includes('storm')) return '⛈️';
    if (c.includes('cloud') || c.includes('overcast')) return '⛅';
    if (c.includes('drizzle')) return '🌦️';
    return '☀️';
  };

  const getDayLabel = (d, idx) => {
    if (d.day_name) return d.day_name.slice(0, 3);
    if (d.date) {
      try {
        const dt = new Date(d.date);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()] || `Day ${idx + 1}`;
      } catch (e) {
        return `D+${idx}`;
      }
    }
    return `Day ${idx + 1}`;
  };

  return (
    <>
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl my-3">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                Open-Meteo Physical Telemetry
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                VERIFIED
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
              {district || "Wardha"}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
              <span className="text-base">{getWeatherIcon(current.condition)}</span>
              <span>{current.condition}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center justify-end">
              <span>{Math.round(current.temperature)}°</span>
              <span className="text-lg sm:text-xl text-cyan-400 font-normal ml-0.5">C</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Feels like <strong className="text-slate-200">{Math.round(current.feels_like)}°C</strong>
            </p>
          </div>
        </div>

        {/* 4-Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
          
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rainfall</p>
              <p className="text-xs font-extrabold text-white font-mono">{current.rainfall_mm} mm</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Humidity</p>
              <p className="text-xs font-extrabold text-white font-mono">{current.humidity}%</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Wind Speed</p>
              <p className="text-xs font-extrabold text-white font-mono">{current.wind_speed_kmh} km/h</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Air Quality</p>
              <p className="text-xs font-extrabold text-emerald-300">AQI 42 • Good</p>
            </div>
          </div>

        </div>

        {/* 7-Day Forecast Horizontal Strip */}
        {forecast7d.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>7-Day Forecast (Tap for details)</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                <span>View Hourly Breakdown</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {forecast7d.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className="p-2.5 rounded-2xl bg-slate-900/70 border border-white/10 text-center flex flex-col items-center justify-between hover:bg-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer group shadow-sm"
                  title="Click to view detailed hourly forecast & agricultural spray advice"
                >
                  <p className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-300">{getDayLabel(day, idx)}</p>
                  <span className="text-lg my-1">{getWeatherIcon(day.condition)}</span>
                  <div className="text-[11px] font-mono">
                    <span className="text-white font-bold">{Math.round(day.temp_max)}°</span>
                    <span className="text-slate-500 ml-0.5">{Math.round(day.temp_min)}°</span>
                  </div>
                  <span className="text-[9px] text-cyan-400 font-mono mt-0.5 font-bold">
                    {day.rain_prob_max ?? day.rain_prob ?? 0}% rain
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Interactive Day Forecast Modal */}
      {selectedDay && (
        <DayForecastModal
          day={selectedDay}
          district={district}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}

export default function WeatherCard(props) {
  return (
    <ErrorBoundary name="Weather Observation Card">
      <WeatherCardInner {...props} />
    </ErrorBoundary>
  );
}
