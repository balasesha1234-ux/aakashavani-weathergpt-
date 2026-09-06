import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  ArrowUp, 
  Camera, 
  Image as ImageIcon, 
  X, 
  MessageSquareText, 
  PhoneCall, 
  Zap,
  Check,
  Headphones,
  AudioLines
} from 'lucide-react';
import { 
  SAMPLE_CROP_DISEASE, 
  SAMPLE_FLOOD_HAZARD, 
  SAMPLE_STORM_CLOUD 
} from '../../services/demoImages';

export default function ChatInput({
  onSendMessage,
  onOpenLiveVoice,
  onSimulateSMS,
  onSimulateIVR,
  isLoading,
  currentLang = 'en'
}) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

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
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ta': 'தமிழ் (Tamil)',
    'ml': 'മലയാളം (Malayalam)',
    'mr': 'मराठी (Marathi)',
    'bn': 'বাংলা (Bengali)',
    'or': 'ଓଡ଼ିଆ (Odia)',
    'gu': 'ગુજરાતી (Gujarati)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)'
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch (e) {}
    };
  }, []);

  // Click outside listener for plus menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Toggle Voice Typing (Dictate words directly into textbox)
  const toggleVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    baseTextRef.current = inputText;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recog = new SpeechRecognition();
      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      recog.continuous = !isMobileDevice;
      recog.interimResults = true;
      recog.maxAlternatives = 1;
      recog.lang = langMap[currentLang] || 'en-IN';

      recog.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece + ' ';
          } else {
            interimTranscript += piece;
          }
        }

        const base = baseTextRef.current ? baseTextRef.current.trim() + ' ' : '';
        const currentTranscription = (base + finalTranscript + interimTranscript).trimStart();
        setInputText(currentTranscription);

        if (finalTranscript) {
          baseTextRef.current = (base + finalTranscript).trimStart();
        }
      };

      recog.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('⚠️ Mic access denied. Allow microphone in browser address bar (lock icon).');
        } else if (event.error === 'audio-capture') {
          setSpeechError('⚠️ Microphone not detected or in use by another app.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setSpeechError(`Voice paused (${event.error}). Tap mic to resume.`);
        }
        setIsListening(false);
        setTimeout(() => setSpeechError(null), 5000);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
      recog.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setSpeechError('Could not start microphone. Check browser permissions.');
      setIsListening(false);
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;
    
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }

    onSendMessage(inputText.trim(), attachedImage?.dataUrl);
    setInputText('');
    baseTextRef.current = '';
    setAttachedImage(null);
    setMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage({
        name: file.name,
        type: file.type,
        dataUrl: event.target.result
      });
      setMenuOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerPreset = (presetName, imageDataUrl, samplePrompt) => {
    setAttachedImage({
      name: `${presetName} (Demo Image)`,
      type: 'image/svg+xml',
      dataUrl: imageDataUrl
    });
    setInputText(samplePrompt);
    setMenuOpen(false);
  };

  const hasContent = inputText.trim().length > 0 || attachedImage !== null;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4">
      
      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-2 p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <span>⚠️ {speechError}</span>
          <button onClick={() => setSpeechError(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-Time Voice Typing Dictation Banner */}
      {isListening && (
        <div className="mb-2.5 px-3.5 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs flex items-center justify-between shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-1 bg-cyan-400 rounded-full h-2 animate-bounce"></span>
              <span className="w-1 bg-cyan-400 rounded-full h-3.5 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1 bg-cyan-400 rounded-full h-2 animate-bounce [animation-delay:0.3s]"></span>
            </div>
            <span className="font-semibold text-white">
              🎙️ Voice Typing in <strong className="text-cyan-400">{langNames[currentLang] || 'English'}</strong>: Speak now...
            </span>
          </div>
          <button
            type="button"
            onClick={toggleVoiceTyping}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] transition-all"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Done</span>
          </button>
        </div>
      )}

      {/* Floating Plus (+) Menu Popover */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-20 left-2 sm:left-6 z-50 glass-panel p-3 rounded-3xl border shadow-2xl space-y-2 w-72 max-w-[calc(100vw-2rem)] animate-in fade-in duration-150"
        >
          {/* Quick 1-Click Demo Vision Presets */}
          <div className="border-b border-white/10 pb-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>1-Click Vision Presets</span>
              </span>
              <span className="bg-cyan-500/20 px-1.5 py-0.2 rounded text-[9px]">Demo</span>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleTriggerPreset("Cotton Disease", SAMPLE_CROP_DISEASE, "Please diagnose this crop leaf damage and provide spraying advice.")}
                className="w-full text-left px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center justify-between transition-all"
              >
                <span>🌾 Cotton Leaf Blight</span>
                <span className="text-[10px] text-emerald-400 font-mono">Diagnose</span>
              </button>

              <button
                onClick={() => handleTriggerPreset("Road Waterlogging", SAMPLE_FLOOD_HAZARD, "Is this waterlogged road safe to cross? What is the flood depth?")}
                className="w-full text-left px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-bold text-sky-300 flex items-center justify-between transition-all"
              >
                <span>🌊 Road Flood (3.2 ft)</span>
                <span className="text-[10px] text-sky-400 font-mono">Depth</span>
              </button>

              <button
                onClick={() => handleTriggerPreset("Storm Cloud", SAMPLE_STORM_CLOUD, "What kind of storm cloud is this? Is heavy rain incoming?")}
                className="w-full text-left px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-between transition-all"
              >
                <span>⛈️ Squall Wall Cloud</span>
                <span className="text-[10px] text-amber-400 font-mono">Nowcast</span>
              </button>
            </div>
          </div>

          {/* Standard Attachments */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-cyan-500/10 text-xs font-semibold transition-colors text-left text-slate-200"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Upload Custom Photo</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-500/10 text-xs font-semibold transition-colors text-left text-slate-200"
            >
              <Camera className="w-4 h-4 text-purple-400" />
              <span>Take Mobile Camera Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Input Card */}
      <div className="glass-panel app-input-bar p-2.5 rounded-3xl border shadow-2xl transition-all focus-within:border-cyan-400">
        
        {/* Attached Photo Preview Chip */}
        {attachedImage && (
          <div className="mb-2 px-2 pt-1 flex items-center gap-2">
            <div className="relative group rounded-xl overflow-hidden border border-white/20">
              <img
                src={attachedImage.dataUrl}
                alt="Attached upload"
                className="w-14 h-14 object-cover"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-white hover:text-rose-400 transition-colors"
                title="Remove Image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[11px]">
              <p className="font-bold text-cyan-400">Photo Attached for AI Vision Analysis</p>
              <p className="text-slate-400 truncate max-w-[220px]">{attachedImage.name}</p>
            </div>
          </div>
        )}

        {/* Input Bar Row */}
        <div className="flex items-end gap-2 px-1">
          
          {/* Hidden File Inputs */}
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

          {/* Plus / Attachment Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2.5 rounded-2xl transition-all shrink-0 ${
              menuOpen ? 'bg-cyan-500 text-slate-950 rotate-45' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
            }`}
            title="Attach photos, 1-click vision presets, or files"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              currentLang === 'hinglish' ? "Sawal pūchiye ya voice typing use kariye..." :
              currentLang === 'telish' ? "Prashna adagandi leda voice typing vadandi..." :
              currentLang === 'hi' ? "बोलें या टाइप करें... (माइक दबाकर बोलें)" :
              currentLang === 'te' ? "మాట్లాడండి లేదా టైప్ చేయండి..." :
              "Ask anything or tap mic for voice typing..."
            }
            className="w-full bg-transparent text-sm font-medium px-2 py-2.5 focus:outline-none placeholder:text-slate-500 resize-none max-h-36 leading-relaxed"
            style={{ color: 'inherit' }}
          />

          {/* Action Group: Voice Typing (Left) + Dynamic Send/Voice Mode (Right) */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* 1. Voice Typing / Speech-to-Text Button */}
            <button
              type="button"
              onClick={toggleVoiceTyping}
              className={`p-2.5 rounded-2xl transition-all shrink-0 flex items-center justify-center relative ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80'
              }`}
              title={isListening ? "Listening... Tap to stop" : "Voice Typing: Dictate speech into text box"}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping"></span>
              )}
            </button>

            {/* 2. Dynamic Primary Button: Send (when text typed) vs 1-on-1 Voice Mode (when empty) */}
            {hasContent ? (
              <button
                type="button"
                onClick={handleSend}
                className="p-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center animate-in zoom-in-90 duration-150"
                title="Send Message"
              >
                <ArrowUp className="w-5 h-5 font-bold" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLiveVoice}
                className="p-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 hover:border-cyan-400 transition-all flex items-center justify-center shadow-sm group"
                title="Live 1-on-1 Voice Conversation Mode (ChatGPT Style)"
              >
                <AudioLines className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-400" />
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Helper Footer */}
      <div className="hidden sm:flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span>AakashaVani 1.0</span>
          <span>•</span>
          <span>Voice & Multi-Agent AI</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSimulateSMS}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <MessageSquareText className="w-3 h-3" />
            <span>2G SMS</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onSimulateIVR}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>IVR Hotline</span>
          </button>
        </div>
      </div>

    </div>
  );
}
