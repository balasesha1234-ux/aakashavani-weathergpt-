import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Radio, 
  Wifi, 
  BatteryCharging, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Activity, 
  FileText, 
  TrendingUp, 
  Droplets, 
  Sun, 
  Wind, 
  Zap, 
  DollarSign, 
  CheckCircle 
} from 'lucide-react';
import { 
  getCommunityAwsNodes, 
  getMicroclimateInterpolation, 
  getSmartContractAudit 
} from '../../services/api';

export default function Phase8EdgeMeshModal({ isOpen, onClose, district = 'Wardha' }) {
  const [activeSubTab, setActiveSubTab] = useState('mesh'); // 'mesh' | 'microclimate' | 'ledger'

  // Mesh State
  const [nodes, setNodes] = useState([]);

  // Microclimate State
  const [microclimateData, setMicroclimateData] = useState(null);

  // Smart Contract State
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [nodeList, micro, audit] = await Promise.all([
        getCommunityAwsNodes(district),
        getMicroclimateInterpolation(district),
        getSmartContractAudit(district)
      ]);
      if (nodeList) setNodes(nodeList);
      if (micro) setMicroclimateData(micro);
      if (audit) setAuditData(audit);
    } catch (e) {
      console.error('Error loading Phase 8 data:', e);
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
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 8: Decentralized Edge AWS Mesh & Smart Contracts
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  ZERO-TRUST AGROMET
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Community IoT Stations, 500m Field-Level Kriging & Parametric Crop Insurance Payout Ledger
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
            onClick={() => setActiveSubTab('mesh')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'mesh'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="truncate">Edge AWS Mesh Grid</span>
          </button>

          <button
            onClick={() => setActiveSubTab('microclimate')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'microclimate'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">500m Field Kriging</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'ledger'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">Smart Contract Payouts</span>
          </button>
        </div>

        {/* SubTab 1: Community AWS Mesh Grid */}
        {activeSubTab === 'mesh' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Community-Owned LoRaWAN Edge Automatic Weather Station Mesh
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Open-hardware ESP32 & Raspberry Pi solar stations deployed across village farms, broadcasting calibrated ultrasonic wind, soil moisture, and optical rainfall telemetry with Proof-of-Observation (PoO) cryptographic verification.
              </p>
            </div>

            <div className="space-y-3">
              {nodes.map((node, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">{node.node_id}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          {node.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-0.5">{node.location_name}</h5>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <BatteryCharging className="w-3.5 h-3.5" />
                        <span>{node.solar_battery_pct}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Wifi className="w-3.5 h-3.5" />
                        <span>{node.signal_rssi_dbm} dBm</span>
                      </div>
                    </div>
                  </div>

                  {/* Node Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Air Temp / RH</div>
                      <div className="font-mono font-bold text-white mt-0.5">{node.temperature_c}°C | {node.relative_humidity_pct}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Rain Rate</div>
                      <div className="font-mono font-bold text-cyan-400 mt-0.5">{node.rain_rate_mmh} mm/h</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Soil Moisture</div>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">{node.soil_moisture_vwc_pct}% VWC</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Solar Irradiance</div>
                      <div className="font-mono font-bold text-amber-400 mt-0.5">{node.solar_irradiance_wm2} W/m²</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span>Hardware: {node.hardware}</span>
                    <span className="text-amber-300/80">PoO Hash: {node.proof_of_observation_hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubTab 2: 500m Field-Level Microclimate Kriging */}
        {activeSubTab === 'microclimate' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Hyper-Local Ordinary Kriging Downscaling (500m x 500m)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Downscales 10km NWP forecast grids using real-time edge station observations combined with Digital Elevation Models (DEM) to resolve field-level agromet microclimates (R² = 0.942).
              </p>
            </div>

            {microclimateData && (
              <div className="space-y-3">
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-amber-300 uppercase">Target Farm Field:</span>
                      <h4 className="text-lg font-black text-white mt-0.5">{microclimateData.target_field_id}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 uppercase">Model Accuracy:</span>
                      <div className="text-base font-black text-emerald-300 font-mono">
                        R² = {microclimateData.confidence_metric_r2}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Field Temp</div>
                      <div className="text-base font-black text-white font-mono mt-0.5">
                        {microclimateData.microclimate?.field_temperature_c}°C
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Heat Index: {microclimateData.microclimate?.micro_heat_index_c}°C</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">VPD Stress</div>
                      <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                        {microclimateData.microclimate?.vapor_pressure_deficit_kpa} kPa
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Dew Point: {microclimateData.microclimate?.dew_point_c}°C</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Leaf Wetness</div>
                      <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                        {microclimateData.microclimate?.leaf_wetness_hours} hrs
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Continuous Dew</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Soil Moisture</div>
                      <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                        {microclimateData.microclimate?.field_soil_moisture_pct}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Root Zone Depth</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-200">Fungal Infection Vector: {microclimateData.microclimate?.fungal_infection_risk}</span>
                    <span className="font-mono text-slate-400">Lapse Rate: {microclimateData.topographic_lapse_rate_c_per_100m}°C / 100m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Smart Contract Payout Ledger */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Parametric PMFBY Crop Insurance Smart Contract Execution Ledger
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero-touch parametric crop insurance oracle executing automated instant disbursements directly into farmer bank accounts upon verified AWS node excess rainfall triggers.
              </p>
            </div>

            {auditData && (
              <div className="space-y-3">
                {/* Ledger Summary Stats */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Disbursed</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      ₹{auditData.total_disbursed_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Beneficiaries</div>
                    <div className="text-lg font-black text-white font-mono mt-0.5">
                      {auditData.beneficiary_farmers_count} Farmers
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                    <div className="text-[10px] text-amber-300 uppercase font-bold">Payout / Farmer</div>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                      ₹{auditData.average_payout_per_farmer_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono text-slate-300">
                  <div><strong>Contract:</strong> {auditData.contract_address}</div>
                  <div><strong>Trigger:</strong> {auditData.parametric_condition}</div>
                  <div><strong>Channel:</strong> {auditData.payout_channel}</div>
                </div>

                {/* Individual Disbursement Rows */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live DBT Disbursement Records:</span>
                  {auditData.recent_disbursements?.map((tx, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tx.beneficiary_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({tx.aadhaar_masked})</span>
                        </div>
                        <div className="text-[11px] text-amber-300/90 mt-0.5">{tx.claim_trigger}</div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-emerald-400 font-mono text-sm">+₹{tx.amount_inr?.toLocaleString('en-IN')}</span>
                        <div className="text-[10px] text-emerald-300 font-bold flex items-center justify-end gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{tx.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
