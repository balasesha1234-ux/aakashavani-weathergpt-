import React from 'react';
import { Compass, ArrowLeft, Radio, CloudRain, ShieldAlert, Sparkles } from 'lucide-react';

export default function NotFoundPage({ onNavigateHome }) {
  return (
    <div className="min-h-screen bg-[#080C14] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Atmospheric Radar Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-700/60 shadow-2xl relative z-10 text-center space-y-6">
        
        {/* Radar Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto shadow-inner shadow-cyan-500/20">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} />
        </div>

        {/* 404 Code & Headline */}
        <div className="space-y-2">
          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 tracking-tighter">
            404
          </div>
          <h2 className="text-xl font-black text-white">
            Atmospheric Sector Unmapped
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            The coordinate telemetry point or view route you are probing is unindexed within the national Doppler grid.
          </p>
        </div>

        {/* Action Group */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Radar Dashboard</span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-1.5 justify-center">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>NWP Models OK</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-1.5 justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>NDMA Grid Active</span>
            </div>
          </div>
        </div>

        {/* Emergency Footnote */}
        <p className="text-[10px] text-slate-500 font-mono">
          AakashaVani Sovereign Telemetry • Error: HTTP_404_UNMAPPED
        </p>

      </div>
    </div>
  );
}
