import React, { useState, useEffect } from 'react';
import { 
  X, 
  Waves, 
  Building2, 
  Droplets, 
  Activity, 
  Send, 
  CheckCircle2, 
  Gauge, 
  Sliders, 
  AlertTriangle, 
  Layers, 
  Zap 
} from 'lucide-react';
import { 
  getPinnFloodInundation, 
  getUrbanDrainageDigitalTwin, 
  actuateDrainagePump 
} from '../../services/api';

export default function Phase14FlashFloodPinnModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('pinn'); // 'pinn' | 'drainage' | 'pump'

  // PINN State
  const [pinnData, setPinnData] = useState(null);

  // Digital Twin State
  const [drainageData, setDrainageData] = useState(null);

  // Pump Actuation State
  const [selectedPump, setSelectedPump] = useState('PUMP-STATION-PURI-WEST-01');
  const [pumpResult, setPumpResult] = useState(null);
  const [actuating, setActuating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [pinn, drainage] = await Promise.all([
        getPinnFloodInundation(district),
        getUrbanDrainageDigitalTwin('Puri Municipal Area')
      ]);
      if (pinn) setPinnData(pinn);
      if (drainage) setDrainageData(drainage);
    } catch (e) {
      console.error('Error loading Phase 14 data:', e);
    }
  };

  const handleActuatePump = async () => {
    setActuating(true);
    try {
      const res = await actuateDrainagePump(selectedPump, 450);
      if (res) setPumpResult(res);
    } catch (e) {
      console.error('Error actuating drainage pump:', e);
    } finally {
      setActuating(false);
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
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Droplets className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 14: PINN Flash Flood & Urban Digital Twin
                </h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full font-bold">
                  2D NAVIER-STOKES PINN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Physics-Informed Neural Network 2D Inundation, Siltation Culverts & Sump Pump SCADA Actuation
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
            onClick={() => setActiveSubTab('pinn')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'pinn'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span className="truncate">PINN 2D Inundation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('drainage')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'drainage'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">Culvert Digital Twin</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pump')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'pump'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="truncate">Sump Pump SCADA</span>
          </button>
        </div>

        {/* SubTab 1: PINN 2D Inundation */}
        {activeSubTab === 'pinn' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                Physics-Informed DeepONet 2D Shallow Water PDE Solver
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Embeds Navier-Stokes conservation of mass and momentum into neural networks to simulate sub-meter water depth and flow velocity in 38 milliseconds.
              </p>
            </div>

            {pinnData && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rainfall Rate</div>
                    <div className="text-lg font-black text-sky-400 font-mono mt-0.5">{pinnData.simulated_rainfall_intensity_mm_hr} mm/h</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Max Flood Depth</div>
                    <div className="text-lg font-black text-rose-400 font-mono mt-0.5">{pinnData.max_flood_depth_meters} m</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Peak Velocity</div>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">{pinnData.peak_flow_velocity_m_s} m/s</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">PDE Loss Residual</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">{pinnData.pde_loss_residual}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/40 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Critical Hydrodynamic Inundation Bottlenecks:</span>
                  {pinnData.critical_inundation_zones?.map((z, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{z.zone_name}</span>
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                            {z.risk_level}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Depth: <strong className="text-sky-300 font-mono">{z.flood_depth_m}m</strong> • Velocity: <strong className="text-amber-300 font-mono">{z.flow_velocity_m_s}m/s</strong> • Choke: <strong className="text-rose-400 font-mono">{z.drainage_choke_pct}%</strong>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">{z.population_at_risk} At Risk</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: Culvert Digital Twin */}
        {activeSubTab === 'drainage' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                Urban Storm Drainage Network & Culvert Siltation Twin
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time IoT ultrasonic water level sensors and siltation depth gauges mapping underground culvert discharge across municipal wards.
              </p>
            </div>

            {drainageData && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Drains</div>
                    <div className="text-base font-black text-white font-mono mt-0.5">{drainageData.total_storm_drains_km} km</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">IoT Sensors</div>
                    <div className="text-base font-black text-cyan-400 font-mono mt-0.5">{drainageData.telemetry_sensors_active} Active</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Siltation Choke</div>
                    <div className="text-base font-black text-rose-400 font-mono mt-0.5">{drainageData.average_siltation_blockage_pct}%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">High-Capacity Outfall Sump Stations:</span>
                  {drainageData.critical_pumps?.map((p, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{p.pump_id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.location} • {p.operating_state}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-sky-300 font-bold">{p.current_discharge_cusecs} / {p.capacity_cusecs} Cusecs</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">{p.backflow_gate_status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Sump Pump SCADA */}
        {activeSubTab === 'pump' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Remote SCADA Sump Pump Actuation & Discharge Throttle
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Directly controls municipal high-volume dewatering turbines to flush storm water outfall channels into the Bay of Bengal before low-lying wards submerge.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-sky-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <select
                  value={selectedPump}
                  onChange={(e) => setSelectedPump(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
                >
                  <option value="PUMP-STATION-PURI-WEST-01">Banki Muhana Outfall (450 Cusecs)</option>
                  <option value="PUMP-STATION-PURI-EAST-02">Atharanala Drainage Sluice (300 Cusecs)</option>
                </select>

                <button
                  onClick={handleActuatePump}
                  disabled={actuating}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-950/50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {actuating ? 'Actuating SCADA...' : 'Actuate 450 Cusecs Boost'}
                </button>
              </div>

              {pumpResult && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <span>STATUS: {pumpResult.execution_status}</span>
                    <span>FLOW: {pumpResult.discharge_rate_achieved_cusecs} Cusecs</span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    <strong>SCADA ACK:</strong> {pumpResult.scada_ack_code}
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
