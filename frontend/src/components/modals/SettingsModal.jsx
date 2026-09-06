import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Database, 
  Check, 
  Trash2, 
  Download, 
  RefreshCw, 
  MapPin, 
  LocateFixed, 
  Volume2,
  Sparkles,
  Zap,
  Lock,
  Cpu
} from 'lucide-react';
import { getTrainingStatus, triggerTrainingCycle } from '../../services/api';

export default function SettingsModal({
  isOpen,
  onClose,
  currentLang,
  setCurrentLang,
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  activeDistrict,
  latitude,
  longitude,
  onDetectGPS,
  isGPSActive,
  autoTTS,
  setAutoTTS,
  allowAutoTraining = true,
  setAllowAutoTraining,
  userProfile,
  setUserProfile,
  onClearAllChats,
  onExportConversation,
  onOpenAuthModal
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('general');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [unitSystem, setUnitSystem] = useState('metric');
  const [detecting, setDetecting] = useState(false);

  // Training & Self-Learning Telemetry State
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  // Vernacular & Code-Mixed Languages
  const languages = [
    { code: 'en', name: 'English (India)', native: 'English' },
    { code: 'hinglish', name: 'Hinglish (Hindi + English)', native: 'हिंग्लिश / Hinglish' },
    { code: 'telish', name: 'Telish (Telugu + English)', native: 'తెలిష్ / Telish' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' }
  ];

  const tabs = [
    { id: 'general', label: 'Theme & Appearance', icon: Moon },
    { id: 'ai_learning', label: 'AI Self-Learning & Privacy', icon: Sparkles },
    { id: 'location', label: 'Location & GPS Services', icon: MapPin },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'account', label: 'Account & Security', icon: ShieldCheck },
    { id: 'data', label: 'Data & Audio Controls', icon: Database }
  ];

  useEffect(() => {
    if (activeTab === 'ai_learning') {
      getTrainingStatus().then(data => {
        if (data) setTrainingStatus(data);
      });
    }
  }, [activeTab]);

  const handleTriggerGPS = async () => {
    setDetecting(true);
    try {
      await onDetectGPS();
    } finally {
      setDetecting(false);
    }
  };

  const handleManualRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    try {
      await triggerTrainingCycle();
      const updated = await getTrainingStatus();
      if (updated) setTrainingStatus(updated);
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="glass-panel app-modal-container w-full max-w-2xl rounded-3xl border border-inherit shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Left Tabs Column */}
        <div className="w-full md:w-56 app-modal-sidebar border-b md:border-b-0 md:border-r border-inherit p-3 space-y-1">
          <div className="flex items-center justify-between p-2 mb-2">
            <h3 className="text-sm font-extrabold text-white">Settings</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white md:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>

          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${t.id === 'ai_learning' ? 'text-amber-400' : ''}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white">Theme & Appearance</h4>
                <p className="text-xs text-slate-400 mt-0.5">Customize UI contrast, background lighting, and units.</p>
              </div>

              <div className="space-y-3">
                {/* Theme Selector */}
                <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Display Theme</span>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-inherit">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        theme === 'dark' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>

                    <button
                      onClick={() => setTheme('light')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        theme === 'light' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Accent Theme</span>
                  <div className="flex items-center gap-2">
                    {['cyan', 'emerald', 'blue', 'purple'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setAccentColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          c === 'cyan' ? 'bg-cyan-400' :
                          c === 'emerald' ? 'bg-emerald-400' :
                          c === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                        } ${accentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Units of Measurement */}
                <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Meteorological Units</span>
                  <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value)}
                    className="glass-panel border rounded-xl px-3 py-1 text-xs focus:outline-none focus:border-cyan-400 text-slate-200"
                  >
                    <option value="metric" className="bg-slate-900 text-white">Metric (°C, mm, km/h)</option>
                    <option value="imperial" className="bg-slate-900 text-white">Imperial (°F, in, mph)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* AI Self-Learning & Privacy Tab */}
          {activeTab === 'ai_learning' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Continuous Self-Learning & Privacy</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control how AakashaVani trains and adapts its local domain model using conversation history.
                </p>
              </div>

              <div className="space-y-3">
                
                {/* Privacy-Preserving Self-Learning Toggle */}
                <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                  <div className="max-w-[75%]">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Enable Continuous Domain Self-Learning</span>
                      {allowAutoTraining ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                          ACTIVE (OPT-IN)
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold">
                          DISABLED (PRIVATE)
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Periodically retrains the local LoRA model weights using anonymized, high-confidence farming and weather dialogues.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const next = !allowAutoTraining;
                      setAllowAutoTraining(next);
                      localStorage.setItem('aakashavani_auto_training', String(next));
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      allowAutoTraining ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        allowAutoTraining ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Privacy Guarantee Banner */}
                {!allowAutoTraining && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Strict Privacy Active:</strong> Zero chat messages will be recorded to the training dataset. Your data remains strictly ephemeral in this browser session.
                    </span>
                  </div>
                )}

                {/* Live Training Telemetry Card */}
                {trainingStatus && (
                  <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Sovereign SLM Telemetry</span>
                      </span>
                      <span className="text-[10px] text-slate-300">
                        {trainingStatus.model_version}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <p className="text-[9px] text-slate-400 uppercase">Training Dialogues</p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">{trainingStatus.total_training_examples}</p>
                      </div>

                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <p className="text-[9px] text-slate-400 uppercase">LoRA Loss</p>
                        <p className="text-sm font-bold text-cyan-400 mt-0.5">{trainingStatus.final_train_loss}</p>
                      </div>

                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <p className="text-[9px] text-slate-400 uppercase">Perplexity</p>
                        <p className="text-sm font-bold text-purple-400 mt-0.5">{trainingStatus.final_perplexity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Auto-train threshold: Next cycle in {trainingStatus.pending_chats_to_next_train} chats</span>
                      <span className="text-slate-500 font-sans">
                        Last trained: {new Date(trainingStatus.last_trained_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Manual Trigger Button */}
                <div className="pt-1">
                  <button
                    onClick={handleManualRetrain}
                    disabled={isRetraining}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
                  >
                    {isRetraining ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Recalibrating Domain LoRA Weights (Epochs 1-3)...</span>
                      </>
                    ) : retrainSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                        <span>LoRA Weights Successfully Updated!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Force-Retrain Domain Model on Current Chats Now</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white">Location & GPS Services</h4>
                <p className="text-xs text-slate-400 mt-0.5">Manage default district and high-accuracy GPS permissions.</p>
              </div>

              <div className="space-y-3">
                {/* Active District Status Card */}
                <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{activeDistrict}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {latitude?.toFixed(4)}°N, {longitude?.toFixed(4)}°E
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold ${
                    isGPSActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {isGPSActive ? 'GPS LOCKED' : 'DEFAULT'}
                  </span>
                </div>

                {/* Trigger GPS Rescan */}
                <button
                  onClick={handleTriggerGPS}
                  disabled={detecting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
                  <span>{detecting ? 'Acquiring GPS Signal...' : 'Acquire Live Device GPS Coordinates'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Preferred Language</h4>
                <p className="text-xs text-slate-400 mt-0.5">Select from 13 supported Indian regional languages.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setCurrentLang(l.code)}
                    className={`p-3 rounded-2xl glass-card border text-left flex items-center justify-between transition-all ${
                      currentLang === l.code
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-sm font-bold'
                        : 'border-inherit hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-white">{l.name}</p>
                      <p className="text-[11px] text-slate-400 font-sans">{l.native}</p>
                    </div>
                    {currentLang === l.code && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account & Security Tab */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Authentication & Account</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Manage your authenticated session or switch accounts.</p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 text-xs font-bold hover:bg-cyan-500/25 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </div>

              {/* Active Profile Card */}
              <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px]">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-cyan-300 font-bold text-sm">
                      {userProfile?.avatar_letter || userProfile?.avatarLetter || (userProfile?.name ? userProfile.name.slice(0, 1).toUpperCase() : "👤")}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{userProfile?.name || "Guest Citizen"}</p>
                    <p className="text-[11px] text-slate-400">{userProfile?.phone || userProfile?.email || "Anonymous Public Mode"}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                  {userProfile?.auth_provider || userProfile?.authProvider || 'GUEST'}
                </span>
              </div>

              {/* Multi-Factor Authentication (MFA) */}
              <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Multi-Factor Authentication (MFA)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Require OTP verification for emergency alerts.</p>
                </div>
                <button
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    mfaEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Data & Audio Controls Tab */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white">Data & Audio Controls</h4>
                <p className="text-xs text-slate-400 mt-0.5">Configure audio auto-playback and export chat records.</p>
              </div>

              <div className="space-y-3">
                {/* Auto Voice Speech Readout Toggle */}
                <div className="p-4 rounded-2xl glass-card border border-inherit flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Auto Speech Readout</p>
                      <p className="text-[11px] text-slate-400">Automatically speak AI weather answers aloud</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoTTS(!autoTTS)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      autoTTS ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        autoTTS ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Export Conversation as Markdown Report */}
                <button
                  onClick={onExportConversation}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-card border border-inherit text-xs font-bold transition-all hover:border-cyan-400 text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Export Weather Intelligence Report</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">.MD REPORT</span>
                </button>

                {/* Clear All Conversations */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all chat history?')) {
                      onClearAllChats();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Clear All Conversations</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">DELETE</span>
                </button>
              </div>
            </div>
          )}

          {/* Close Action */}
          <div className="mt-6 pt-4 border-t border-inherit flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
