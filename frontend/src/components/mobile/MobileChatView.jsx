import React, { useRef, useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  RotateCcw,
  CloudRain,
  Sprout,
  ShieldAlert,
  Compass
} from 'lucide-react';
import ChatInput from '../chat/ChatInput';

export default function MobileChatView({
  district = 'Waradha, Maharashtra',
  messages = [],
  isLoading = false,
  currentLang = 'te',
  onSendMessage,
  onOpenLiveVoice,
  onOpenSms,
  onOpenIvr,
  onBack,
  onClearChat
}) {
  const messagesEndRef = useRef(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Audio Speech Readout for messages
  const toggleSpeech = (text, index) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio is not supported in this browser.');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '').slice(0, 400);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'kn': 'kn-IN',
      'gu': 'gu-IN',
      'hinglish': 'hi-IN',
      'telish': 'te-IN'
    };
    utterance.lang = langMap[currentLang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Quick Starter Prompts by Language
  const promptMap = {
    te: [
      { label: "🌧️ వర్షం పడుతుందా?", query: `${district} లో ఈరోజు లేదా రేపు భారీ వర్షం పడే అవకాశం ఉందా?` },
      { label: "🌾 పత్తి పంట సలహా", query: `${district} లో పత్తి పంటకు పురుగుమందు ఎప్పుడు పిచికారీ చేయాలి?` },
      { label: "🚨 ఏదైనా హెచ్చరిక ఉందా?", query: `${district} పరిధిలో ఏవైనా తుఫాను లేదా వరద హెచ్చరికలు ఉన్నాయా?` }
    ],
    hi: [
      { label: "🌧️ क्या बारिश होगी?", query: `क्या ${district} में आज या कल भारी बारिश की संभावना है?` },
      { label: "🌾 कीटनाशक छिड़काव", query: `${district} में फसल पर कीटनाशक का छिड़काव कब करें?` },
      { label: "🚨 क्या कोई अलर्ट है?", query: `क्या ${district} के लिए कोई आंधी, तूफान या मौसम अलर्ट है?` }
    ],
    en: [
      { label: "🌧️ Will it rain today?", query: `Is there any rain or storm expected in ${district} today or tomorrow?` },
      { label: "🌾 Crop Spraying Advisory", query: `When is the safest window to spray pesticides on crops in ${district}?` },
      { label: "🚨 Disaster Warning Status", query: `Are there any active flood, cyclone, or severe weather alerts in ${district}?` }
    ]
  };

  const quickPrompts = promptMap[currentLang] || promptMap.en;

  const headerTitles = {
    te: { title: 'ఆకాశవాణి AI', sub: `${district} • ప్రత్యక్ష వాతావరణ సమాచారం` },
    hi: { title: 'आकाशवाणी AI', sub: `${district} • लाइव मौसम व कृषि सलाह` },
    en: { title: 'AakashaVani AI', sub: `${district} • Grounded Meteorological Intel` }
  };
  const h = headerTitles[currentLang] || headerTitles.en;

  return (
    <div className="w-full h-full flex flex-col bg-[#F5F8F5] dark:bg-[#070B14] overflow-hidden">
      
      {/* Mobile Chat Header */}
      <header className="shrink-0 px-3 py-2.5 bg-white/95 dark:bg-[#0B111C]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black shadow-sm">
            <Bot className="w-4 h-4" />
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{h.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
              {h.sub}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* 1-on-1 Live Voice Button */}
          {onOpenLiveVoice && (
            <button
              onClick={onOpenLiveVoice}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-all shadow-xs"
              title="1-on-1 Voice Mode"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-500" />
              <span className="text-[11px]">Voice</span>
            </button>
          )}

          {onClearChat && messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Viewport */}
      <div className="flex-1 w-full overflow-y-auto px-3 py-3 space-y-3 overscroll-contain touch-pan-y">
        
        {/* Empty State with Quick Prompts */}
        {messages.length === 0 && (
          <div className="py-6 px-2 flex flex-col items-center text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {currentLang === 'te' ? 'ఆకాశవాణి వాతావరణ అసిస్టెంట్' : currentLang === 'hi' ? 'आकाशवाणी मौसम सहायक' : 'AakashaVani Weather Assistant'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
              {currentLang === 'te' 
                ? 'వ్యవసాయ సలహాలు, వర్ష సూచనలు లేదా విపత్తు హెచ్చరికలను నేరుగా అడగండి.'
                : currentLang === 'hi'
                ? 'फसल सलाह, बारिश का पूर्वानुमान या आपदा चेतावनियों के बारे में पूछें।'
                : 'Ask questions about rainfall forecasts, agromet spraying windows, or disaster alerts.'}
            </p>

            {/* Quick Prompt Cards */}
            <div className="w-full space-y-2 mt-5 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
                {currentLang === 'te' ? 'త్వరిత ప్రశ్నలు' : currentLang === 'hi' ? 'त्वरित प्रश्न' : 'Suggested Questions'}
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p.query)}
                  className="w-full p-2.5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 shadow-xs flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-left"
                >
                  <span className="truncate pr-2">{p.label}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">Ask →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubble Feed */}
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingIndex === idx;

          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs max-w-[88%] leading-relaxed break-words shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                    : 'bg-white dark:bg-[#0E1626] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 rounded-bl-xs'
                }`}
              >
                {/* Attached Image Thumbnail */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded crop or hazard"
                      className="w-full max-h-48 object-cover"
                    />
                  </div>
                )}

                {/* Message Text */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Assistant Message Extra Badges / Audio Playback */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>✓ IMD Grounded</span>
                    </span>

                    {/* TTS Audio Readout Button */}
                    <button
                      onClick={() => toggleSpeech(msg.text, idx)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors ${
                        isSpeaking
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500'
                      }`}
                      title={isSpeaking ? "Mute Readout" : "Listen in your language"}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-emerald-500" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start animate-fade-in">
            <div className="rounded-2xl rounded-bl-xs px-4 py-3 bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]"></span>
              <span className="text-[11px] font-semibold text-slate-500 ml-1">Analyzing weather models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Chat Input Bar */}
      <div className="shrink-0 w-full bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 pt-1.5 pb-1">
        <ChatInput
          onSendMessage={onSendMessage}
          onOpenLiveVoice={onOpenLiveVoice}
          onSimulateSMS={onOpenSms}
          onSimulateIVR={onOpenIvr}
          isLoading={isLoading}
          currentLang={currentLang}
        />
      </div>

    </div>
  );
}
