import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  WifiOff, 
  Zap, 
  Activity, 
  Volume2, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  FileCode, 
  HardDrive 
} from 'lucide-react';
import { 
  getOfflineEdgeModels, 
  runOfflineEdgeInference 
} from '../../services/api';

export default function Phase9OfflineAIModal({ isOpen, onClose, district = 'Wardha' }) {
  const [activeSubTab, setActiveSubTab] = useState('models'); // 'models' | 'infer' | 'voice'

  // Model Catalog State
  const [models, setModels] = useState([]);

  // Inference Simulator State
  const [query, setQuery] = useState('Can I spray pesticide on cotton today?');
  const [inferResult, setInferResult] = useState(null);
  const [inferring, setInferring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadModels();
      executeInference();
    }
  }, [isOpen, district]);

  const loadModels = async () => {
    try {
      const data = await getOfflineEdgeModels();
      if (data) setModels(data);
    } catch (e) {
      console.error('Error loading offline models:', e);
    }
  };

  const executeInference = async () => {
    setInferring(true);
    try {
      const res = await runOfflineEdgeInference(district, query);
      if (res) setInferResult(res);
    } catch (e) {
      console.error('Error running offline inference:', e);
    } finally {
      setInferring(false);
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
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 9: Offline Embedded Edge-AI & SLM Studio
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  ZERO-INTERNET ON-DEVICE AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Quantized GGUF/ONNX Small Language Models, 32 tok/s NPU Profiling & Local Voice Synthesis
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
            onClick={() => setActiveSubTab('models')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'models'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span className="truncate">Quantized SLM Models</span>
          </button>

          <button
            onClick={() => setActiveSubTab('infer')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'infer'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="truncate">Zero-Net SLM Runner</span>
          </button>

          <button
            onClick={() => setActiveSubTab('voice')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'voice'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="truncate">On-Chip Voice Audio</span>
          </button>
        </div>

        {/* SubTab 1: Quantized Models Catalog */}
        {activeSubTab === 'models' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Ultra-Lightweight Embedded Edge Models (GGUF / ONNX)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pre-loaded on village solar towers and Panchayat Raspberry Pi / NPU boards to provide 100% uninterrupted offline intelligence during complete fiber cuts and cyclone power grid collapse.
              </p>
            </div>

            <div className="space-y-3">
              {models.map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono">{m.model_id}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          {m.quantization_type}
                        </span>
                      </div>
                      <h5 className="text-[11px] text-slate-300 mt-0.5">Target: {m.target_hardware}</h5>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>RAM: <strong className="text-white">{m.ram_usage_mb} MB</strong></span>
                      <span>Speed: <strong className="text-emerald-400">{m.inference_speed_tok_s} tok/s</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.capabilities?.map((cap, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-950 border border-white/10 px-2 py-0.5 rounded-md text-slate-300 font-medium">
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SubTab 2: Zero-Internet SLM Runner */}
        {activeSubTab === 'infer' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live On-Chip Inference Engine Simulator
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Executes prompt completions directly inside the local edge NPU hardware without sending any packets to external cloud APIs or telecom backhauls.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  placeholder="Enter agromet question..."
                />
                <button
                  onClick={executeInference}
                  disabled={inferring}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {inferring ? 'Inferring...' : 'Run Offline'}
                </button>
              </div>

              {inferResult && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                    <span className="text-emerald-300 font-bold">DEVICE: {inferResult.execution_device}</span>
                    <span>LATENCY: {inferResult.inference_latency_ms} ms</span>
                  </div>

                  <div className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5 font-sans text-xs">
                    {inferResult.response_text}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-center text-slate-400 pt-1">
                    <div>Tokens: <strong className="text-white font-mono">{inferResult.tokens_generated}</strong></div>
                    <div>Speed: <strong className="text-emerald-400 font-mono">{inferResult.tokens_per_second} tok/s</strong></div>
                    <div>Mode: <strong className="text-cyan-300 font-mono">100% Offline</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SubTab 3: On-Chip Voice Audio */}
        {activeSubTab === 'voice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                On-Chip Piper TTS & Whisper Voice Pipeline
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Converts generated agromet text into natural localized spoken audio waveforms (WAV) directly on edge microcontroller chips to drive 135dB solar PA loudspeakers across village squares.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#090D16] border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase">Voice Synthesizer:</span>
                  <h4 className="text-base font-bold text-white mt-0.5">Piper-TTS Fast Indian Rural Vocoder</h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-mono font-bold">
                  22.05 kHz 16-bit Mono
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>"कपास पर कीटनाशक छिड़काव 4:00 बजे से पहले सुरक्षित है..."</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">AUDIO READY</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-400">Audio Latency</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">18.4 ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-400">Flash Footprint</div>
                  <div className="font-mono font-bold text-white mt-0.5">28.5 MB</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-400">PA Output</div>
                  <div className="font-mono font-bold text-amber-400 mt-0.5">135 dB PA</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
