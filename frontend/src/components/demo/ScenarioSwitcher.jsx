import React from 'react';
import { PlayCircle, Sparkles } from 'lucide-react';

export default function ScenarioSwitcher({ onSelectScenario }) {
  const scenarios = [
    {
      id: "scenario_cyclone_puri",
      title: "🚨 Cyclone Red Alert Simulation (Puri, OD)",
      district: "Puri",
      latitude: 19.8135,
      longitude: 85.8312,
      language: "en",
      role: "disaster_manager",
      query: "What is the cyclone landfall status and where are nearby emergency shelters in Puri?",
      badge: "Adaptive Disaster Emergency Mode"
    },
    {
      id: "scenario_farmer_wardha",
      title: "🌾 Agro-Met Simulation (Wardha, MH)",
      district: "Wardha",
      latitude: 20.7453,
      longitude: 78.6022,
      language: "en",
      role: "farmer",
      query: "Can I spray fertilizer on my cotton crops tomorrow in Wardha?",
      badge: "Agromet Rules & Meteogram"
    },
    {
      id: "scenario_fisherman_vizag",
      title: "⛵ Marine Squall Simulation (Vizag, AP)",
      district: "Visakhapatnam",
      latitude: 17.6868,
      longitude: 83.2185,
      language: "te",
      role: "fisherman",
      query: "రేపు సముద్రంలో చేపల వేటకు వెళ్లడం సురక్షితమేనా?",
      badge: "Telugu Marine & Wave Swells"
    },
    {
      id: "scenario_monsoon_mumbai",
      title: "🏙️ Urban Flood Simulation (Mumbai, MH)",
      district: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
      language: "mr",
      role: "citizen",
      query: "संध्याकाळी दादर भागात पाणी साचण्याची शक्यता आहे का?",
      badge: "Marathi Commute & Flash Flood"
    }
  ];

  return (
    <div className="glass-panel p-3 rounded-2xl border border-white/10 my-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <PlayCircle className="w-4 h-4 text-cyan-400" />
          <span>⚡ Live Weather & Disaster Simulations</span>
        </div>
        <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-mono font-semibold">
          LIVE SIMULATIONS
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectScenario(s)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/40 text-left transition-all group shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {s.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">"{s.query}"</p>
            <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-md mt-1.5 border ${
              s.id === 'scenario_cyclone_puri' 
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold' 
                : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            }`}>
              {s.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
