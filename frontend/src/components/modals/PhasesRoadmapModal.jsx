import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Rocket, 
  Sparkles, 
  Radio, 
  Cpu, 
  Globe, 
  PhoneCall, 
  ShieldAlert, 
  CloudRain 
} from 'lucide-react';

export default function PhasesRoadmapModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="glass-panel app-modal-container w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full glass-panel rounded-2xl p-2 flex items-center justify-center text-cyan-400">
                <Rocket className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  AakashaVani Phased Roadmap
                </h3>
                <span className="text-[10px] bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Problem 26068
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                National Strategic Execution Plan for Conversational Weather & Climate Resilience
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Timeline Cards */}
        <div className="space-y-4">
          
          {/* Phase 1: Current Operational MVP */}
          <div className="p-4 sm:p-5 rounded-3xl bg-cyan-950/30 border-2 border-cyan-500/60 space-y-3 relative overflow-hidden shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <h4 className="text-sm font-extrabold text-cyan-300">
                  PHASE 1: Core Grounded Intelligence & Last-Mile Multimodal (Current MVP)
                </h4>
              </div>
              <span className="text-[10px] bg-cyan-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                100% OPERATIONAL
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Foundational conversational intelligence platform grounded in IMD surface observation telemetry, NOAA GFS 0.25° NWP numerical modeling, and ICAR agromet advisory rules.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                "Zero-Hallucination IMD Ground Truth Engine",
                "Multimodal AI Vision (Crop Diseases & Flood Depth)",
                "13 Indian Languages + Natural Speech Readout",
                "Interactive WebGIS Radar & Shelter Map",
                "Low-Bandwidth 2G SMS & IVR Hotlines",
                "User Behavioral Memory Database (UserPattern)"
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2: National Grid Expansion & Direct Telecom */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-extrabold text-slate-200">
                  PHASE 2: National Telecom Integration & WhatsApp Push (6 - 12 Months)
                </h4>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase">
                SCALING PHASE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Scale out to 700+ Indian districts with direct telecom carrier integration, official Toll-Free Missed Call auto-dialers for non-literate farmers, and WhatsApp vernacular voice broadcasts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                "Toll-Free 1800-WEATHER Missed Call Auto-Dialer",
                "WhatsApp Enterprise Voice Note Advisory Push",
                "39 IMD Doppler Weather Radar Direct Telemetry Stream",
                "PM-Fasal Bima Yojana (PMFBY) Crop Loss Integration"
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3: Autonomous Village IoT & Drone Resilience */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-extrabold text-slate-300">
                  PHASE 3: Nationwide Autonomous Disaster Resilience & Edge IoT (12 - 24 Months)
                </h4>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase">
                FUTURE VISION
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Fully automated early warning ecosystem triggering solar-powered Gram Panchayat loudspeaker broadcasts during active CAP Red Alerts and automated multi-spectral drone assessment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                "Solar-Powered Village Panchayat Siren & Loudspeaker IoT",
                "Autonomous Multi-Spectral Drone Damage Survey",
                "Edge Microclimate Machine Learning on Offline Devices",
                "National Disaster Management Authority (NDMA) Direct Bridge"
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            Got it, Back to App
          </button>
        </div>

      </div>
    </div>
  );
}
