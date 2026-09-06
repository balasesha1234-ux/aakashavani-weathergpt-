import React, { useRef, useEffect, useState } from 'react';
import { 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Eye, 
  Phone, 
  Sparkles, 
  Cpu,
  X
} from 'lucide-react';
import WeatherCard from './WeatherCard';
import MeteogramChart from './MeteogramChart';
import { AdvisoryBadge, SourceCitationPill } from './AdvisoryBadge';
import InlineWebGISCard from './InlineWebGISCard';
import StreamingText from './StreamingText';
import OrchestrationVisualizer from './OrchestrationVisualizer';

export default function ChatContainer({
  messages,
  isLoading,
  currentLang = 'en',
  activeDistrict,
  autoTTS = false,
  onQuickPrompt
}) {
  const messagesEndRef = useRef(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [completedStreams, setCompletedStreams] = useState({});
  const [dismissedMaps, setDismissedMaps] = useState({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech synthesis with MUTE / STOP toggle
  const toggleSpeech = (text, index) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio is not supported in this browser.');
      return;
    }

    if (speakingIndex === index) {
      // Currently speaking -> MUTE / STOP
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // Start speaking new text
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'kn': 'kn-IN',
      'gu': 'gu-IN'
    };
    utterance.lang = langMap[currentLang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const defaultPrompts = [
    { label: "🌾 Cotton Fertilizer Advisory", query: "Can I spray fertilizer on my cotton crops tomorrow in Wardha?" },
    { label: "🌧️ 7-Day Rainfall Forecast", query: "What is the 7-day weather outlook and rainfall probability?" },
    { label: "🚨 Cyclone & Nearby Shelters", query: "What is the active cyclone warning status and nearest relief shelters in Puri?" },
    { label: "⛵ Marine Sea Safety", query: "Is it safe for small fishing boats to venture out into the sea tomorrow?" }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Welcome Intro if empty */}
        {messages.length === 0 && (
          <div className="text-center py-10 px-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full glass-panel rounded-3xl flex items-center justify-center text-cyan-400">
                <Bot className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight">
              AakashaVani (WeatherGPT)
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed font-medium">
              Conversational Weather, Agromet Advisory & Disaster Intelligence platform grounded in IMD observation networks and GFS numerical models.
            </p>

            {/* Quick Suggestion Cards with High Contrast & Hover Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mt-6 text-left">
              {defaultPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onQuickPrompt(p.query)}
                  className="p-3.5 rounded-2xl glass-card border text-xs font-semibold transition-all hover:border-cyan-500 hover:shadow-lg group text-left cursor-pointer hover:scale-[1.02]"
                >
                  <p className="font-bold text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    <span>{p.label}</span>
                  </p>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-normal">
                    "{p.query}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isLatest = index === messages.length - 1 && !isUser;
          const isStreamComplete = completedStreams[index] || !isLatest;
          const isSpeaking = speakingIndex === index;

          return (
            <div
              key={index}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[90%] sm:max-w-[85%] ${
                isUser 
                  ? 'user-chat-bubble rounded-3xl rounded-tr-sm px-4 py-3 border shadow-md font-medium'
                  : 'assistant-chat-bubble space-y-3'
              }`}>
                
                {/* User Attached Image (if any) */}
                {isUser && msg.imageUrl && (
                  <div className="mb-2 rounded-2xl overflow-hidden border border-white/20 max-w-xs shadow-md">
                    <img src={msg.imageUrl} alt="Uploaded attachment" className="w-full object-cover max-h-52" />
                  </div>
                )}

                {/* Message Text with Streaming Typewriter Animation */}
                <div className="flex items-start justify-between gap-3">
                  {isUser ? (
                    <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="flex-1">
                      <StreamingText
                        text={msg.text}
                        speed={10}
                        isNew={isLatest && !completedStreams[index]}
                        onComplete={() => {
                          setCompletedStreams(prev => ({ ...prev, [index]: true }));
                          if (autoTTS && isLatest) toggleSpeech(msg.text, index);
                        }}
                      />
                    </div>
                  )}

                  {!isUser && (
                    <button
                      onClick={() => toggleSpeech(msg.text, index)}
                      className={`p-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 text-xs font-bold ${
                        isSpeaking
                          ? 'bg-rose-500 text-white animate-emergency-pulse shadow-md shadow-rose-500/30'
                          : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                      }`}
                      title={isSpeaking ? "Click to Mute / Stop Audio" : "Listen to Voice Audio"}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span className="text-[10px] pr-1">Mute</span>
                        </>
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Staggered Contextual Cards (Revealed Smoothly) */}
                {!isUser && msg.data && (
                  <div className="space-y-3 pt-1">
                    
                    {/* Vision Image Analysis Card */}
                    {msg.data.image_analysis && (
                      <div className="animate-card-enter delay-100 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 space-y-2">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                          <Eye className="w-4 h-4" />
                          <span>AI Vision Analysis Report</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-200">
                          {msg.data.image_analysis.recommendation}
                        </p>
                      </div>
                    )}

                    {/* Agromet Crop Advisory */}
                    {msg.data.agromet_advisory && (
                      <div className="animate-card-enter delay-100">
                        <AdvisoryBadge advisory={msg.data.agromet_advisory} />
                      </div>
                    )}

                    {/* Live IMD Weather Card (With Interactive 7-Day DayForecastModal) */}
                    {msg.data.weather && (
                      <div className="animate-card-enter delay-200">
                        <WeatherCard weather={msg.data.weather} district={activeDistrict} />
                      </div>
                    )}

                    {/* 24-Hour Precipitation Meteogram Chart */}
                    {msg.data.weather?.meteogram_24h && (
                      <div className="animate-card-enter delay-200">
                        <MeteogramChart meteogram={msg.data.weather.meteogram_24h} />
                      </div>
                    )}

                    {/* In-Chat WebGIS Map Card - Smooth Animated Reveal AFTER text finishes */}
                    {isStreamComplete && !dismissedMaps[index] && msg.data.intent !== 'GREETING' && (msg.data.emergency || msg.data.intent === 'DISASTER_EMERGENCY' || (msg.data.intent === 'GENERAL_WEATHER' && msg.data.weather)) && (
                      <div className="animate-map-reveal pt-1">
                        <div className="flex items-center justify-between mb-1.5 px-1 text-[11px] font-bold text-cyan-400">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                            <span>Live GIS Doppler & Evacuation Map</span>
                          </div>
                          <button
                            onClick={() => setDismissedMaps(prev => ({ ...prev, [index]: true }))}
                            className="px-2 py-0.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-all flex items-center gap-1 text-[10px] cursor-pointer"
                            title="Close Map (✕)"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Close Map (✕)</span>
                          </button>
                        </div>
                        <InlineWebGISCard
                          latitude={msg.data.weather?.latitude || 20.7453}
                          longitude={msg.data.weather?.longitude || 78.6022}
                          district={activeDistrict}
                          isEmergency={Boolean(msg.data.emergency)}
                          emergencyResources={msg.data.emergency?.emergency_resources || []}
                          onDismiss={() => setDismissedMaps(prev => ({ ...prev, [index]: true }))}
                        />
                      </div>
                    )}

                    {/* Verified Shelters List (if Emergency Active) */}
                    {msg.data.emergency?.emergency_resources && (
                      <div className="animate-card-enter delay-300 p-3.5 rounded-2xl glass-panel border border-rose-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                          <span>Nearby Verified Shelters & Hospitals</span>
                          <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">CONFIRMED</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {msg.data.emergency.emergency_resources.slice(0, 4).map((r, i) => (
                            <div key={i} className="p-2.5 rounded-xl glass-card border text-xs">
                              <p className="font-bold truncate text-slate-100">{r.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{r.address}</p>
                              <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-white/5">
                                <a href={`tel:${r.contact}`} className="inline-flex items-center gap-1 text-cyan-400 font-mono font-bold text-[11px]">
                                  <Phone className="w-3 h-3" />
                                  <span>{r.contact}</span>
                                </a>
                                {r.latitude && r.longitude && (
                                  <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-[11px]"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Route</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Provenance Citations & Multi-Agent Orchestration Trace */}
                    {msg.data.trace && (
                      <div className="animate-card-enter delay-400">
                        <SourceCitationPill trace={msg.data.trace} orchestration={msg.data.orchestration} />
                        <OrchestrationVisualizer 
                          orchestration={msg.data.orchestration} 
                          citations={msg.data.trace?.citations || []} 
                        />
                      </div>
                    )}

                  </div>
                )}

              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-200 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Shimmer Thinking Bubble with Animated Wave */}
        {isLoading && (
          <div className="flex gap-3 items-start animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0 mt-1">
              <div className="w-full h-full glass-panel rounded-full flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
            </div>
            
            <div className="glass-panel animate-shimmer px-4 py-3 rounded-2xl rounded-tl-none border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-3 shadow-lg">
              <div className="flex items-center gap-1 h-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </div>
              <span className="font-semibold tracking-wide">
                Analyzing IMD Doppler Radar & GFS Numerical Simulation...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
