import React, { useState, useEffect } from 'react';
import { 
  X, 
  Waves, 
  ShieldAlert, 
  Radio, 
  Activity, 
  Compass, 
  Navigation, 
  CheckCircle2, 
  Anchor, 
  Thermometer, 
  Gauge, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getIncoisOceanBuoys, 
  getTsunamiWarningStatus, 
  getFishermenPfz 
} from '../../services/api';

export default function Phase11OceanBuoyModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('buoys'); // 'buoys' | 'tsunami' | 'pfz'

  // Buoy State
  const [buoys, setBuoys] = useState([]);

  // Tsunami State
  const [tsunamiData, setTsunamiData] = useState(null);

  // PFZ State
  const [pfzData, setPfzData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [buoyList, tsunami, pfz] = await Promise.all([
        getIncoisOceanBuoys(district),
        getTsunamiWarningStatus(),
        getFishermenPfz('Puri Fishing Harbor')
      ]);
      if (buoyList) setBuoys(buoyList);
      if (tsunami) setTsunamiData(tsunami);
      if (pfz) setPfzData(pfz);
    } catch (e) {
      console.error('Error loading Phase 11 data:', e);
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
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 11: INCOIS Ocean Buoys & Tsunami Warning
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full font-bold">
                  DEEP-OCEAN TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Moored OMNI Buoy Array, Deep-Sea BART Tsunami Wave Recorders & NavIC Fishermen Safety
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
            onClick={() => setActiveSubTab('buoys')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'buoys'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span className="truncate">OMNI Buoy Array</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tsunami')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'tsunami'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="truncate">Tsunami Early Warning</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pfz')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'pfz'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="truncate">NavIC Fishermen Safety</span>
          </button>
        </div>

        {/* SubTab 1: OMNI Buoy Array */}
        {activeSubTab === 'buoys' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <Waves className="w-3.5 h-3.5 text-teal-400" />
                INCOIS OMNI (Ocean Moored Buoy Network in Northern Bay of Bengal)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Measures subsurface Ocean Heat Content (OHC), sea surface temperature, and swell heights to quantify tropical cyclone rapid intensification fueling.
              </p>
            </div>

            <div className="space-y-3">
              {buoys.map((b, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-400 font-mono">{b.buoy_id}</span>
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                          {b.distance_offshore_km} km Offshore
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-0.5">{b.basin}</h5>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{b.satellite_telemetry_uplink}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400">Sea Surface Temp</div>
                      <div className="font-mono font-bold text-rose-400 mt-0.5">{b.sea_surface_temp_celsius}°C</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400">Ocean Heat Content</div>
                      <div className="font-mono font-bold text-amber-400 mt-0.5">{b.ocean_heat_content_kj_cm2} kJ/cm²</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400">Sig Wave Height</div>
                      <div className="font-mono font-bold text-cyan-400 mt-0.5">{b.significant_wave_height_meters} m</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400">Bottom Pressure</div>
                      <div className="font-mono font-bold text-teal-300 mt-0.5">{b.sea_bottom_pressure_hpa} hPa</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubTab 2: Tsunami Early Warning */}
        {activeSubTab === 'tsunami' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                Indian Tsunami Early Warning Center (ITEWC / INCOIS)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time acoustic bottom pressure recorder (BART/DART) network coupled to seismic triggers along the Andaman-Sumatra trench.
              </p>
            </div>

            {tsunamiData && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-teal-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-teal-300 uppercase">Tsunami Threat Status:</span>
                    <h4 className="text-xl font-black text-emerald-400 mt-0.5">{tsunamiData.tsunami_threat_level}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase">Estimated Travel Time:</span>
                    <div className="text-base font-black text-white font-mono">{tsunamiData.travel_time_to_puri_coast_minutes} Minutes</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Water Column Anomaly</div>
                    <div className="font-mono font-bold text-emerald-300 text-sm mt-0.5">+{tsunamiData.max_water_column_anomaly_cm} cm (Nominal)</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">BART Sensors Online</div>
                    <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{tsunamiData.bottom_pressure_recorders_online} Deep-Sea Units</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 pt-1 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Monitored Subduction Zones:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                    {tsunamiData.monitored_subduction_zones?.map((z, idx) => (
                      <li key={idx}>{z}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: NavIC Fishermen Safety */}
        {activeSubTab === 'pfz' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-teal-400" />
                High-Seas Fishermen Safety & NavIC S-Band Transponder Network
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monitors deep-sea motorized craft beyond 50 nautical miles with bidirectional satellite distress SOS beacons and cyclone evacuation return enforcement.
              </p>
            </div>

            {pfzData && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-4">
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Directive: {pfzData.sea_safety_directive}</span>
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">{pfzData.squall_wind_speed_knots}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">NavIC Transponders</div>
                    <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">{pfzData.navic_sos_transponders_registered} Boats</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Harbor Return Rate</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">{pfzData.boats_returned_to_harbor_pct}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
