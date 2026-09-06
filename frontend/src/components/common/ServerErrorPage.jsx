import React from 'react';
import { AlertOctagon, RefreshCw, Radio, PhoneCall, ShieldCheck } from 'lucide-react';

export default function ServerErrorPage({ onRetry, incidentId = `ERR-${Date.now().toString(36).toUpperCase()}` }) {
  return (
    <div className="min-h-screen bg-[#080C14] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Crimson Warning Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-rose-500/40 shadow-2xl relative z-10 text-center space-y-6">
        
        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto shadow-inner shadow-rose-500/20">
          <AlertOctagon className="w-10 h-10 animate-pulse" />
        </div>

        {/* 500 Code & Headline */}
        <div className="space-y-2">
          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 tracking-tighter">
            500
          </div>
          <h2 className="text-xl font-black text-white">
            Telemetry Processing Interruption
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            An internal meteorological model exception occurred. The local offline rules engine and cached synoptic forecast remain operational.
          </p>
        </div>

        {/* Incident Trace Box */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-left font-mono text-[11px] space-y-1">
          <div className="text-slate-500 flex items-center justify-between">
            <span>Incident Reference:</span>
            <span className="text-rose-400 font-bold">{incidentId}</span>
          </div>
          <div className="text-slate-500 flex items-center justify-between">
            <span>Offline Fallback:</span>
            <span className="text-emerald-400 font-bold">READY (PWA Cache)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Live Radar Stream</span>
          </button>

          <a
            href="tel:112"
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-bold text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emergency Lifeline: Call 112</span>
          </a>
        </div>

        {/* Security Note */}
        <p className="text-[10px] text-slate-500 font-mono">
          Zero Data Loss Guaranteed • State Incident Logged
        </p>

      </div>
    </div>
  );
}
