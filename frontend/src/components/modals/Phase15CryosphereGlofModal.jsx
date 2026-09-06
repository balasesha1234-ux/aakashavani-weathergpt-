import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mountain, 
  Snowflake, 
  Radio, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Zap, 
  Send, 
  ShieldAlert, 
  Compass, 
  Layers 
} from 'lucide-react';
import { 
  getGlacialLakesTelemetry, 
  getAvalancheRadarStatus, 
  triggerGlofEvacuation 
} from '../../services/api';

export default function Phase15CryosphereGlofModal({ isOpen, onClose, region = 'Eastern Himalayas' }) {
  const [activeSubTab, setActiveSubTab] = useState('glof'); // 'glof' | 'avalanche' | 'evacuate'

  // GLOF Lakes State
  const [lakes, setLakes] = useState([]);

  // Avalanche State
  const [avalancheData, setAvalancheData] = useState(null);

  // Evacuate State
  const [selectedLake, setSelectedLake] = useState('GLOF-LAKE-SOUTH-LHONAK-01');
  const [evacResult, setEvacResult] = useState(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, region]);

  const loadAllData = async () => {
    try {
      const [lakeList, av] = await Promise.all([
        getGlacialLakesTelemetry(region),
        getAvalancheRadarStatus('Rohtang / Zojila Alpine Corridor')
      ]);
      if (lakeList) setLakes(lakeList);
      if (av) setAvalancheData(av);
    } catch (e) {
      console.error('Error loading Phase 15 data:', e);
    }
  };

  const handleTriggerEvacuation = async () => {
    setTriggering(true);
    try {
      const res = await triggerGlofEvacuation(selectedLake);
      if (res) setEvacResult(res);
    } catch (e) {
      console.error('Error triggering GLOF evacuation:', e);
    } finally {
      setTriggering(false);
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
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Mountain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 15: Himalayan Cryosphere & GLOF Radar
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold">
                  HIGH-ALTITUDE CRYOSPHERE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Glacial Lake Outburst Flood (GLOF) Moraine Dam Telemetry & DGRE Avalanche Radars
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
            onClick={() => setActiveSubTab('glof')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'glof'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span className="truncate">GLOF Moraine Dams</span>
          </button>

          <button
            onClick={() => setActiveSubTab('avalanche')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'avalanche'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span className="truncate">Avalanche Radar</span>
          </button>

          <button
            onClick={() => setActiveSubTab('evacuate')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'evacuate'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="truncate">Valley Siren Broadcast</span>
          </button>
        </div>

        {/* SubTab 1: GLOF Moraine Dams */}
        {activeSubTab === 'glof' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                High-Altitude Glacial Lake Hydrostatic Stability & InSAR Subsidence
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monitors terminal moraine dam integrity, expanding supraglacial water volume, and SAR interferometry slope deformation across vulnerable high-altitude Himalayan lakes.
              </p>
            </div>

            <div className="space-y-3">
              {lakes.map((lk, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400 font-mono text-xs">{lk.lake_id}</span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                          {lk.glof_threat_level}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mt-0.5">{lk.lake_name} ({lk.elevation_meters}m ASL)</h5>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">{lk.downstream_siren_network_status}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">Water Volume</div>
                      <div className="font-mono font-bold text-white mt-0.5">{lk.water_volume_million_m3}M m³</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">Water Rise Rate</div>
                      <div className="font-mono font-bold text-rose-400 mt-0.5">+{lk.water_level_rise_rate_cm_hr} cm/h</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">InSAR Deformation</div>
                      <div className="font-mono font-bold text-amber-400 mt-0.5">{lk.sar_subsidence_displacement_mm_yr} mm/yr</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">Freeboard Height</div>
                      <div className="font-mono font-bold text-cyan-300 mt-0.5">{lk.freeboard_height_meters} m</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong>Downstream Valleys:</strong> {lk.downstream_valleys_at_risk?.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubTab 2: Avalanche Radar */}
        {activeSubTab === 'avalanche' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                DGRE Snowpack Stratigraphy & Alpine Avalanche Radar
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ku-Band Doppler radar continuously profiling snow accumulation and slab shear failure along strategic high-altitude mountain passes.
              </p>
            </div>

            {avalancheData && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-cyan-300 uppercase font-sans">Corridor:</span>
                    <h4 className="text-base font-bold text-white mt-0.5 font-sans">{avalancheData.alpine_corridor}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase font-sans">Threat Stage:</span>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">{avalancheData.danger_level}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-sans">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Total Snowpack</div>
                    <div className="font-mono font-bold text-white text-sm mt-0.5">{avalancheData.snowpack_depth_cm} cm</div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Past 24h Snow</div>
                    <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">+{avalancheData.fresh_snow_past_24h_cm} cm</div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Shear Stability</div>
                    <div className="font-mono font-bold text-rose-400 text-sm mt-0.5">{avalancheData.shear_strength_stability_index}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Valley Siren Broadcast */}
        {activeSubTab === 'evacuate' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Downstream Valley High-Altitude Siren & Hydropower Gate Trigger
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transmits redundant satellite Iridium & POLNET radio triggers to activate 140dB valley sirens and automatically trip downstream dam spillways.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <select
                  value={selectedLake}
                  onChange={(e) => setSelectedLake(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
                >
                  <option value="GLOF-LAKE-SOUTH-LHONAK-01">South Lhonak Glacial Lake (North Sikkim)</option>
                  <option value="GLOF-LAKE-RISHIGANGA-02">Nanda Devi Hanging Ice Glacier (Chamoli)</option>
                </select>

                <button
                  onClick={handleTriggerEvacuation}
                  disabled={triggering}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <Radio className="w-3.5 h-3.5" />
                  {triggering ? 'Triggering...' : 'Trigger 140dB Valley Sirens'}
                </button>
              </div>

              {evacResult && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <span>SIREN OUTPUT: {evacResult.siren_frequency_db} dB</span>
                    <span>SPILLWAYS: TRIPPED_OPEN</span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    <strong>Valleys Alerted:</strong> {evacResult.valleys_notified?.join(' • ')}
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
