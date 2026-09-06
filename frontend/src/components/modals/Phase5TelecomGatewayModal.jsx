import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Radio, 
  Send, 
  PhoneCall, 
  MessageSquare, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Terminal, 
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { 
  sendUssdSession, 
  sendCarrierSmsWebhook, 
  getCarrierVoiceXml, 
  relayMeshPacket 
} from '../../services/api';

export default function Phase5TelecomGatewayModal({ isOpen, onClose, district = 'Wardha' }) {
  const [activeSubTab, setActiveSubTab] = useState('ussd'); // 'ussd' | 'webhooks' | 'mesh'

  // USSD Simulator State
  const [ussdInput, setUssdInput] = useState('*180#');
  const [ussdScreen, setUssdScreen] = useState('Dial *180# to initiate 2G USSD session.');
  const [ussdSessionId, setUssdSessionId] = useState('USSD-SESS-9821');
  const [ussdIsTerminal, setUssdIsTerminal] = useState(false);
  const [loadingUssd, setLoadingUssd] = useState(false);

  // Webhooks State
  const [webhookPhone, setWebhookPhone] = useState('+919876543210');
  const [webhookSmsBody, setWebhookSmsBody] = useState(`MAUSAM ${district.toUpperCase()}`);
  const [smsWebhookResult, setSmsWebhookResult] = useState(null);
  const [voiceXmlResult, setVoiceXmlResult] = useState(null);
  const [loadingWebhook, setLoadingWebhook] = useState(false);

  // LoRaWAN Mesh State
  const [meshPacketId, setMeshPacketId] = useState('PKT-LORA-882');
  const [meshResult, setMeshResult] = useState(null);
  const [loadingMesh, setLoadingMesh] = useState(false);

  const handleUssdSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoadingUssd(true);
    try {
      const data = await sendUssdSession(ussdSessionId, '+919876543210', ussdInput, district);
      if (data) {
        setUssdScreen(data.screen_text || 'No response');
        setUssdIsTerminal(Boolean(data.is_terminal));
        if (data.is_terminal) {
          setUssdInput('*180#');
        } else {
          setUssdInput('');
        }
      }
    } catch (err) {
      console.error(err);
      setUssdScreen('USSD Connection Timed Out. Network Busy.');
    } finally {
      setLoadingUssd(false);
    }
  };

  const handleSendSmsWebhook = async () => {
    setLoadingWebhook(true);
    try {
      const res = await sendCarrierSmsWebhook(webhookPhone, webhookSmsBody);
      setSmsWebhookResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWebhook(false);
    }
  };

  const handleFetchVoiceXml = async () => {
    setLoadingWebhook(true);
    try {
      const res = await getCarrierVoiceXml(district, 'hi');
      setVoiceXmlResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWebhook(false);
    }
  };

  const handleRelayMeshPacket = async () => {
    setLoadingMesh(true);
    try {
      const res = await relayMeshPacket(meshPacketId, `LORA-NODE-${district.toUpperCase()}-01`, 64);
      setMeshResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMesh(false);
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
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Phase 5: Telecom Gateway & USSD Interactive Engine
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  TELECOM GATEWAY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive USSD (*180#) Engine, Carrier Webhooks (Twilio/Exotel) & LoRaWAN Delay-Tolerant Mesh Relay
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
            onClick={() => setActiveSubTab('ussd')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'ussd'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">USSD (*180#) Phone</span>
          </button>

          <button
            onClick={() => setActiveSubTab('webhooks')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'webhooks'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate">Carrier Webhooks</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mesh')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'mesh'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="truncate">LoRaWAN Mesh Relay</span>
          </button>
        </div>

        {/* SubTab 1: USSD Feature Phone Simulator */}
        {activeSubTab === 'ussd' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                Unstructured Supplementary Service Data (USSD *180#) Simulator
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero-internet, zero-app GSM session protocol providing instantaneous interactive weather and disaster menus to millions of basic 2G feature phones across rural India.
              </p>
            </div>

            {/* Vintage Feature Phone Frame */}
            <div className="max-w-md mx-auto p-5 rounded-3xl bg-slate-950 border-2 border-slate-700 shadow-2xl space-y-4">
              
              {/* LCD Screen Display */}
              <div className="p-4 rounded-2xl bg-[#98A886] text-[#121B0E] font-mono text-xs font-bold border-2 border-[#768468] shadow-inner min-h-[140px] flex flex-col justify-between">
                <div className="whitespace-pre-line leading-snug">
                  {ussdScreen}
                </div>
                <div className="text-[10px] text-[#34402C] border-t border-[#768468]/40 pt-1 mt-2 flex justify-between">
                  <span>GSM 2G | VoLTE</span>
                  <span>{ussdIsTerminal ? 'SESSION END' : 'INPUT ACTIVE'}</span>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleUssdSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={ussdInput}
                  onChange={(e) => setUssdInput(e.target.value)}
                  placeholder="Enter 1-4 or *180#"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={loadingUssd}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loadingUssd ? 'Sending...' : 'Send'}
                </button>
              </form>

              {/* Quick Dial Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['*180#', '1', '2', '3'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      setUssdInput(btn);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition border border-white/5"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SubTab 2: Carrier Webhooks */}
        {activeSubTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Telecom Carrier Inbound Webhook Dispatcher (Twilio / Exotel / BSNL)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Processes standardized carrier webhook payloads for 160-character GSM-7 SMS queries and dynamic TwiML / Exotel Voice XML generation for telephone hotlines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Inbound SMS Webhook Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    Inbound SMS Webhook
                  </h5>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">POST</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={webhookPhone}
                    onChange={(e) => setWebhookPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={webhookSmsBody}
                    onChange={(e) => setWebhookSmsBody(e.target.value)}
                    placeholder="SMS Text"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleSendSmsWebhook}
                  disabled={loadingWebhook}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch SMS Webhook
                </button>

                {smsWebhookResult && (
                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs space-y-1 font-mono">
                    <div className="text-emerald-400 font-bold">Reply ({smsWebhookResult.char_count}/160 chars):</div>
                    <div className="text-slate-300">{smsWebhookResult.reply_text}</div>
                  </div>
                )}
              </div>

              {/* Inbound Voice XML Webhook Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    Inbound Voice XML (TwiML)
                  </h5>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">GET</span>
                </div>

                <p className="text-xs text-slate-400">
                  Generates carrier-grade Voice XML with &lt;Gather&gt; interactive speech recognition in Hindi/vernacular.
                </p>

                <button
                  onClick={handleFetchVoiceXml}
                  disabled={loadingWebhook}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate TwiML Voice XML
                </button>

                {voiceXmlResult && (
                  <pre className="p-2.5 rounded-xl bg-black/60 border border-slate-700 text-[11px] text-amber-300 font-mono overflow-x-auto max-h-36">
                    {voiceXmlResult.twiml_xml}
                  </pre>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SubTab 3: LoRaWAN Mesh Delay-Tolerant Relay */}
        {activeSubTab === 'mesh' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                LoRaWAN 868MHz Delay-Tolerant Mesh (DTN) Packet Relay
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Store-and-forward packet mesh routing transmitting compressed 64-byte weather bulletins over license-free 868.1 MHz radio frequencies when severe cyclones demolish cellular towers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-300">Packet ID:</span>
                  <div className="text-sm font-black text-white font-mono">{meshPacketId}</div>
                </div>

                <button
                  onClick={handleRelayMeshPacket}
                  disabled={loadingMesh}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {loadingMesh ? 'Relaying Packet...' : 'Simulate 3-Hop Mesh Hop'}
                </button>
              </div>

              {meshResult && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Frequency</div>
                      <div className="font-bold text-white font-mono mt-0.5">{meshResult.frequency_mhz} MHz</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Signal RSSI</div>
                      <div className="font-bold text-emerald-400 font-mono mt-0.5">{meshResult.signal_rssi_dbm} dBm</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400">Mesh Hops</div>
                      <div className="font-bold text-amber-300 font-mono mt-0.5">{meshResult.hop_count} Hops</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold">Relay Path:</span>
                    <div className="text-cyan-300 font-mono">{meshResult.relay_nodes?.join(' ➔ ')}</div>
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
