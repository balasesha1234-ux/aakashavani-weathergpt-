import React, { useState, useEffect } from 'react';
import { 
  X, 
  Satellite, 
  Wind, 
  Waves, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp,
  Thermometer 
} from 'lucide-react';
import { 
  getInsatTelemetry, 
  getCycloneDvorakTracking, 
  getCoastalStormSurge 
} from '../../services/api';

export default function Phase7SatelliteSpaceModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('insat'); // 'insat' | 'dvorak' | 'surge'

  // INSAT State
  const [insatData, setInsatData] = useState(null);

  // Dvorak State
  const [dvorakData, setDvorakData] = useState(null);

  // Surge State
  const [surgeData, setSurgeData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [insat, dvorak, surge] = await Promise.all([
        getInsatTelemetry(district),
        getCycloneDvorakTracking(),
        getCoastalStormSurge(district)
      ]);
      if (insat) setInsatData(insat);
      if (dvorak) setDvorakData(dvorak);
      if (surge) setSurgeData(surge);
    } catch (e) {
      console.error('Error loading Phase 7 data:', e);
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
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 7: INSAT-3DS Space Satellite & Cyclone ADT Studio
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold">
                  SPACE-BORNE METEOROLOGY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geostationary Sounder Radiometry, Automated Dvorak Technique (ADT) & Coastal Inundation Hydrodynamics
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
            onClick={() => setActiveSubTab('insat')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'insat'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span className="truncate">INSAT-3DS Radiometer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dvorak')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'dvorak'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="truncate">Cyclone ADT Eye-Tracker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('surge')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'surge'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span className="truncate">Storm Surge Modeler</span>
          </button>
        </div>

        {/* SubTab 1: INSAT-3DS Radiometer & Sounder */}
        {activeSubTab === 'insat' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                ISRO / MoES INSAT-3DS Geostationary Sounder Telemetry
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct downlinked 19-channel infrared sounder and 6-channel multi-spectral imager stationed at <strong>74°E Orbital Slot</strong>, measuring deep convective cloud top brightness temperatures.
              </p>
            </div>

            {insatData && (
              <div className="space-y-3">
                {/* Physical Radiometry Banner */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Outgoing Longwave (OLR)</div>
                    <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                      {insatData.outgoing_longwave_radiation_w_m2 || 142.0} W/m²
                    </div>
                    <div className="text-[10px] text-rose-300/80 mt-0.5">Deep Convection &lt; 160</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Cloud Top Temp</div>
                    <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                      {insatData.convective_cloud_top_temp_celsius || -68.5}°C
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tropopause Penetration</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Atm Motion Vectors</div>
                    <div className="text-lg font-black text-teal-300 font-mono mt-0.5">
                      {insatData.atmospheric_motion_vectors_knots || 48.0} kts
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Upper Level Jet Shear</div>
                  </div>
                </div>

                {/* Multi-Channel Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {insatData.channels?.map((ch, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                      <span className="font-bold text-cyan-300 font-mono">{ch.channel_name ? ch.channel_name.split(' ')[0] : 'CH'}</span>
                      <p className="text-[11px] text-slate-300 font-medium">{ch.channel_name}</p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        {ch.brightness_temp_kelvin && <div>Brightness: <strong className="text-white font-mono">{ch.brightness_temp_kelvin} K</strong></div>}
                        {ch.cloud_top_height_km && <div>Height: <strong className="text-white font-mono">{ch.cloud_top_height_km} km</strong></div>}
                        {ch.upper_tropospheric_humidity_pct && <div>Humidity: <strong className="text-white font-mono">{ch.upper_tropospheric_humidity_pct}%</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: Automated Dvorak Technique (ADT) */}
        {activeSubTab === 'dvorak' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Advanced Objective Dvorak Technique (AODT / ADT)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Objective satellite infrared algorithm calculating cyclone central pressure deficit, eye temperature anomaly, and maximum sustained surface wind speeds.
              </p>
            </div>

            {dvorakData && (
              <div className="space-y-3">
                {/* ADT Primary Cards */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-cyan-300 uppercase">Cyclone Intensity Number:</span>
                      <h4 className="text-2xl font-black text-white mt-0.5">
                        T{dvorakData.adt_final_t_number || '5.5'} / CI {dvorakData.current_intensity_ci || '5.5'}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400 uppercase">Estimated Vmax:</span>
                      <div className="text-xl font-black text-rose-400 font-mono">
                        {dvorakData.estimated_vmax_knots || 102} kts ({dvorakData.estimated_vmax_kmh || 188.9} km/h)
                      </div>
                    </div>
                  </div>

                  {/* Pressure Deficit & Eyewall Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Central Pressure</div>
                      <div className="text-base font-black text-white font-mono mt-0.5">
                        {dvorakData.central_pressure_hpa || 962.0} hPa
                      </div>
                      <div className="text-[10px] text-rose-400 mt-0.5">
                        Pressure Deficit: -{dvorakData.pressure_deficit_hpa || 46.0} hPa
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Eye Diameter</div>
                      <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                        {dvorakData.eye_structure?.eye_diameter_km || 28.5} km
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        RMW: {dvorakData.eye_structure?.radius_of_maximum_winds_rmw_km || 32.0} km
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Eye Temp Delta</div>
                      <div className="text-base font-black text-amber-300 font-mono mt-0.5">
                        +{dvorakData.eye_structure?.eye_temp_celsius || 14.2}°C
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Warm Core Anomaly</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Coastal Storm Surge Modeler */}
        {activeSubTab === 'surge' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                Hydrodynamic Astronomical Tide + Storm Surge Superposition
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hydrodynamic tidal superposition computing peak sea level rise over astronomical high-tide, calculating coastal embankment breach zones and inland inundation extent.
              </p>
            </div>

            {surgeData && (
              <div className="p-5 rounded-2xl bg-[#090D16] border border-cyan-500/30 space-y-4">
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Astronomical Tide</div>
                    <div className="text-lg font-black text-white font-mono mt-0.5">
                      +{surgeData.astronomical_tide_meters || 1.85} m
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Storm Surge Height</div>
                    <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                      +{surgeData.peak_storm_surge_meters || 3.40} m
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30">
                    <div className="text-[10px] text-rose-300 uppercase font-bold">Total Sea Height</div>
                    <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                      {surgeData.total_water_level_superposition_meters || 5.25} m
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-rose-200">
                      Embankment Risk: {surgeData.coastal_embankment_overtopping_risk || 'CRITICAL_OVERTOPPING'}
                    </span>
                  </div>
                  <span className="font-mono text-rose-300 font-bold">
                    Inland Reach: {surgeData.inundation_extent_inland_km || 2.4} km
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">High-Risk Estuarine Breach Corridors:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    {surgeData.vulnerable_estuaries?.map((est, i) => (
                      <li key={i} className="font-medium">{est}</li>
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
