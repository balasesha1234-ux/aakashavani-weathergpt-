import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Volume2, 
  BatteryCharging, 
  Plane, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  FileText, 
  Activity, 
  Cpu,
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';
import { 
  getVillageSirenNodes, 
  triggerVillageSiren, 
  runDroneSpectralSurvey, 
  getNdmaCapFeed 
} from '../../services/api';

export default function Phase3DroneSirenModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('siren'); // 'siren' | 'drone' | 'cap'
  
  // Siren State
  const [nodes, setNodes] = useState([]);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [hazardType, setHazardType] = useState('CYCLONE');
  const [sirenPattern, setSirenPattern] = useState('EVACUATION_WAIL');
  const [sirenResult, setSirenResult] = useState(null);
  const [triggeringSiren, setTriggeringSiren] = useState(false);

  // Drone State
  const [surveyHectares, setSurveyHectares] = useState(150);
  const [surveying, setSurveying] = useState(false);
  const [droneResult, setDroneResult] = useState(null);

  // NDMA CAP State
  const [capData, setCapData] = useState(null);
  const [loadingCap, setLoadingCap] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSirenNodes();
    }
  }, [isOpen, district]);

  const loadSirenNodes = async () => {
    setLoadingNodes(true);
    try {
      const data = await getVillageSirenNodes(district);
      setNodes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNodes(false);
    }
  };

  const handleTriggerSiren = async () => {
    setTriggeringSiren(true);
    setSirenResult(null);
    try {
      const res = await triggerVillageSiren(district, hazardType, sirenPattern);
      setSirenResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTriggeringSiren(false);
    }
  };

  const handleLaunchDrone = async () => {
    setSurveying(true);
    setDroneResult(null);
    try {
      const res = await runDroneSpectralSurvey(district, surveyHectares);
      setDroneResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSurveying(false);
    }
  };

  const handleLoadCap = async () => {
    setLoadingCap(true);
    try {
      const res = await getNdmaCapFeed(district);
      setCapData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCap(false);
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
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 3: Autonomous Village IoT & Drone Resilience
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                  AUTONOMOUS GRID
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Solar Gram Panchayat Sirens, Autonomous Drone Spectral Damage Surveys & NDMA Direct CAP Feed
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
            onClick={() => setActiveSubTab('siren')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'siren'
                ? 'bg-indigo-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="truncate">Village Solar Sirens</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('drone');
              if (!droneResult) handleLaunchDrone();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'drone'
                ? 'bg-indigo-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span className="truncate">Drone Spectral Survey</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('cap');
              if (!capData) handleLoadCap();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'cap'
                ? 'bg-indigo-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate">NDMA CAP Protocol</span>
          </button>
        </div>

        {/* SubTab 1: Village Solar Sirens & Loudspeakers */}
        {activeSubTab === 'siren' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Solar-Powered Gram Panchayat Siren Mesh
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Autonomous 135 dB siren nodes and public address loudspeakers deployed at village panchayats. Activated automatically when NDMA issues an official CAP Red Alert.
              </p>
            </div>

            {/* Siren Node Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nodes.map((node, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-400">{node.node_id}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                      <BatteryCharging className="w-3.5 h-3.5" />
                      {node.solar_battery_pct}%
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">{node.village}</h5>
                  <div className="text-[11px] text-slate-400">
                    Output: <strong className="text-slate-200">{node.decibel_rating}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Siren Trigger Controls */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Emergency Hazard Type</label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium outline-none focus:border-indigo-400"
                  >
                    <option value="CYCLONE">Severe Cyclone Warning</option>
                    <option value="FLOOD">Riverine Flash Flood</option>
                    <option value="THUNDERSTORM">Severe Lightning & Squall</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Acoustic Siren Wail Pattern</label>
                  <select
                    value={sirenPattern}
                    onChange={(e) => setSirenPattern(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium outline-none focus:border-indigo-400"
                  >
                    <option value="EVACUATION_WAIL">Continuous 3-Minute Evacuation Wail</option>
                    <option value="ALL_CLEAR_STEADY">Steady 1-Minute All-Clear Tone</option>
                    <option value="INTERMITTENT_ALERT">Intermittent 15s Bursts</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleTriggerSiren}
                disabled={triggeringSiren}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
              >
                <Radio className={`w-4 h-4 ${triggeringSiren ? 'animate-spin' : ''}`} />
                {triggeringSiren ? 'Broadcasting to LoRaWAN Mesh...' : 'Broadcast Emergency Siren & PA Loudspeaker'}
              </button>
            </div>

            {sirenResult && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/50 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    SIREN ACTIVATION BROADCAST SENT
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    Relay: {sirenResult.relay_protocol}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    Gram Panchayat Public Address Script:
                  </span>
                  <p className="text-xs text-rose-200 leading-relaxed font-sans italic">
                    "{sirenResult.loudspeaker_audio_script}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: Autonomous Drone Multi-Spectral Survey */}
        {activeSubTab === 'drone' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Plane className="w-3.5 h-3.5 text-indigo-400" />
                Autonomous Drone Multi-Spectral Damage Assessment
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deploy autonomous hexacopter missions with RTK-GPS to compute post-hazard <strong>NDVI</strong> (Vegetation Health Index) and <strong>NDWI</strong> (Water Inundation Index) for automated PMFBY claim settlement.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-slate-400">Survey Area Grid Size</label>
                <div className="text-sm font-bold text-white">{surveyHectares} Hectares (~370 Acres)</div>
              </div>
              <button
                onClick={handleLaunchDrone}
                disabled={surveying}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg"
              >
                <Play className={`w-4 h-4 ${surveying ? 'animate-spin' : ''}`} />
                {surveying ? 'Processing Orthomosaic...' : 'Re-Run Drone Survey'}
              </button>
            </div>

            {droneResult && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-indigo-300 border-b border-white/5 pb-2">
                  <span className="font-bold">🛸 Mission Results: {droneResult.drone_model}</span>
                  <span className="font-mono text-[11px] text-slate-400">Alt: {droneResult.flight_altitude_m}m • Res: {droneResult.optical_resolution_cm_per_pixel} cm/px</span>
                </div>

                {/* 3 Metric Chips */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Vegetation Loss</div>
                    <div className="text-base sm:text-lg font-black text-rose-400 mt-0.5">
                      -{droneResult.spectral_indices.vegetation_loss_pct}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">NDVI: {droneResult.spectral_indices.ndvi_mean}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Submerged Land</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 mt-0.5">
                      {droneResult.spectral_indices.submerged_farmland_hectares} ha
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">NDWI: {droneResult.spectral_indices.ndwi_mean_water_index}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">PMFBY Status</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                      CERTIFIED
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Automated Loss Report</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: NDMA Common Alerting Protocol (CAP-CP) Feed */}
        {activeSubTab === 'cap' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                NDMA Standardized CAP-CP Protocol Bridge
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct integration with the National Disaster Management Authority (NDMA) OASIS Common Alerting Protocol v1.2 specification for nationwide multi-hazard early warnings.
              </p>
            </div>

            {capData && (
              <div className="p-4 rounded-2xl bg-[#090D16] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono text-cyan-400 font-bold">{capData.identifier}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase">
                    {capData.info?.severity} Severity
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-200">
                  <div className="font-bold text-white">{capData.info?.headline}</div>
                  <p className="text-slate-400 leading-relaxed">{capData.info?.description}</p>
                  <div className="pt-2 text-[11px] font-mono text-indigo-300">
                    Geographic Boundary: <strong>{capData.info?.area?.polygon}</strong>
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
