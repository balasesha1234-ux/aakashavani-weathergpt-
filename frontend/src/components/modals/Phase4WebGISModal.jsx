import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Radio, 
  Clock, 
  Download, 
  Play, 
  Pause, 
  CheckCircle2, 
  Compass, 
  FileText 
} from 'lucide-react';
import { 
  getDwrRadarStations, 
  getConvectiveNowcastTimeline, 
  exportGisGeoJson 
} from '../../services/api';

export default function Phase4WebGISModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('radar_network');

  // Radar Network State
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);

  // Nowcast State
  const [timeline, setTimeline] = useState(null);
  const [activeStepIdx, setActiveStepIdx] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);

  // GeoJSON Export State
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStations();
      loadTimeline();
    }
  }, [isOpen, district]);

  useEffect(() => {
    let interval;
    if (isPlaying && timeline && Array.isArray(timeline.frames) && timeline.frames.length > 0) {
      interval = setInterval(() => {
        setActiveStepIdx((prev) => (prev + 1) % timeline.frames.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeline]);

  const loadStations = async () => {
    setLoadingStations(true);
    try {
      const data = await getDwrRadarStations();
      if (Array.isArray(data)) {
        setStations(data);
      }
    } catch (e) {
      console.error('Error loading DWR stations:', e);
    } finally {
      setLoadingStations(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const data = await getConvectiveNowcastTimeline(district);
      if (data && Array.isArray(data.frames)) {
        setTimeline(data);
      }
    } catch (e) {
      console.error('Error loading timeline:', e);
    }
  };

  const loadGeoJson = async () => {
    try {
      const data = await exportGisGeoJson(district);
      if (data) {
        setGeoJsonData(data);
      }
    } catch (e) {
      console.error('Error loading GeoJSON:', e);
    }
  };

  const handleDownloadGeoJson = () => {
    if (!geoJsonData) return;
    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AakashaVani_WebGIS_${district}_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const currentFrame = (timeline && Array.isArray(timeline.frames) && timeline.frames[activeStepIdx]) 
    ? timeline.frames[activeStepIdx] 
    : {
        step: "NOW",
        label: "Live Scan (T0)",
        max_dbz: 55.0,
        estimated_rain_rate_mmh: 36.5,
        centroid_lat: 19.81,
        centroid_lon: 85.83
      };

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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 4: WebGIS Studio & Doppler Radar Nowcasting
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full font-bold">
                  RADAR STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                39 IMD Doppler Radar Network, Convective Nowcast Vector Animator & Standardized GeoJSON Exporter
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
            onClick={() => setActiveSubTab('radar_network')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'radar_network'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="truncate">39 Doppler Radars</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nowcast')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'nowcast'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">Nowcast Animator</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('export');
              if (!geoJsonData) loadGeoJson();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'export'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate">GeoJSON Exporter</span>
          </button>
        </div>

        {/* SubTab 1: 39 Doppler Radar Stations */}
        {activeSubTab === 'radar_network' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                Live IMD Doppler Weather Radar (DWR) Telemetry Grid
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct integration with India's 39 operational S-Band, C-Band, and X-Band Doppler radars delivering dual-polarization reflectivity (Z) and radial velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stations.map((st, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-400 font-mono">{st.station_id}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      OPERATIONAL
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white">{st.name}</h5>
                    <p className="text-[11px] text-slate-400">{st.band}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Reflectivity:</span>
                      <div className="font-bold text-white font-mono">{st.peak_reflectivity_dbz} dBZ</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Max Wind:</span>
                      <div className="font-bold text-white font-mono">{st.max_wind_velocity_knots} kts</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubTab 2: Convective Nowcasting 5-Step Player */}
        {activeSubTab === 'nowcast' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Optical Flow Convective Nowcast Timeline
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extrapolates radar echo centroids using semi-Lagrangian advection and optical flow to project precipitation tracks up to <strong>+60 minutes</strong> into the future.
              </p>
            </div>

            {/* Nowcast Player Card */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-teal-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-300 uppercase">Active Nowcast Frame:</span>
                  <h4 className="text-xl font-black text-white mt-0.5">{currentFrame.label}</h4>
                </div>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isPlaying 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-teal-500 text-slate-950 font-black hover:bg-teal-400'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause Animation' : 'Auto-Play Loop'}
                </button>
              </div>

              {/* 5 Step Scrubber Buttons */}
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                {timeline?.frames?.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveStepIdx(idx);
                      setIsPlaying(false);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition ${
                      activeStepIdx === idx
                        ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.step}
                  </button>
                ))}
              </div>

              {/* Convective Metrics for Frame */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Max Reflectivity</div>
                  <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                    {currentFrame.max_dbz} dBZ
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Convective Core</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Rainfall Intensity</div>
                  <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                    {currentFrame.estimated_rain_rate_mmh} mm/h
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Marshall-Palmer Z-R</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Storm Motion</div>
                  <div className="text-lg font-black text-teal-300 font-mono mt-0.5 flex items-center justify-center gap-1">
                    <Compass className="w-4 h-4 text-teal-400" />
                    42.5° @ 26 km/h
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">NE Advection Vector</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SubTab 3: Standardized GeoJSON Exporter */}
        {activeSubTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                RFC 7946 Standardized GeoJSON Package Exporter
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Export verified disaster geofence polygons, cyclone shelter point features, and hospital coordinates as standards-compliant GeoJSON for QGIS, ArcGIS, and government disaster control room systems.
              </p>
            </div>

            {geoJsonData && (
              <div className="p-4 rounded-2xl bg-[#090D16] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-teal-400 font-mono">
                    Features: {geoJsonData.features?.length} Layers Included (WGS 84)
                  </span>
                  <button
                    onClick={handleDownloadGeoJson}
                    className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .geojson File
                  </button>
                </div>

                <pre className="text-xs text-emerald-400 font-mono bg-black/60 p-3 rounded-xl max-h-56 overflow-y-auto border border-white/5">
                  {JSON.stringify(geoJsonData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
