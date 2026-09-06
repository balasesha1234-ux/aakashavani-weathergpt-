import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Send, Sparkles, Volume2 } from 'lucide-react';

export default function MobileVoiceSheet({
  isOpen,
  onClose,
  onSendPrompt,
  currentLang = 'te',
  district = 'Waradha'
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  const promptsByLang = {
    te: {
      title: 'వాయిస్ అసిస్టెంట్',
      subtitle: `${district} వాతావరణం & పంటల గురించి అడగండి`,
      listening: 'మీరు మాట్లాడండి, వింటున్నాను...',
      tapToSpeak: 'మాట్లాడేందుకు మైక్రోఫోన్ నొక్కండి',
      sendBtn: 'పంపండి',
      suggestions: [
        'ఈ రోజు వర్షం పడుతుందా?',
        'పత్తి పంటకు మందు ఎప్పుడు కొట్టాలి?',
        'నా ప్రాంతంలో ఏదైనా తుఫాను హెచ్చరిక ఉందా?'
      ]
    },
    hi: {
      title: 'वॉयस असिस्टेंट',
      subtitle: `${district} मौसम और फसलों के बारे में पूछें`,
      listening: 'आप बोलिए, मैं सुन रहा हूँ...',
      tapToSpeak: 'बोलने के लिए माइक दबाएं',
      sendBtn: 'भेजें',
      suggestions: [
        'क्या आज बारिश होगी?',
        'कपास में कीटनाशक कब छिड़कें?',
        'क्या कोई आंधी या तूफान का अलर्ट है?'
      ]
    },
    en: {
      title: 'Voice Assistant',
      subtitle: `Ask about weather & crops for ${district}`,
      listening: 'Listening to your voice...',
      tapToSpeak: 'Tap microphone to speak',
      sendBtn: 'Send',
      suggestions: [
        'Will it rain heavily today?',
        'When can I spray pesticide on cotton?',
        'Are there any flood or cyclone alerts?'
      ]
    }
  };

  const text = promptsByLang[currentLang] || promptsByLang.en;

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechClass();
    recog.continuous = false;
    recog.interimResults = true;

    // Set recognition language
    const langMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      en: 'en-IN'
    };
    recog.lang = langMap[currentLang] || 'en-IN';

    recog.onresult = (event) => {
      let finalStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalStr += event.results[i][0].transcript;
      }
      setTranscript(finalStr);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recog.onerror = (e) => {
      console.warn("Speech recognition notice:", e);
      setIsListening(false);
    };

    setRecognition(recog);
  }, [currentLang]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. You can type your query.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Recognition start notice:", err);
      }
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onSendPrompt(transcript.trim());
      setTranscript('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0B111C] rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 dark:border-white/10 safe-area-bottom">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{text.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                  {currentLang.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{text.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Pulsating Mic Button */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute -inset-4 rounded-full bg-emerald-400/30 animate-ping"></div>
                <div className="absolute -inset-8 rounded-full bg-emerald-400/15 animate-pulse"></div>
              </>
            )}

            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all cursor-pointer relative z-10 ${
                isListening 
                  ? 'bg-rose-500 hover:bg-rose-600 scale-110 shadow-rose-500/40' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
            {isListening ? text.listening : text.tapToSpeak}
          </p>

          {/* Audio Waveform Bars (Animated when listening) */}
          <div className="flex items-center gap-1 mt-2.5 h-6">
            {[40, 75, 100, 60, 85, 30, 90, 50, 70, 45, 95, 60].map((h, i) => (
              <span
                key={i}
                style={{ height: isListening ? `${h}%` : '20%' }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              ></span>
            ))}
          </div>
        </div>

        {/* Transcript Area / Input Box */}
        <div className="relative mb-4">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isListening ? "మీరు మాట్లాడుతున్నది ఇక్కడ కనిపిస్తుంది..." : "లేదా ఇక్కడ మీ ప్రశ్నను టైప్ చేయండి..."}
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          {transcript.trim() && (
            <button
              onClick={handleSend}
              className="absolute right-2.5 bottom-3.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <span>{text.sendBtn}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            సూచించిన ప్రశ్నలు:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {text.suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(s);
                  onSendPrompt(s);
                  onClose();
                }}
                className="text-left text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
