import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  PhoneIncoming, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Volume2, 
  Send, 
  CheckCircle2, 
  Percent, 
  AlertTriangle, 
  Layers, 
  Play, 
  Clock 
} from 'lucide-react';
import { triggerMissedCall, generateWhatsAppBroadcast, getPmfbyRiskAssessment } from '../../services/api';

export default function Phase2TelecomModal({ isOpen, onClose, district = 'Wardha', currentLang = 'hi' }) {
  const [activeSubTab, setActiveSubTab] = useState('missed_call'); // 'missed_call' | 'whatsapp' | 'pmfby'

  // Missed Call State
  const [phone, setPhone] = useState('+919876543210');
  const [calling, setCalling] = useState(false);
  const [missedCallResult, setMissedCallResult] = useState(null);

  // WhatsApp State
  const [crop, setCrop] = useState('Cotton');
  const [generatingWa, setGeneratingWa] = useState(false);
  const [waResult, setWaResult] = useState(null);

  // PMFBY State
  const [pmfbyCrop, setPmfbyCrop] = useState('Cotton');
  const [rainfallAnomaly, setRainfallAnomaly] = useState(65);
  const [drySpell, setDrySpell] = useState(4);
  const [pmfbyResult, setPmfbyResult] = useState(null);
  const [evaluatingPmfby, setEvaluatingPmfby] = useState(false);

  if (!isOpen) return null;

  const handleMissedCall = async () => {
    setCalling(true);
    setMissedCallResult(null);
    try {
      const res = await triggerMissedCall(phone, district, currentLang);
      setMissedCallResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCalling(false);
    }
  };

  const handleGenerateWhatsApp = async () => {
    setGeneratingWa(true);
    setWaResult(null);
    try {
      const res = await generateWhatsAppBroadcast(district, crop, currentLang);
      setWaResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingWa(false);
    }
  };

  const handleEvaluatePmfby = async () => {
    setEvaluatingPmfby(true);
    try {
      const res = await getPmfbyRiskAssessment(pmfbyCrop, rainfallAnomaly, drySpell);
      setPmfbyResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingPmfby(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="glass-panel app-modal-container w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 2: Telecom & Multi-Channel Scaling
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold">
                  LIVE ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                National Carrier Missed-Call Auto-Dialers, WhatsApp Enterprise Voice & PMFBY Crop Risk
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
            onClick={() => setActiveSubTab('missed_call')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'missed_call'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneIncoming className="w-3.5 h-3.5" />
            <span className="truncate">Missed Call Dialer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'whatsapp'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="truncate">WhatsApp Voice Note</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('pmfby');
              if (!pmfbyResult) handleEvaluatePmfby();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'pmfby'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">PMFBY Insurance</span>
          </button>
        </div>

        {/* SubTab 1: 1800-WEATHER Missed Call Auto-Dialer */}
        {activeSubTab === 'missed_call' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Cost Vernacular Voice Callback Loop
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Non-literate farmers give a missed call to <strong>1800-WEATHER</strong>. The carrier automatically disconnects and the AI telecommunication engine calls back in <strong>3 seconds</strong> with high-clarity synthesized regional voice weather & crop advisories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Caller Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">District & Telemetry Cell</label>
                <input
                  type="text"
                  disabled
                  value={`${district} (Cell ID: AP-702)`}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleMissedCall}
              disabled={calling}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <PhoneIncoming className={`w-4 h-4 ${calling ? 'animate-spin' : ''}`} />
              {calling ? 'Triggering Carrier Relay...' : 'Simulate 1800-WEATHER Missed Call'}
            </button>

            {missedCallResult && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Incoming Carrier Callback Ringing...
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300">
                    Cost: {missedCallResult.cost_to_farmer}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      Spoken Telephony Audio Stream ({missedCallResult.language.toUpperCase()})
                    </span>
                    <span className="font-mono text-slate-500">{missedCallResult.telecom_carrier}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed italic">
                    "{missedCallResult.audio_script}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: WhatsApp Enterprise Voice Note Broadcast */}
        {activeSubTab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Village WhatsApp Broadcast Dispatcher
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated multi-spectral agromet bulletin cards dispatched to Gram Panchayat farmer groups with one-touch audio note attachments and interactive reply triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Target Crop Type</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
                >
                  <option value="Cotton">Cotton (कपास / పత్తి)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Paddy">Paddy / Rice (धान / వరి)</option>
                  <option value="Groundnut">Groundnut (मूंगफली / వేరుశనగ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Panchayat Recipient Group</label>
                <input
                  type="text"
                  disabled
                  value={`Kisan_Panchayat_${district}`}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateWhatsApp}
              disabled={generatingWa}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <Send className="w-4 h-4" />
              {generatingWa ? 'Compiling Broadcast Card...' : 'Generate Verified WhatsApp Card'}
            </button>

            {waResult && (
              <div className="p-4 rounded-2xl bg-[#0B141A] border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-white/5 pb-2">
                  <span>📱 WhatsApp Enterprise Payload</span>
                  <span className="text-[10px] text-slate-400 font-normal">Encrypted Dispatched</span>
                </div>

                <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed bg-[#111B21] p-3 rounded-xl border border-white/5">
                  {waResult.card_text}
                </pre>

                <div className="flex flex-wrap gap-2 pt-1">
                  {waResult.interactive_buttons?.map((btn, i) => (
                    <button
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942] text-cyan-400 font-bold text-xs transition"
                    >
                      {btn.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: PMFBY Weather-Index Crop Insurance Calculator */}
        {activeSubTab === 'pmfby' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                PM-Fasal Bima Yojana (WBCIS) Automatic Trigger Calculator
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates automatic claim eligibility under the Weather-Based Crop Insurance Scheme (WBCIS) based on localized rainfall anomaly and consecutive dry spell telemetry.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Rainfall Anomaly (% Departure from Normal)</span>
                  <span className="text-cyan-400 font-mono font-bold">+{rainfallAnomaly}%</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="120"
                  value={rainfallAnomaly}
                  onChange={(e) => {
                    setRainfallAnomaly(Number(e.target.value));
                    handleEvaluatePmfby();
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Consecutive Dry Spell (Days without rain)</span>
                  <span className="text-amber-400 font-mono font-bold">{drySpell} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={drySpell}
                  onChange={(e) => {
                    setDrySpell(Number(e.target.value));
                    handleEvaluatePmfby();
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {pmfbyResult && (
              <div className={`p-4 rounded-2xl border space-y-3 ${
                pmfbyResult.automatic_claim_trigger
                  ? 'bg-rose-950/30 border-rose-500/50'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      pmfbyResult.automatic_claim_trigger ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                    }`}></span>
                    <span className="text-xs font-bold text-white uppercase">
                      Claim Eligibility: {pmfbyResult.automatic_claim_trigger ? 'AUTOMATIC CLAIM TRIGGERED' : 'STANDARD WATCH'}
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono text-cyan-300">
                    Payout Index: {pmfbyResult.estimated_payout_index}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {pmfbyResult.advisory}
                </p>

                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Framework: {pmfbyResult.scheme}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
