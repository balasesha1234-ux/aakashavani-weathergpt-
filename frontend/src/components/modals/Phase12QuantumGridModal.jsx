import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  Send, 
  Flame, 
  Building2, 
  Server, 
  KeyRound 
} from 'lucide-react';
import { 
  getPqcCryptoStatus, 
  getCriticalInfrastructureGrid, 
  dispatchPqcGridCommand 
} from '../../services/api';

export default function Phase12QuantumGridModal({ isOpen, onClose, district = 'Puri' }) {
  const [activeSubTab, setActiveSubTab] = useState('crypto'); // 'crypto' | 'grid' | 'command'

  // Crypto State
  const [cryptoData, setCryptoData] = useState(null);

  // Grid Matrix State
  const [gridFacilities, setGridFacilities] = useState([]);

  // Command State
  const [selectedFacility, setSelectedFacility] = useState('INFRA-POWER-GRID-PURI-01');
  const [commandResult, setCommandResult] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, district]);

  const loadAllData = async () => {
    try {
      const [crypto, grid] = await Promise.all([
        getPqcCryptoStatus(),
        getCriticalInfrastructureGrid()
      ]);
      if (crypto) setCryptoData(crypto);
      if (grid) setGridFacilities(grid);
    } catch (e) {
      console.error('Error loading Phase 12 data:', e);
    }
  };

  const handleDispatchCommand = async () => {
    setDispatching(true);
    try {
      const res = await dispatchPqcGridCommand(selectedFacility, 'ISOLATE_FEEDER_ARM_MICROGRID');
      if (res) setCommandResult(res);
    } catch (e) {
      console.error('Error dispatching PQC grid command:', e);
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
            <div className="p-2.5 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 12: Quantum-Resilient Disaster Infrastructure
                </h3>
                <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 px-2 py-0.5 rounded-full font-bold">
                  POST-QUANTUM CRYPTOGRAPHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NIST FIPS 203/204 ML-KEM/ML-DSA Lattice Cryptography & Critical Grid SCADA Islanding
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
            onClick={() => setActiveSubTab('crypto')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'crypto'
                ? 'bg-fuchsia-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="truncate">NIST PQC Lattice Engine</span>
          </button>

          <button
            onClick={() => setActiveSubTab('grid')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'grid'
                ? 'bg-fuchsia-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">Critical Grid Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('command')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'command'
                ? 'bg-fuchsia-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">PQC Islanding Dispatch</span>
          </button>
        </div>

        {/* SubTab 1: NIST PQC Engine */}
        {activeSubTab === 'crypto' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-fuchsia-400" />
                NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) Post-Quantum Cryptography
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Protects critical national early warning telemetry, siren triggers, and dam SCADA gates against "Harvest Now, Decrypt Later" quantum adversary decryption.
              </p>
            </div>

            {cryptoData && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-fuchsia-500/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-fuchsia-300 font-bold">STANDARD: {cryptoData.pqc_standard}</span>
                  <span className="text-emerald-400 font-bold">STATUS: {cryptoData.status}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1 text-slate-300">
                  <div><strong>Key Encapsulation:</strong> {cryptoData.key_exchange_algorithm}</div>
                  <div><strong>Digital Signature:</strong> {cryptoData.digital_signature_algorithm}</div>
                  <div><strong>Security Level:</strong> {cryptoData.lattice_security_level}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-sans">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400">Handshake Latency</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">{cryptoData.handshake_latency_ms} ms</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] text-slate-400">Quantum Resilience</div>
                    <div className="font-mono font-bold text-fuchsia-300 mt-0.5">&gt; {cryptoData.quantum_attack_resistance_years} Years</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: Critical Grid Matrix */}
        {activeSubTab === 'grid' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
                Critical Energy, Hydraulic & Healthcare Infrastructure Matrix
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated disaster hardening matrix continuously monitoring fuel autonomous hours and islanding readiness across high-risk coastal grids.
              </p>
            </div>

            <div className="space-y-3">
              {gridFacilities.map((fac, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fuchsia-400 font-mono">{fac.facility_id}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          {fac.status}
                        </span>
                      </div>
                      <h5 className="font-bold text-white mt-0.5">{fac.facility_name}</h5>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{fac.category}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">Resilience Rating</div>
                      <div className="font-mono text-white text-[11px] mt-0.5">{fac.cyclone_resilience_rating}</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">Islanding Mode</div>
                      <div className="font-mono text-cyan-300 text-[11px] mt-0.5">{fac.islanding_mode}</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400">Backup DG Fuel</div>
                      <div className="font-mono text-emerald-400 text-[11px] mt-0.5">{fac.backup_dg_fuel_hours} Hours</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubTab 3: PQC Islanding Command */}
        {activeSubTab === 'command' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" />
                Lattice-Signed SCADA Emergency Islanding Dispatch
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Issues authenticated ML-DSA-87 lattice signed remote trip and islanding signals to isolate substation busbars before cyclone gale winds cause cascading national grid blackout.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-fuchsia-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-fuchsia-500"
                >
                  <option value="INFRA-POWER-GRID-PURI-01">400kV Baliguda Grid Substation</option>
                  <option value="INFRA-DAM-RESERVOIR-HIRAKUD-02">Hirakud Reservoir Sluice Gates</option>
                  <option value="INFRA-HOSPITAL-ICU-DISTRICT-03">Puri DHH Hospital ICU Microgrid</option>
                </select>

                <button
                  onClick={handleDispatchCommand}
                  disabled={dispatching}
                  className="px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-fuchsia-950/50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {dispatching ? 'Dispatching...' : 'Dispatch PQC Islanding'}
                </button>
              </div>

              {commandResult && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <span>EXECUTION: {commandResult.execution_status}</span>
                    <span>LATENCY: {commandResult.failover_latency_ms} ms</span>
                  </div>

                  <div className="text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    <strong>PQC Signature:</strong> {commandResult.pqc_signature}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong>Actuator Response:</strong> {commandResult.scada_actuator_response}
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
