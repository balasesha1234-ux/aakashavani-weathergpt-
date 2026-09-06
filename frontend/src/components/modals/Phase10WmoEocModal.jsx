import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Building2, 
  Radio, 
  Activity, 
  Anchor, 
  Flame, 
  Users, 
  FileText, 
  Lock, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { 
  getWmoWis2Feed, 
  getSeocWarRoomSitrep, 
  dispatchSovereignDirective 
} from '../../services/api';

export default function Phase10WmoEocModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('wmo'); // 'wmo' | 'eoc' | 'directive'

  // WMO State
  const [wmoData, setWmoData] = useState(null);

  // EOC State
  const [eocData, setEocData] = useState(null);

  // Directive State
  const [directiveResult, setDirectiveResult] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [wmo, eoc] = await Promise.all([
        getWmoWis2Feed(district),
        getSeocWarRoomSitrep(district)
      ]);
      if (wmo) setWmoData(wmo);
      if (eoc) setEocData(eoc);
    } catch (e) {
      console.error('Error loading Phase 10 data:', e);
    }
  };

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      const res = await dispatchSovereignDirective('ODISHA-SRC-DIR-2026-089', 'Special Relief Commissioner');
      if (res) setDirectiveResult(res);
    } catch (e) {
      console.error('Error dispatching directive:', e);
    } finally {
      setDispatching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="glass-panel app-modal-container w-full max-w-3xl rounded-3xl border border-white/20 shadow-2xl p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 10: WMO WIS 2.0 & Sovereign EOC War-Room
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                  GLOBAL & STATE FEDERATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                WMO WIS 2.0 GTS Binary Protocol, Multi-Force Incident War-Room & Sovereign Action Directives
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveSubTab('wmo')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'wmo'
                ? 'bg-indigo-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate">WMO WIS 2.0 Feed</span>
          </button>

          <button
            onClick={() => setActiveSubTab('eoc')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'eoc'
                ? 'bg-indigo-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">State EOC War-Room</span>
          </button>

          <button
            onClick={() => setActiveSubTab('directive')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'directive'
                ? 'bg-indigo-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="truncate">Sovereign Directive</span>
          </button>
        </div>

        {/* SubTab 1: WMO WIS 2.0 & GTS Feed */}
        {activeSubTab === 'wmo' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                World Meteorological Organization (WMO WIS 2.0 / GTS Standard)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Federates real-time surface SYNOP observations to the WMO Global Telecommunication System (GTS) using standardized BUFR Table-Driven Code Form (TDCF) binary structures.
              </p>
            </div>

            {wmoData && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-indigo-300 font-bold">STATION WMO ID: {wmoData.station_wmo_id}</span>
                    <span className="text-emerald-400 font-bold">STATUS: {wmoData.federation_status}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1 text-slate-300">
                    <div><strong>Topic:</strong> {wmoData.wis2_topic}</div>
                    <div><strong>Encoding:</strong> {wmoData.gts_binary_encoding}</div>
                    <div className="text-slate-400 break-all"><strong>BUFR Hex:</strong> {wmoData.encoded_bufr_hex}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-sans text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold">Air Temp (K)</div>
                      <div className="font-mono font-bold text-white mt-0.5">{wmoData.synop_metrics?.air_temperature_kelvin} K</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold">MSLP Pressure</div>
                      <div className="font-mono font-bold text-cyan-400 mt-0.5">{wmoData.synop_metrics?.mean_sea_level_pressure_hpa} hPa</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold">Wind Velocity</div>
                      <div className="font-mono font-bold text-teal-300 mt-0.5">{wmoData.synop_metrics?.wind_speed_m_s} m/s ({wmoData.synop_metrics?.wind_direction_degrees}°)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold">Past 24h Rain</div>
                      <div className="font-mono font-bold text-rose-400 mt-0.5">{wmoData.synop_metrics?.precipitation_amount_past_24h_mm} mm</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: State EOC War-Room Command Matrix */}
        {activeSubTab === 'eoc' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                State Emergency Operations Center (SEOC Rajiv Bhawan)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unified command console synchronizing multi-agency disaster forces across coastal districts during severe tropical cyclonic events.
              </p>
            </div>

            {eocData && (
              <div className="space-y-3">
                {/* Executive Summary Stats */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Active Shelters</div>
                    <div className="text-lg font-black text-white font-mono mt-0.5">{eocData.shelters_active_count}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Evacuees Sheltered</div>
                    <div className="text-lg font-black text-indigo-400 font-mono mt-0.5">{eocData.evacuees_sheltered?.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rations Airdropped</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">{eocData.relief_packets_airdropped?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Force Deployment List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Task Force Deployments:</span>
                  {eocData.active_forces?.map((f, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{f.force_name}</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-mono">{f.personnel_count} Troops</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{f.operational_status}</div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-400 font-mono">ACTIVE DEPLOYMENT</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Sovereign Directive Dispatch Engine */}
        {activeSubTab === 'directive' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                Sovereign Emergency Action Directive (SEOC / SRC)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Issues high-priority executive evacuation and relief mobilization orders signed with state cryptographic ECDSA SHA-256 digital keys.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-indigo-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 uppercase">Directive Number:</span>
                  <h4 className="text-base font-black text-white font-mono mt-0.5">ODISHA-SRC-DIR-2026-089</h4>
                </div>

                <button
                  onClick={handleDispatch}
                  disabled={dispatching}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-950/50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {dispatching ? 'Broadcasting...' : 'Broadcast Directive'}
                </button>
              </div>

              {directiveResult && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>STATUS: {directiveResult.dispatch_status}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    <strong>ECDSA Signature:</strong> {directiveResult.digital_signature_ecdsa_sha256}
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400">
                    <strong>Notified Networks:</strong> {directiveResult.channels_notified?.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
