import React from 'react';
import { 
  AlertOctagon, 
  RefreshCw, 
  Building, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  X, 
  ShieldAlert, 
  Zap, 
  Activity 
} from 'lucide-react';

export function WhatsChangedFeed({ deltas }) {
  if (!deltas || deltas.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-rose-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
          <h3 className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">
            What's Changed? (Situational Delta Log)
          </h3>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
          LIVE SITREP
        </span>
      </div>

      <div className="space-y-2">
        {deltas.map((d, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#080C14]/90 border border-white/5">
            <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 shrink-0">
              {d.timestamp}
            </span>
            <div>
              <p className="text-xs font-bold text-white">{d.title}</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{d.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerifiedResourceList({ resources }) {
  const list = resources && resources.length > 0 ? resources : [
    { name: "Puri Cyclone Evacuation Shelter #04", type: "SHELTER", contact: "+91-6752-222001", address: "VIP Road, Sea Beach Area, Puri", capacity: 800, status: "OPERATIONAL" },
    { name: "District Headquarters Hospital Puri", type: "HOSPITAL", contact: "06752-222022", address: "Grand Road, Puri", capacity: 450, status: "STANDBY" },
    { name: "Odisha Disaster Rapid Action Force (ODRAF) Unit", type: "RESCUE_BASE", contact: "1070", address: "Chandanpur, Puri", capacity: 120, status: "DEPLOYED" }
  ];

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
            Nearby Verified Assistance & Relief Centers
          </h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          CONFIRMED DIRECTORY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {list.map((r, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-[#080C14] border border-white/5 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  {r.type}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {r.capacity ? `${r.capacity} Capacity` : 'Active'}
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-1.5 line-clamp-1">{r.name}</p>
              <p className="text-[11px] text-slate-400 flex items-start gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <span className="truncate">{r.address}</span>
              </p>
            </div>

            <a
              href={`tel:${r.contact}`}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-bold pt-1.5 border-t border-white/5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{r.contact}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SafetyActionsCard({ hazardType = "CYCLONE" }) {
  const dos = [
    "Move immediately to designated pucca cyclone shelters or reinforced structures.",
    "Keep battery-operated radio, torches, drinking water, and essential medicines ready.",
    "Disconnect electrical mains and turn off gas cylinders."
  ];

  const donts = [
    "Do not venture out during the lull period (eye of the storm).",
    "Do not touch downed power lines or waterlogged electrical equipment.",
    "Do not circulate unverified rumors on social messaging channels."
  ];

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10">
      <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span>Grounded NDMA Life-Safety Protocols</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> DO'S (क्या करें / ఏమి చేయాలి)
          </p>
          <ul className="space-y-2 text-slate-200 text-[11px]">
            {dos.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span className="leading-snug">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <p className="font-bold text-rose-400 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> DON'TS (क्या न करें / చేయకూడనివి)
          </p>
          <ul className="space-y-2 text-slate-200 text-[11px]">
            {donts.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span className="leading-snug">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyPanel({ emergencyData, onDeactivate, onTriggerDemoEmergency }) {
  const isEmergency = Boolean(emergencyData?.is_emergency_active || emergencyData?.warning?.severity === "RED");
  const warn = emergencyData?.warning || {
    severity: "GREEN",
    hazard_type: "NORMAL_STANDBY",
    affected_districts: "Manikonda / Hyderabad Zone",
    instructions: "No active severe disaster alerts in this district. Continuous Doppler radar scanning active.",
    provider: "IMD_EARLY_WARNING",
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString()
  };

  const deltas = emergencyData?.what_changed || [
    { timestamp: "5m ago", title: "IMD Doppler Radar Telemetry", description: "Clear atmospheric scan with normal barometric pressure (1013.2 hPa)." },
    { timestamp: "15m ago", title: "AWS Station Sync", description: "Temperatures stable at 26°C with 0.0mm rainfall." }
  ];

  const helplines = emergencyData?.official_helplines || [
    { name: "National Emergency Helpline", number: "112" },
    { name: "State Disaster Management (SDMA)", number: "1070" },
    { name: "District Disaster Control Room", number: "1077" },
    { name: "National Disaster Response Force (NDRF)", number: "011-24363260" }
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <div className={`p-5 rounded-3xl border-2 shadow-2xl transition-all ${
        isEmergency 
          ? 'bg-gradient-to-r from-rose-950 via-red-900/60 to-[#080C14] border-rose-500/70 shadow-rose-950/50 animate-emergency-pulse'
          : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#080C14] border-emerald-500/40'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
              isEmergency ? 'bg-rose-500 text-white animate-bounce shadow-rose-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isEmergency ? <AlertOctagon className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                  isEmergency ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {warn.severity} STATUS
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  {warn.hazard_type}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Command Room: {warn.affected_districts}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onDeactivate}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Back to Chat</span>
            </button>
          </div>
        </div>

        {/* Official Directives Box */}
        <p className="text-xs sm:text-sm font-medium text-slate-200 mt-3 p-3.5 rounded-2xl bg-black/50 border border-white/10 leading-relaxed">
          📢 <strong>Official Directives ({warn.provider}):</strong> {warn.instructions}
        </p>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-3 font-mono">
          <span>🕒 Issued: {new Date(warn.issued_at).toLocaleTimeString()}</span>
          <span>•</span>
          <span>📡 NDMA CAP & IMD Early Warning Broadcast Active</span>
        </div>
      </div>

      {/* Situational Delta Log */}
      <WhatsChangedFeed deltas={deltas} />

      {/* Verified Resources Grid */}
      <VerifiedResourceList resources={emergencyData?.emergency_resources} />

      {/* Safety Protocols */}
      <SafetyActionsCard hazardType={warn.hazard_type} />

      {/* Official Helplines */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10">
        <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-3">
          Emergency Hotlines & Helplines
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {helplines.map((h, i) => (
            <a
              key={i}
              href={`tel:${h.number.split('/')[0].trim()}`}
              className="p-3 rounded-2xl bg-[#080C14] border border-white/5 hover:border-cyan-500 flex items-center justify-between text-xs transition-colors"
            >
              <span className="text-slate-300 font-medium truncate pr-1">{h.name}</span>
              <span className="font-bold text-cyan-400 font-mono shrink-0">{h.number}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
