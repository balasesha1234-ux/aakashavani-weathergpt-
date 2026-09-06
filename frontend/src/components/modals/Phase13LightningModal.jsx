import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  ShieldAlert, 
  Activity, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Compass, 
  Navigation, 
  ShieldCheck, 
  Eye 
} from 'lucide-react';
import { 
  getLightningDaminiTelemetry, 
  getElectricFieldGradient, 
  getDaminiSafetyAdvisory 
} from '../../services/api';

export default function Phase13LightningModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('telemetry'); // 'telemetry' | 'efm' | 'safety'

  // Telemetry State
  const [lightningData, setLightningData] = useState(null);

  // EFM State
  const [efmData, setEfmData] = useState(null);

  // Safety State
  const [safetyData, setSafetyData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [ltg, efm, safety] = await Promise.all([
        getLightningDaminiTelemetry(district),
        getElectricFieldGradient(district),
        getDaminiSafetyAdvisory(district)
      ]);
      if (ltg) setLightningData(ltg);
      if (efm) setEfmData(efm);
      if (safety) setSafetyData(safety);
    } catch (e) {
      console.error('Error loading Phase 13 data:', e);
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
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Zap className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 13: IITM Damini Lightning Detection & EFM Studio
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  TOTAL LIGHTNING & EFM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IITM Total Flash Rate (TFR) Jump, Electric Field Mills (+8.4 kV/m) & Step-Potential Ground Safety
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
            onClick={() => setActiveSubTab('telemetry')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'telemetry'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">Damini Telemetry</span>
          </button>

          <button
            onClick={() => setActiveSubTab('efm')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'efm'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="truncate">EFM Field Mills</span>
          </button>

          <button
            onClick={() => setActiveSubTab('safety')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'safety'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">Step-Potential Safety</span>
          </button>
        </div>

        {/* SubTab 1: Damini Telemetry */}
        {activeSubTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                IITM Earth Networks Total Lightning Sensor Array
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monitors Total Flash Rate (TFR) jumps exceeding 45 flashes/min to provide up to 45 minutes advance nowcasting of severe convective microbursts and high-amperage cloud-to-ground strikes.
              </p>
            </div>

            {lightningData && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Past 15m Flashes</div>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">{lightningData.total_flashes_past_15min}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Flash Rate Jump</div>
                    <div className="text-lg font-black text-rose-400 font-mono mt-0.5">{lightningData.flash_rate_per_min}/min</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Peak Current (kA)</div>
                    <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">{lightningData.max_peak_current_ka} kA</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">&lt; 3km Radius</div>
                    <div className="text-lg font-black text-red-500 font-mono mt-0.5">{lightningData.strikes_within_3km_radius} Strikes</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Triangulated Ground Strikes:</span>
                  {lightningData.recent_strikes?.map((st, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-amber-400">{st.strike_id}</span>
                        <span className="text-[11px] text-slate-300 ml-2">({st.type})</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Dist: {st.distance_km} km • Bearing: {st.bearing_deg}°</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400">{st.peak_current_ka} kA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: EFM Field Mills */}
        {activeSubTab === 'efm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Atmospheric Electric Field Mill (EFM Potential Gradient)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Directly measures surface electrostatic charge buildup beneath thunderheads to detect breakdown thresholds prior to initial lightning discharge.
              </p>
            </div>

            {efmData && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase font-sans">Potential Gradient:</span>
                    <h4 className="text-2xl font-black text-rose-400 mt-0.5 font-mono">+{efmData.atmospheric_potential_gradient_kv_m} kV/m</h4>
                  </div>
                  <div className="text-right font-sans">
                    <span className="text-xs font-bold text-slate-400 uppercase">Breakdown Risk:</span>
                    <div className="text-xl font-black text-red-400 font-mono mt-0.5">{efmData.dielectric_breakdown_risk_pct}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Gradient Trend</div>
                    <div className="font-bold text-amber-300 text-xs mt-0.5">{efmData.gradient_trend}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Strike Lead Time</div>
                    <div className="font-bold text-emerald-400 text-xs mt-0.5">{efmData.lead_time_to_first_strike_minutes} Minutes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Step-Potential Safety */}
        {activeSubTab === 'safety' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Step-Potential Ground Electrocution Prevention Guide
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                90% of rural lightning fatalities occur due to radial step-potential ground current rather than direct strikes.
              </p>
            </div>

            {safetyData && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1">
                  <div className="text-amber-300 font-bold uppercase text-[10px]">Farmer Crouch Posture Rule:</div>
                  <p className="text-slate-200 leading-relaxed">{safetyData.farmer_crouch_posture_guide}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Prohibited Rural Field Activities:</span>
                  <ul className="space-y-1">
                    {safetyData.prohibited_actions?.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
