import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Radio } from 'lucide-react';

export default function LiveVoiceModal({
  isOpen,
  onClose,
  onSendMessage,
  currentLang = 'en',
  activeDistrict = 'Manikonda'
}) {
  const [voiceState, setVoiceState] = useState('listening'); // 'listening' | 'thinking' | 'speaking' | 'idle'
  const [transcript, setTranscript] = useState('');
  const [aiSpokenText, setAiSpokenText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const isListeningRef = useRef(false);

  const langMap = {
    'en': 'en-IN',
    'hinglish': 'hi-IN',
    'telish': 'te-IN',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'kn': 'kn-IN',
    'ta': 'ta-IN',
    'ml': 'ml-IN',
    'mr': 'mr-IN',
    'bn': 'bn-IN',
    'or': 'or-IN',
    'gu': 'gu-IN',
    'pa': 'pa-IN'
  };

  const langNames = {
    'en': 'English',
    'hinglish': 'Hinglish (Hindi+Eng)',
    'telish': 'Telish (Telugu+Eng)',
    'hi': 'हिन्दी (Hindi)',
    'te': 'తెలుగు (Telugu)',
    'mr': 'मराठी (Marathi)',
    'ta': 'தமிழ் (Tamil)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'bn': 'বাংলা (Bengali)'
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      cleanupSpeech();
      return;
    }

    startListening();

    return () => cleanupSpeech();
  }, [isOpen, currentLang]);

  const cleanupSpeech = () => {
    try {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    } catch (e) {}
    isListeningRef.current = false;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const startListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript('Speech Recognition not supported in this browser. Use Chrome, Edge, or Safari.');
      return;
    }

    // Verify / prompt for microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.warn('Microphone permission denied:', err);
        setTranscript('⚠️ Microphone access blocked. Please allow mic in browser settings.');
        return;
      }
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = langMap[currentLang] || 'en-IN';

      recog.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setTranscript(final || interim);

        if (final && final.trim().length > 1) {
          handleUserSpeechFinal(final.trim());
        }
      };

      recog.onerror = (e) => {
        console.warn('Live voice recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setTranscript('⚠️ Microphone permission denied in browser.');
          isListeningRef.current = false;
        } else if (e.error === 'no-speech') {
          if (isOpen && voiceState === 'listening') {
            setTimeout(() => {
              if (isOpen && voiceState === 'listening') startListening();
            }, 300);
          }
        }
      };

      recog.onend = () => {
        isListeningRef.current = false;
        if (isOpen && voiceState === 'listening') {
          setTimeout(() => {
            if (isOpen && voiceState === 'listening') startListening();
          }, 300);
        }
      };

      recognitionRef.current = recog;
      setVoiceState('listening');
      setTranscript('');
      recog.start();
      isListeningRef.current = true;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      isListeningRef.current = false;
    }
  };

  const handleUserSpeechFinal = async (userText) => {
    // Stop listening while AI thinks & speaks
    try {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    } catch (e) {}
    isListeningRef.current = false;
    setVoiceState('thinking');
    setTranscript(userText);

    try {
      const result = await onSendMessage(userText, null, true); // true = live voice query
      const reply = result?.response_text || "Observations verified for your location.";
      setAiSpokenText(reply);
      speakAiResponse(reply);
    } catch (err) {
      console.error('Live voice error:', err);
      setVoiceState('listening');
      startListening();
    }
  };

  const speakAiResponse = (text) => {
    if (!synthRef.current || isMuted) {
      setVoiceState('listening');
      setTimeout(() => startListening(), 1000);
      return;
    }

    synthRef.current.cancel();
    // Strip markdown formatting from spoken audio
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '').slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langMap[currentLang] || 'en-IN';
    utterance.rate = 1.05;

    // Pick Indian voice if available
    const voices = synthRef.current.getVoices();
    const indVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
    if (indVoice) utterance.voice = indVoice;

    setVoiceState('speaking');

    utterance.onend = () => {
      // Once AI finishes speaking, transition back to listening for 1-on-1 loop!
      setVoiceState('listening');
      setTranscript('');
      setAiSpokenText('');
      setTimeout(() => startListening(), 400);
    };

    utterance.onerror = () => {
      setVoiceState('listening');
      setTimeout(() => startListening(), 400);
    };

    synthRef.current.speak(utterance);
  };

  const handleOrbClick = () => {
    if (voiceState === 'speaking') {
      if (synthRef.current) synthRef.current.cancel();
      setVoiceState('listening');
      startListening();
    } else if (voiceState === 'listening') {
      if (transcript.trim().length > 1) {
        handleUserSpeechFinal(transcript.trim());
      } else {
        startListening();
      }
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#080C14]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 animate-in fade-in duration-200">
      
      {/* Top Bar: Title & Exit */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>AakashaVani 1-on-1 Voice</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {langNames[currentLang] || 'English'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Grounded Meteorological Dialogue • Tap Orb to Speak</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Exit Voice Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Glowing Living Voice Orb Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 max-w-lg text-center">
        
        {/* Animated Living Voice Orb with Click-to-Speak / Interrupt */}
        <div 
          onClick={handleOrbClick}
          className="relative flex items-center justify-center w-56 h-56 cursor-pointer group select-none"
          title={voiceState === 'speaking' ? "Tap to interrupt & speak" : "Tap to speak or send"}
        >
          {/* Outer Pulsating Ripple Rings */}
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
            voiceState === 'listening'
              ? 'bg-cyan-500/20 animate-ping'
              : voiceState === 'speaking'
              ? 'bg-emerald-500/25 animate-pulse'
              : 'bg-indigo-500/15'
          }`} />

          <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-500 ${
            voiceState === 'listening'
              ? 'bg-cyan-400/30'
              : voiceState === 'speaking'
              ? 'bg-emerald-400/35'
              : 'bg-purple-500/20'
          }`} />

          {/* Central Living Orb */}
          <div className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${
            voiceState === 'listening'
              ? 'bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 shadow-cyan-500/50 scale-105'
              : voiceState === 'speaking'
              ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-emerald-500/50 scale-110'
              : 'bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 shadow-purple-500/40 animate-pulse'
          }`}>
            {voiceState === 'listening' && (
              <div className="flex items-center gap-1.5 h-8">
                <span className="w-1.5 bg-white rounded-full h-4 animate-bounce"></span>
                <span className="w-1.5 bg-white rounded-full h-8 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 bg-white rounded-full h-5 animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1.5 bg-white rounded-full h-7 animate-bounce [animation-delay:0.2s]"></span>
              </div>
            )}
            {voiceState === 'thinking' && (
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            )}
            {voiceState === 'speaking' && (
              <div className="flex items-center gap-1.5 h-10">
                <span className="w-2 bg-white rounded-full h-6 animate-pulse"></span>
                <span className="w-2 bg-white rounded-full h-10 animate-pulse [animation-delay:0.1s]"></span>
                <span className="w-2 bg-white rounded-full h-7 animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-2 bg-white rounded-full h-9 animate-pulse [animation-delay:0.15s]"></span>
              </div>
            )}
          </div>
        </div>

        {/* State Status Label */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest font-mono font-bold text-cyan-400">
            {voiceState === 'listening' && "● LISTENING (Speak freely or tap orb...)"}
            {voiceState === 'thinking' && "● PROCESSING GROUND TRUTH..."}
            {voiceState === 'speaking' && "● AAKASHAVANI SPEAKING (Tap orb to interrupt)..."}
          </p>

          {/* User Live Spoken Transcript */}
          {transcript && (
            <p className="text-base font-semibold text-white bg-white/5 px-4 py-2 rounded-2xl border border-white/10 max-w-md animate-in fade-in">
              "{transcript}"
            </p>
          )}

          {/* AI Spoken Answer Snippet */}
          {aiSpokenText && voiceState === 'speaking' && (
            <p className="text-xs text-slate-300 max-w-md line-clamp-3 italic px-2">
              "{aiSpokenText}"
            </p>
          )}
        </div>

        {/* Quick Voice Demo Chips (Resilient 1-tap fallback for hackathon demos) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-md">
          {[
            { label: "🌧️ Aaj barish hogi?", query: currentLang === 'te' || currentLang === 'telish' ? "Eeroju rain padthada?" : "Kya aaj barish hogi?" },
            { label: "🌾 Fasal spray salah", query: currentLang === 'te' || currentLang === 'telish' ? "Pantalaki spray cheyocha?" : "Kya fasal ke liye keetnashak spray kar sakte hain?" },
            { label: "🚨 Emergency shelter", query: "Kahan hai nearest emergency disaster shelter?" }
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUserSpeechFinal(chip.query)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>

      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-4">
        <button
          onClick={() => {
            if (synthRef.current) synthRef.current.cancel();
            setIsMuted(!isMuted);
          }}
          className={`p-3.5 rounded-2xl border transition-all ${
            isMuted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
          title={isMuted ? "Unmute Voice" : "Mute Spoken Audio"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <button
          onClick={onClose}
          className="px-6 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>End Voice Conversation</span>
        </button>
      </div>

    </div>
  );
}
