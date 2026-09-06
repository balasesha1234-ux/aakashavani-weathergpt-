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
  Mic,
  MicOff,
  ArrowUp,
  Plus,
  Image as ImageIcon,
  Camera,
  X
} from 'lucide-react';

export default function MobileChatView({
  district = 'Hyderabad',
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
  const scrollContainerRef = useRef(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Auto-scroll ONLY the messages container without scrolling window/body
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  // Clean text formatter for markdown bold & bullets in mobile chat
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().replace(/^[-•*]\s+/, '') : line;
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start gap-1.5 my-0.5 pl-0.5">
            <span className="text-emerald-500 font-bold shrink-0">•</span>
            <span className="flex-1">{content}</span>
          </div>
        );
      }
      return <div key={lIdx} className={lIdx > 0 ? "mt-1" : ""}>{content}</div>;
    });
  };

  // Audio Speech Readout for messages
  const toggleSpeech = (text, index) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langMap[currentLang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Mobile Voice Typing Handler
  const toggleVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Mic not supported');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsListening(false);
      return;
    }

    try {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = langMap[currentLang] || 'en-IN';

      recog.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(prev => (prev ? prev + ' ' + transcript : transcript).trimStart());
        }
      };

      recog.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setSpeechError(e.error === 'not-allowed' ? 'Mic blocked' : 'Voice error');
          setTimeout(() => setSpeechError(null), 3000);
        }
        setIsListening(false);
      };

      recog.onend = () => setIsListening(false);

      recognitionRef.current = recog;
      recog.start();
      setIsListening(true);
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsListening(false);
    }
    onSendMessage(inputText.trim(), attachedImage?.dataUrl);
    setInputText('');
    setAttachedImage(null);
    setMenuOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedImage({ name: file.name, dataUrl: evt.target.result });
      setMenuOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // Quick Starter Prompts
  const promptMap = {
    te: [
      { label: "🌧️ వర్షం పడుతుందా?", query: `${district} లో ఈరోజు వర్షం పడే అవకాశం ఉందా?` },
      { label: "🌾 పంటకు మందు ఎప్పుడు కొట్టాలి?", query: `${district} లో పంటకు మందు ఎప్పుడు పిచికారీ చేయాలి?` },
      { label: "🚨 ఏదైనా తుఫాను హెచ్చరిక ఉందా?", query: `${district} పరిధిలో ఏవైనా వాతావరణ హెచ్చరికలు ఉన్నాయా?` }
    ],
    hi: [
      { label: "🌧️ क्या आज बारिश होगी?", query: `क्या ${district} में आज बारिश की संभावना है?` },
      { label: "🌾 कीटनाशक छिड़काव सलाह", query: `${district} में कीटनाशक छिड़काव कब करें?` },
      { label: "🚨 क्या कोई मौसम अलर्ट है?", query: `क्या ${district} के लिए कोई आंधी-तूफान अलर्ट है?` }
    ],
    en: [
      { label: "🌧️ Will it rain today?", query: `Will it rain today in ${district}?` },
      { label: "🌾 Crop Spraying Advisory", query: `Can I spray pesticides on crops today in ${district}?` },
      { label: "🚨 Any severe weather alert?", query: `Are there any active weather alerts for ${district}?` }
    ]
  };
  const quickPrompts = promptMap[currentLang] || promptMap.en;

  const placeholders = {
    te: 'వాతావరణం లేదా పంట గురించి అడగండి...',
    hi: 'मौसम या फसल के बारे में पूछें...',
    en: 'Ask weather, crop advisory...'
  };
  const currentPlaceholder = placeholders[currentLang] || placeholders.en;

  return (
    <div className="w-full h-full flex flex-col bg-[#F5F8F5] dark:bg-[#070B14] overflow-hidden min-h-0 relative">
      
      {/* 1. Pinned Sticky Mobile Chat Header */}
      <header className="sticky top-0 z-30 shrink-0 w-full px-3 py-2.5 bg-white/95 dark:bg-[#0B111C]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-sm shrink-0">
            <Bot className="w-4 h-4" />
          </div>

          <div className="leading-tight">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AakashaVani</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
              {district} • Live Radar
            </p>
          </div>
        </div>

        {/* Header Right: Live Voice Button & Clear */}
        <div className="flex items-center gap-1.5">
          {onOpenLiveVoice && (
            <button
              onClick={onOpenLiveVoice}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[11px] font-bold transition-all shadow-xs"
              title="1-on-1 Live Voice"
            >
              <Radio className="w-3 h-3 animate-pulse text-cyan-500" />
              <span>Voice</span>
            </button>
          )}

          {onClearChat && messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Messages Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto px-3 py-3 space-y-3 overscroll-contain touch-pan-y min-h-0"
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="py-6 px-2 flex flex-col items-center text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {currentLang === 'te' ? 'ఆకాశవాణి AI సంభాషణ' : currentLang === 'hi' ? 'आकाशवाणी मौसम सहायक' : 'AakashaVani Weather Assistant'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
              {currentLang === 'te' 
                ? 'వ్యవసాయ సలహాలు, వర్ష సూచనలు లేదా విపత్తు హెచ్చరికలను నేరుగా అడగండి.'
                : 'Ask questions about rainfall forecasts, agromet spraying windows, or disaster alerts.'}
            </p>

            <div className="w-full space-y-2 mt-5 text-left">
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

        {/* Message Bubble Stream */}
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingIndex === idx;

          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs max-w-[88%] leading-relaxed break-words shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                    : 'bg-white dark:bg-[#0E1626] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 rounded-bl-xs'
                }`}
              >
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                    <img src={msg.imageUrl} alt="Upload" className="w-full max-h-48 object-cover" />
                  </div>
                )}

                <div className="leading-relaxed">
                  {renderFormattedText(msg.text)}
                </div>

                {!isUser && msg.data?.weather?.current && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-100">
                      <span className="flex items-center gap-1.5">
                        <span>🌤️</span>
                        <span>{msg.data.weather.current.condition}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                        {msg.data.weather.current.temperature != null ? `${Math.round(msg.data.weather.current.temperature)}°C` : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200/40 dark:border-white/5 text-[10px] text-slate-600 dark:text-slate-400">
                      <div>💧 {msg.data.weather.current.humidity}%</div>
                      <div>💨 {msg.data.weather.current.wind_speed_kmh} km/h</div>
                      <div>🌧️ {msg.data.weather.current.rainfall_mm} mm</div>
                    </div>
                  </div>
                )}

                {!isUser && msg.data?.agromet_advisory && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <span>🌿</span>
                      <span>{msg.data.agromet_advisory.crop || 'Agromet Advisory'}</span>
                    </div>
                    {msg.data.agromet_advisory.recommendations?.length > 0 && (
                      <p className="mt-1 text-[10px] text-emerald-900 dark:text-emerald-200 leading-tight">
                        {msg.data.agromet_advisory.recommendations[0]}
                      </p>
                    )}
                  </div>
                )}

                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ IMD Grounded
                    </span>
                    <button
                      onClick={() => toggleSpeech(msg.text, idx)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] transition-colors ${
                        isSpeaking
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-emerald-500" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
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
            <div className="rounded-2xl rounded-bl-xs px-3.5 py-2.5 bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]"></span>
              <span className="text-[11px] font-semibold text-slate-500 ml-1">Analyzing models...</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sleek, Compact Mobile Chat Input Bar */}
      <div className="shrink-0 w-full bg-white/95 dark:bg-[#0B111C]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 px-3 py-2 z-30">
        
        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-1.5 py-1 px-2.5 rounded-xl bg-rose-500/20 text-rose-300 text-[10px] flex items-center justify-between">
            <span>⚠️ {speechError}</span>
            <button onClick={() => setSpeechError(null)} className="p-0.5">✕</button>
          </div>
        )}

        {/* Attached Photo Preview */}
        {attachedImage && (
          <div className="mb-1.5 flex items-center gap-2 px-1">
            <div className="relative rounded-lg overflow-hidden border border-white/20">
              <img src={attachedImage.dataUrl} alt="Preview" className="w-10 h-10 object-cover" />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute top-0 right-0 p-0.5 bg-black/80 rounded-full text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">Photo attached for vision analysis</span>
          </div>
        )}

        {/* Compact Input Row */}
        <div className="flex items-center gap-1.5 w-full bg-slate-100 dark:bg-[#070B14] border border-slate-200 dark:border-white/10 rounded-2xl px-2 py-1 focus-within:border-emerald-500 transition-colors">
          
          {/* Plus / Photo Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              title="Attach photo"
            >
              <Plus className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute bottom-10 left-0 z-50 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl space-y-1 w-48 animate-fade-in">
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => { cameraInputRef.current?.click(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Take Camera Photo</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Clean Single-Line Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={currentPlaceholder}
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none py-1.5 min-w-0"
          />

          {/* Voice Typing Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceTyping}
            className={`p-1.5 rounded-xl shrink-0 transition-colors ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'text-slate-400 hover:text-emerald-400'
            }`}
            title="Voice typing"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button or 1-on-1 Voice Launcher */}
          {inputText.trim() || attachedImage ? (
            <button
              type="button"
              onClick={handleSend}
              className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shrink-0 transition-transform active:scale-95 shadow-sm"
              title="Send"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            onOpenLiveVoice && (
              <button
                type="button"
                onClick={onOpenLiveVoice}
                className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 shrink-0 transition-colors"
                title="1-on-1 Voice Mode"
              >
                <Radio className="w-4 h-4" />
              </button>
            )
          )}

        </div>
      </div>

    </div>
  );
}
