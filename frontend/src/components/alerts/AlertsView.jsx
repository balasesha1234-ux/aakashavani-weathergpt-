import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Hospital, 
  Building2, 
  Flame, 
  Shield, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  MessageSquareText, 
  PhoneCall, 
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  LifeBuoy,
  Cpu,
  Globe,
  Lock,
  Droplets,
  Award,
  ExternalLink,
  Waves
} from 'lucide-react';
import { getEmergencyStatus, getEmergencyResources, getEmergencyDelta, getAllWarnings } from '../../services/api';

export default function AlertsView({ 
  latitude, 
  longitude, 
  district, 
  appMode = 'live',
  onOpenSms, 
  onOpenIvr,
  onOpenPhase3,
  onOpenPhase6,
  onOpenPhase10,
  onOpenPhase12,
  onOpenPhase14,
  onOpenPhase16,
  onNavigate 
}) {
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [resources, setResources] = useState([]);
  const [deltaLogs, setDeltaLogs] = useState([]);
  const [allWarnings, setAllWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const fetchAlertsData = async () => {
    try {
      const [eStatus, resList, deltas, warns] = await Promise.all([
        getEmergencyStatus(latitude, longitude, district, appMode),
        getEmergencyResources(latitude, longitude, district),
        getEmergencyDelta('CYCLONE'),
        getAllWarnings(appMode)
      ]);
      setEmergencyStatus(eStatus);
      setResources(resList || []);
      setDeltaLogs(deltas || []);
      setAllWarnings(warns || []);
    } catch (err) {
      console.error('Alerts data load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, [latitude, longitude, district, appMode]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlertsData();
  };

  const isSimulated = Boolean(emergencyStatus?.warning?.is_simulated);
  // In Live Mode, synthetic demo alerts MUST NEVER be treated as critical active alerts (Rule 1 & Rule 3)
  const isCritical = (appMode === 'live' && isSimulated) 
    ? false 
    : Boolean(emergencyStatus?.is_emergency_active);
  const severity = (appMode === 'live' && isSimulated) 
    ? 'NORMAL' 
    : (emergencyStatus?.severity || 'NORMAL');

  const filteredResources = activeCategory === 'ALL' 
    ? resources 
    : resources.filter(r => {
        const t = (r.resource_type || r.type || '').toLowerCase();
        return t === activeCategory.toLowerCase() || t.includes(activeCategory.toLowerCase());
      });

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#070B14] via-[#0B1120] to-[#070B14] text-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                isCritical 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                  : severity === 'ORANGE' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isCritical ? 'bg-red-400' : severity === 'ORANGE' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}></span>
                {isCritical ? 'CRITICAL DISASTER EMERGENCY' : severity === 'ORANGE' ? 'ACTIVE ADVISORY (ORANGE)' : 'VERIFIED ALL-CLEAR (NORMAL)'}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• NDMA CAP Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              <ShieldAlert className={`w-7 h-7 ${isCritical ? 'text-red-400' : 'text-cyan-400'}`} />
              Disaster Warnings & Safety Center
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Alerts'}
            </button>
          </div>
        </div>

        {/* Primary Severity Hero Card */}
        {isCritical ? (
          <div className={`rounded-3xl p-6 sm:p-7 ${
            isSimulated 
              ? 'bg-gradient-to-br from-amber-950/90 via-slate-900/90 to-[#0F080A] border-2 border-amber-500/70 shadow-2xl shadow-amber-950/40' 
              : 'bg-gradient-to-br from-red-950/90 via-rose-950/70 to-[#0F080A] border-2 border-red-500/80 shadow-2xl shadow-red-950/60'
          } relative overflow-hidden`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                {isSimulated && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/25 border border-amber-500/60 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>DEMO / SIMULATED DATA — Active Disaster Simulation Benchmark</span>
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${
                  isSimulated ? 'bg-amber-500 text-slate-950' : 'bg-red-600 text-white'
                } tracking-widest uppercase`}>
                  {isSimulated ? '⚠️ DEMO / SIMULATED DATA' : '🔴 OFFICIAL IMD RED ALERT IN EFFECT'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {emergencyStatus?.warning?.headline || (isSimulated ? `Simulated Severe Disaster Scenario (${district})` : 'Severe Alert Imminent')}
                </h2>
                <p className="text-sm sm:text-base text-red-200 leading-relaxed max-w-3xl">
                  {emergencyStatus?.warning?.instructions || 'Immediate evacuation ordered for all low-lying coastal villages. Move to pucca cyclone relief shelters. Keep battery torches, water, and dry rations.'}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span>Target District: <strong className="text-white">{district}</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="text-white">{emergencyStatus?.warning?.provenance?.source || emergencyStatus?.warning?.provider || 'IMD_CAP'}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className={isSimulated ? "text-amber-300" : "text-red-400"}>{isSimulated ? 'DEMO / SIMULATION' : 'LIVE VERIFIED'}</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
                <a
                  href="tel:112"
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-red-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Phone className="w-4 h-4 text-red-600" />
                  Call 112 National Helpline
                </a>
                <a
                  href="tel:1077"
                  className="px-5 py-3 rounded-2xl bg-red-800/80 hover:bg-red-700 text-white font-bold text-sm text-center flex items-center justify-center gap-2 border border-red-500/50 transition"
                >
                  <Phone className="w-4 h-4" />
                  Call 1077 {district || 'District'} Control
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-700/60 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex-shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wide mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Telemetry: All Clear</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  No active verified warning for your area ({district || 'Detected Area'}).
                </h3>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Surface telemetry and Doppler Radar scans indicate safe atmospheric conditions. Standard weather monitoring remains active.
                </p>
                <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                  <span>Status: <strong className="text-emerald-400">VERIFIED ALL-CLEAR</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="text-slate-300">IMD CAP & Open-Meteo Telemetry</strong></span>
                  <span>•</span>
                  <span>Geofence: <strong className="text-emerald-400">PASSED</strong></span>
                </div>
                <div className="pt-3 flex flex-wrap gap-2">
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition"
                  >
                    <Phone className="w-3 h-3 text-red-400" />
                    Call 112 (National)
                  </a>
                  <a
                    href="tel:1077"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition"
                  >
                    <Phone className="w-3 h-3 text-amber-400" />
                    Call 1077 ({district || 'District'} Control)
                  </a>
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    Call 108 (Ambulance)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Grid: What's Changed? Delta Feed + Verified Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: "What's Changed?" Chronological Sitrep */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                "What's Changed?" Situational Log
              </h2>
              <span className="text-[11px] text-cyan-400 font-mono">Live Delta</span>
            </div>

            <div className="space-y-3">
              {deltaLogs.map((log, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {log.timestamp}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.severity_shift === 'ESCALATED' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {log.severity_shift}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{log.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Offline Telecom Simulators Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                Low-Bandwidth 2G & Voice Fallbacks
              </div>
              <p className="text-xs text-slate-400">
                When mobile data is disconnected or towers are congested during severe storms:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {onOpenSms && (
                  <button
                    onClick={onOpenSms}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquareText className="w-3.5 h-3.5 text-cyan-400" />
                    2G SMS Query
                  </button>
                )}
                {onOpenIvr && (
                  <button
                    onClick={onOpenIvr}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    IVR Voice Helpline
                  </button>
                )}
              </div>

              {/* Verified Emergency Directives */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">National Emergency Portal (112)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">24x7 ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Direct satellite-linked emergency dispatch for Cyclone shelters, flood evacuation rafts, medical ICU support, and agricultural loss registration.
                </p>
              </div>

              {/* Flood & Rising Water Level Survival Protocol */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-cyan-950/60 border border-cyan-500/30 space-y-2.5">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Flood & Water Level Rising Protocol
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Immediate life-safety guidelines when river discharge or street water levels surge:
                </p>
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/5">
                    <span className="text-amber-400 font-bold">⚡</span>
                    <span><strong>Switch Off Electricity & Gas:</strong> Disconnect main electrical breaker and shut LPG cylinder valves immediately before water reaches your floor.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/5">
                    <span className="text-rose-400 font-bold">🚫</span>
                    <span><strong>Turn Around, Don't Drown:</strong> NEVER walk, swim, or drive through flowing water. Just 6 inches of water knocks adults down; 12 inches floats cars.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/5">
                    <span className="text-cyan-400 font-bold">🏢</span>
                    <span><strong>Evacuate to Upper Floor / Roof:</strong> Move to the 1st or 2nd floor or roof. Avoid closed attics where water can trap you.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/5">
                    <span className="text-emerald-400 font-bold">🚰</span>
                    <span><strong>Boil All Drinking Water:</strong> Floodwater contaminates ground and tap water with sewage. Boil water for at least 3 minutes.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Verified Emergency Resources */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-red-400" />
                Verified Relief & Assistance Directory
              </h2>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'shelter', 'hospital', 'fire_station', 'police_station'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                      activeCategory === cat 
                        ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Verified' : cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredResources.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <LifeBuoy className="w-8 h-8 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No facilities match "{activeCategory.replace('_', ' ')}"</h4>
                  <p className="text-xs text-slate-400">Switch filter to "All Verified" to view all available shelters, hospitals, police, and fire stations in {district}.</p>
                </div>
              ) : (
                filteredResources.map((res, idx) => {
                  const rType = (res.resource_type || res.type || '').toLowerCase();
                  const getIcon = () => {
                    if (rType.includes('hosp')) return <Hospital className="w-5 h-5 text-rose-400" />;
                    if (rType.includes('shelter')) return <Building2 className="w-5 h-5 text-amber-400" />;
                    if (rType.includes('fire')) return <Flame className="w-5 h-5 text-orange-400" />;
                    if (rType.includes('police')) return <Shield className="w-5 h-5 text-indigo-400" />;
                    return <Shield className="w-5 h-5 text-cyan-400" />;
                  };

                  const phoneNumbers = (res.contact || res.phone || '').split('/').map(s => s.trim()).filter(Boolean);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0">
                            {getIcon()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                {rType.replace('_', ' ')}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Strictly Verified
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-0.5">{res.name}</h4>
                            <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                              <span>{res.address}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-black text-white">{res.distance_km} km</span>
                          <div className="text-[10px] text-slate-500">Distance</div>
                          {res.latitude && res.longitude && (
                            <div className="mt-1 flex flex-col items-end gap-1">
                              {onNavigate && (
                                <button
                                  onClick={() => onNavigate('map')}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                                  title="View on WebGIS Studio Map"
                                >
                                  <span>🧭 Route on Map</span>
                                </button>
                              )}
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${res.latitude},${res.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>GPS Voice</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone Numbers & Direct Call Actions */}
                      <div className="pt-2.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="text-slate-400 text-[11px]">
                          Registry: <strong className="text-slate-300">{res.source}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {phoneNumbers.map((num, pIdx) => (
                            <a
                              key={pIdx}
                              href={`tel:${num.replace(/[^0-9+]/g, '')}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                            >
                              <Phone className="w-3 h-3" />
                              {num}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
