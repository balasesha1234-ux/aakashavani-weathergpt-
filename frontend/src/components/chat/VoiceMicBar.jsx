import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, MessageSquareText, PhoneCall, Sparkles } from 'lucide-react';

export default function VoiceMicBar({ onSendMessage, onSimulateSMS, onSimulateIVR, isLoading, currentLang }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Map 13 Indian languages to Web Speech Recognition BCP-47 codes
  const langMap = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'kn': 'kn-IN',
    'ta': 'ta-IN',
    'ml': 'ml-IN',
    'mr': 'mr-IN',
    'bn': 'bn-IN',
    'or': 'or-IN',
    'gu': 'gu-IN',
    'pa': 'pa-IN',
    'as': 'as-IN',
    'bho': 'hi-IN' // fallback to Hindi acoustic model for Bhojpuri
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = langMap[currentLang] || 'en-IN';

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        if (transcript.trim()) {
          onSendMessage(transcript);
          setInputText('');
        }
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [currentLang]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech Recognition is not supported on this browser engine. You can type in the box or test on Google Chrome.');
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Recognition error:', err);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="w-full bg-[#0B1120]/95 border-t border-white/10 p-3.5 backdrop-blur-2xl">
      
      {/* Animated Sound Wave Listening Banner */}
      {isListening && (
        <div className="flex items-center justify-center gap-3 mb-3 py-1.5 px-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <div className="flex items-center gap-1 h-5">
            <span className="w-1 bg-cyan-400 rounded-full wave-bar-1"></span>
            <span className="w-1 bg-cyan-400 rounded-full wave-bar-2"></span>
            <span className="w-1 bg-cyan-400 rounded-full wave-bar-3"></span>
            <span className="w-1 bg-cyan-400 rounded-full wave-bar-4"></span>
            <span className="w-1 bg-cyan-400 rounded-full wave-bar-5"></span>
          </div>
          <span>Listening in {currentLang.toUpperCase()}... Speak naturally into your microphone</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="flex items-center gap-2.5 max-w-5xl mx-auto">
        
        {/* Glowing Floating Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`relative p-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-emergency-pulse scale-105'
              : 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 hover:scale-105 shadow-cyan-500/25 animate-pulse-glow'
          }`}
          title="Voice Mic Input (All Indian Languages)"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 font-bold" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentLang === 'hi' ? "मौसम या फसल के बारे में पूछें... (या माइक दबाकर बोलें)" :
              currentLang === 'te' ? "వాతావరణం లేదా పంటల గురించి అడగండి... (మైక్ ఉపయోగించండి)" :
              currentLang === 'mr' ? "हवामान किंवा पिकाबद्दल विचारा... (किंवा माईक वापरा)" :
              "Ask about 7-day forecast, crop spraying advice, or disaster alerts..."
            }
            className="w-full bg-slate-900/90 text-slate-100 text-sm px-4 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-cyan-400 transition-colors pr-10 placeholder:text-slate-500 shadow-inner"
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-35 text-slate-950 font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>

        {/* Low-Bandwidth 2G SMS & IVR Quick Simulation Buttons */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/10 shrink-0">
          <button
            type="button"
            onClick={onSimulateSMS}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Simulate 2G Offline SMS Query"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-cyan-400" />
            <span>2G SMS</span>
          </button>
          
          <button
            type="button"
            onClick={onSimulateIVR}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-white/10 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Simulate Automated IVR Voice Telephony Call"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>IVR Call</span>
          </button>
        </div>

      </form>
    </div>
  );
}
