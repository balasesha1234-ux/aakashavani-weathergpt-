import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import HomeView from './components/home/HomeView';
import ChatContainer from './components/chat/ChatContainer';
import ChatInput from './components/chat/ChatInput';
import MessageQueueBar from './components/chat/MessageQueueBar';
import AlertsView from './components/alerts/AlertsView';
import WebGISMap from './components/map/WebGISMap';
import SettingsModal from './components/modals/SettingsModal';
import AuthModal from './components/modals/AuthModal';
import AuthPage from './components/auth/AuthPage';
import LiveVoiceModal from './components/modals/LiveVoiceModal';
import Phase2TelecomModal from './components/modals/Phase2TelecomModal';
import Phase3DroneSirenModal from './components/modals/Phase3DroneSirenModal';
import Phase4WebGISModal from './components/modals/Phase4WebGISModal';
import Phase5TelecomGatewayModal from './components/modals/Phase5TelecomGatewayModal';
import Phase6AgentSwarmModal from './components/modals/Phase6AgentSwarmModal';
import Phase7SatelliteSpaceModal from './components/modals/Phase7SatelliteSpaceModal';
import Phase8EdgeMeshModal from './components/modals/Phase8EdgeMeshModal';
import Phase9OfflineAIModal from './components/modals/Phase9OfflineAIModal';
import Phase10WmoEocModal from './components/modals/Phase10WmoEocModal';
import Phase11OceanBuoyModal from './components/modals/Phase11OceanBuoyModal';
import Phase12QuantumGridModal from './components/modals/Phase12QuantumGridModal';
import Phase13LightningModal from './components/modals/Phase13LightningModal';
import Phase14FlashFloodPinnModal from './components/modals/Phase14FlashFloodPinnModal';
import Phase15CryosphereGlofModal from './components/modals/Phase15CryosphereGlofModal';
import Phase16NationalTwinModal from './components/modals/Phase16NationalTwinModal';
import LocationPickerModal from './components/modals/LocationPickerModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFoundPage from './components/common/NotFoundPage';
import MobileApp from './components/mobile/MobileApp';
import PhoneSimulatorFrame from './components/mobile/PhoneSimulatorFrame';
import { 
  sendChatMessage, 
  getCurrentWeather, 
  getEmergencyStatus, 
  simulateSMS, 
  simulateIVR,
  getCurrentUser
} from './services/api';
import { detectDeviceLocation } from './services/location';
import { MessageSquareText, PhoneCall, X, Download } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [forceViewMode, setForceViewMode] = useState('auto'); // 'auto', 'mobile', 'desktop'

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileView = forceViewMode === 'mobile' || (forceViewMode === 'auto' && isMobileScreen);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [liveVoiceOpen, setLiveVoiceOpen] = useState(false);
  const [telecomModalOpen, setTelecomModalOpen] = useState(false);
  const [phase3ModalOpen, setPhase3ModalOpen] = useState(false);
  const [phase4ModalOpen, setPhase4ModalOpen] = useState(false);
  const [phase5ModalOpen, setPhase5ModalOpen] = useState(false);
  const [phase6ModalOpen, setPhase6ModalOpen] = useState(false);
  const [phase7ModalOpen, setPhase7ModalOpen] = useState(false);
  const [phase8ModalOpen, setPhase8ModalOpen] = useState(false);
  const [phase9ModalOpen, setPhase9ModalOpen] = useState(false);
  const [phase10ModalOpen, setPhase10ModalOpen] = useState(false);
  const [phase11ModalOpen, setPhase11ModalOpen] = useState(false);
  const [phase12ModalOpen, setPhase12ModalOpen] = useState(false);
  const [phase13ModalOpen, setPhase13ModalOpen] = useState(false);
  const [phase14ModalOpen, setPhase14ModalOpen] = useState(false);
  const [phase15ModalOpen, setPhase15ModalOpen] = useState(false);
  const [phase16ModalOpen, setPhase16ModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const isLoadingRef = useRef(false);

  // Canonical Product Navigation ('home' | 'ask' | 'map' | 'alerts' | 'login')
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      return 'login';
    }
    return 'home';
  });

  // Theme & Appearance State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aakashavani_theme') || 'dark';
  });
  const [accentColor, setAccentColor] = useState('cyan');
  const [autoTTS, setAutoTTS] = useState(false);
  const [allowAutoTraining, setAllowAutoTraining] = useState(() => {
    return localStorage.getItem('aakashavani_auto_training') !== 'false';
  });

  // Location & GPS State (Checks saved custom location first)
  const [currentLang, setCurrentLang] = useState('en');
  const [activeDistrict, setActiveDistrict] = useState(() => {
    const saved = localStorage.getItem('aakashavani_custom_location');
    if (saved) {
      try { return JSON.parse(saved).district || 'Hyderabad'; } catch (e) {}
    }
    return 'Hyderabad';
  });
  const [latitude, setLatitude] = useState(() => {
    const saved = localStorage.getItem('aakashavani_custom_location');
    if (saved) {
      try { return JSON.parse(saved).latitude || 17.3850; } catch (e) {}
    }
    return 17.3850;
  });
  const [longitude, setLongitude] = useState(() => {
    const saved = localStorage.getItem('aakashavani_custom_location');
    if (saved) {
      try { return JSON.parse(saved).longitude || 78.4867; } catch (e) {}
    }
    return 78.4867;
  });
  const [isGPSActive, setIsGPSActive] = useState(false);

  // Operational Mode: 'live' (100% Real Live Production) vs 'demo' (Disaster Test Cases)
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('aakashavani_app_mode') || 'live';
  });

  const handleToggleAppMode = (mode) => {
    const nextMode = mode || (appMode === 'live' ? 'demo' : 'live');
    setAppMode(nextMode);
    localStorage.setItem('aakashavani_app_mode', nextMode);
  };

  // User Profile State (Rehydrated from database or Guest mode)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('aakashavani_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const legacy = localStorage.getItem('aakashavani_user_profile');
    if (legacy) {
      try { return JSON.parse(legacy); } catch (e) {}
    }
    return null; // Guest Citizen by default
  });

  // Rehydrate session & handle OAuth redirect callback (?token=... or ?error=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const callbackToken = urlParams.get('token');
    const callbackError = urlParams.get('error');

    if (callbackToken) {
      localStorage.setItem('aakashavani_token', callbackToken);
      getCurrentUser(callbackToken).then(user => {
        if (user) {
          setUserProfile(user);
          localStorage.setItem('aakashavani_user', JSON.stringify(user));
          if (user.district) setActiveDistrict(user.district.split(',')[0].trim());
        }
      }).catch(err => console.warn('OAuth callback user fetch error:', err));
      
      // Clean query string and return to root home
      window.history.replaceState(null, '', '/');
      setActiveWorkspace('home');
      return;
    }

    if (callbackError) {
      console.warn('OAuth authentication error reported:', callbackError);
      window.history.replaceState(null, '', '/login');
      setActiveWorkspace('login');
      return;
    }

    const token = localStorage.getItem('aakashavani_token');
    if (token) {
      getCurrentUser(token).then(user => {
        if (user) {
          setUserProfile(user);
          localStorage.setItem('aakashavani_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('aakashavani_token');
          localStorage.removeItem('aakashavani_user');
          setUserProfile(null);
        }
      }).catch(() => {});
    }
  }, []);

  // Sync /login URL path with activeWorkspace
  useEffect(() => {
    if (activeWorkspace === 'login') {
      window.history.replaceState(null, '', '/login');
      document.title = 'Login — AakashaVani Weather & Disaster Platform';
    } else {
      if (window.location.pathname === '/login') {
        window.history.replaceState(null, '', '/');
      }
      document.title = 'AakashaVani (WeatherGPT) — MoES / IMD AI Platform';
    }
  }, [activeWorkspace]);

  // Conversations State
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('aakashavani_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'conv-default-1',
        title: 'Manikonda Commute & Weather',
        messages: [],
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState('conv-default-1');
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // Low-Bandwidth Modals
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsQuery, setSmsQuery] = useState('MAUSAM MANIKONDA');
  const [smsResult, setSmsResult] = useState(null);

  const [ivrModalOpen, setIvrModalOpen] = useState(false);
  const [ivrResult, setIvrResult] = useState(null);

  // Apply Theme Class
  useEffect(() => {
    localStorage.setItem('aakashavani_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark');
    }
  }, [theme]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('aakashavani_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('aakashavani_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Auto-detect GPS on startup ONLY if user hasn't chosen a custom location
  useEffect(() => {
    const saved = localStorage.getItem('aakashavani_custom_location');
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        if (loc.district && loc.latitude && loc.longitude) {
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
          setActiveDistrict(loc.district);
          setIsGPSActive(Boolean(loc.isGPS));
          return; // Respect user's saved location choice
        }
      } catch (e) {}
    }

    detectDeviceLocation().then((loc) => {
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      if (loc.district) setActiveDistrict(loc.district);
      setIsGPSActive(true);
    }).catch(() => {
      setIsGPSActive(false);
    });
  }, []);

  // Handle explicit user selection from LocationPickerModal
  const handleSelectLocation = (loc) => {
    if (!loc) return;
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setActiveDistrict(loc.district);
    setIsGPSActive(Boolean(loc.isGPS));
    localStorage.setItem('aakashavani_custom_location', JSON.stringify({
      district: loc.district,
      latitude: loc.latitude,
      longitude: loc.longitude,
      isGPS: Boolean(loc.isGPS)
    }));
  };

  // Check emergency status
  useEffect(() => {
    getEmergencyStatus(latitude, longitude, activeDistrict, appMode).then((emer) => {
      setEmergencyData(emer);
      // In Live Mode, synthetic demo alerts MUST NEVER activate emergency mode (Rule 1 & Rule 3)
      if (appMode === 'live' && emer?.warning?.is_simulated) {
        setIsEmergencyActive(false);
      } else {
        setIsEmergencyActive(Boolean(emer?.is_emergency_active));
      }
    }).catch(() => {
      setEmergencyData(null);
      setIsEmergencyActive(false);
    });
  }, [latitude, longitude, activeDistrict, appMode]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const currentMessages = activeConversation?.messages || [];

  // Manual Trigger GPS
  const handleDetectGPS = async () => {
    try {
      const loc = await detectDeviceLocation();
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      if (loc.district) setActiveDistrict(loc.district);
      setIsGPSActive(true);
    } catch (e) {
      alert("Could not access device GPS. Please check location permissions in your browser.");
    }
  };

  // Start New Chat
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveWorkspace('ask');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Switch Simulation Scenario
  const handleSelectScenario = (scenarioOrQuery) => {
    let queryText = typeof scenarioOrQuery === 'string' ? scenarioOrQuery : scenarioOrQuery.query;
    let simTitle = 'Weather Simulation';

    if (typeof scenarioOrQuery === 'object' && scenarioOrQuery !== null) {
      if (scenarioOrQuery.district) {
        setActiveDistrict(scenarioOrQuery.district);
        setLatitude(scenarioOrQuery.latitude);
        setLongitude(scenarioOrQuery.longitude);
      }
      if (scenarioOrQuery.title) {
        simTitle = scenarioOrQuery.title;
      }
      // If explicit benchmark simulation scenario is selected (Puri Cyclone / Hyderabad Flood)
      if (
        scenarioOrQuery.id === 'scenario_cyclone_puri' || 
        scenarioOrQuery.id === 'scenario_flood_hyderabad' ||
        Boolean(scenarioOrQuery.isSimulation)
      ) {
        setAppMode('demo');
        localStorage.setItem('aakashavani_app_mode', 'demo');
        getEmergencyStatus(
          scenarioOrQuery.latitude || 19.8135, 
          scenarioOrQuery.longitude || 85.8312, 
          scenarioOrQuery.district || 'Puri',
          'demo'
        ).then((emer) => {
          setEmergencyData(emer);
          setIsEmergencyActive(Boolean(emer?.is_emergency_active));
        }).catch(() => {});
      } else {
        // Standard location query: evaluate cleanly in current mode
        getEmergencyStatus(
          scenarioOrQuery.latitude || latitude,
          scenarioOrQuery.longitude || longitude,
          scenarioOrQuery.district || activeDistrict,
          appMode
        ).then((emer) => {
          setEmergencyData(emer);
          if (appMode === 'live' && emer?.warning?.is_simulated) {
            setIsEmergencyActive(false);
          } else {
            setIsEmergencyActive(Boolean(emer?.is_emergency_active));
          }
        }).catch(() => {});
      }
    }

    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: simTitle,
      messages: [],
      createdAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveWorkspace('ask');

    setTimeout(() => {
      handleSendMessage(queryText, null, false, newId);
    }, 120);
  };

  // Delete Conversation
  const handleDeleteConversation = (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fresh = { id: `conv-${Date.now()}`, title: 'New Conversation', messages: [], createdAt: new Date().toISOString() };
        setActiveConversationId(fresh.id);
        return [fresh];
      }
      if (id === activeConversationId) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear All Chats
  const handleClearAllChats = () => {
    localStorage.removeItem('aakashavani_conversations');
    const fresh = { id: `conv-${Date.now()}`, title: 'New Conversation', messages: [], createdAt: new Date().toISOString() };
    setConversations([fresh]);
    setActiveConversationId(fresh.id);
  };

  // Export Conversation
  const handleExportConversation = () => {
    if (currentMessages.length === 0) {
      alert('No messages to export in current conversation.');
      return;
    }

    let report = `# AakashaVani (WeatherGPT) - Intelligence Report\n`;
    report += `Generated: ${new Date().toLocaleString('en-IN')}\n`;
    report += `Location: ${activeDistrict} (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})\n`;
    report += `====================================================\n\n`;

    currentMessages.forEach((msg, idx) => {
      const sender = msg.sender === 'user' ? 'Citizen' : 'AakashaVani AI';
      report += `### [${idx + 1}] ${sender}:\n${msg.text}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AakashaVani_${activeDistrict}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Send Message with deterministic conversation target ID
  const handleSendMessage = async (queryText, imageDataUrl = null, forcePush = false, targetConvId = null) => {
    if (!queryText && !imageDataUrl) return;

    if (isLoadingRef.current && !forcePush) {
      const queueItem = {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        query: queryText,
        imageData: imageDataUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessageQueue(prev => [...prev, queueItem]);
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    const userMsg = {
      sender: 'user',
      text: queryText || (imageDataUrl ? "Please analyze this attached photo for weather hazard or crop damage." : ""),
      imageUrl: imageDataUrl
    };

    const targetId = targetConvId || activeConversation?.id || activeConversationId;
    const targetConv = conversations.find(c => c.id === targetId) || activeConversation;
    const isFirst = (targetConv?.messages?.length || 0) === 0;
    const newTitle = isFirst ? (queryText ? queryText.slice(0, 32) : "Photo Analysis") : (targetConv?.title || "Weather Query");

    setConversations(prev => {
      const exists = prev.some(c => c.id === targetId);
      if (!exists) {
        const fresh = { id: targetId, title: newTitle, messages: [userMsg], createdAt: new Date().toISOString() };
        return [fresh, ...prev];
      }
      return prev.map(c => {
        if (c.id === targetId) {
          return {
            ...c,
            title: newTitle,
            messages: [...c.messages, userMsg]
          };
        }
        return c;
      });
    });

    try {
      const res = await sendChatMessage({
        query: queryText || "Please evaluate this photo for disaster or agricultural damage.",
        latitude: latitude,
        longitude: longitude,
        district: activeDistrict,
        language: currentLang,
        role: "universal_citizen",
        image_data: imageDataUrl,
        allow_training: allowAutoTraining
      });

      const assistantMsg = {
        sender: 'assistant',
        text: res.response_text,
        data: res
      };

      setConversations(prev => prev.map(c => {
        if (c.id === targetId) {
          return {
            ...c,
            messages: [...c.messages, assistantMsg]
          };
        }
        return c;
      }));

      if (res.location_changed && (res.specific_place || res.district)) {
        setActiveDistrict(res.specific_place || res.district);
        if (res.weather?.latitude && res.weather?.longitude) {
          setLatitude(res.weather.latitude);
          setLongitude(res.weather.longitude);
        }
      }

      const isEmer = Boolean(res.emergency?.is_emergency_active);
      const isSim = Boolean(res.emergency?.warning?.is_simulated);
      if (appMode === 'live' && isSim) {
        setIsEmergencyActive(false);
      } else {
        setIsEmergencyActive(isEmer);
      }
      if (res.emergency) {
        setEmergencyData(res.emergency);
      }
      return res;

    } catch (err) {
      console.error("Chat send error:", err);
      const errorMsg = {
        sender: 'assistant',
        text: "I'm having trouble connecting to the weather intelligence server. Please ensure the backend is running."
      };
      setConversations(prev => prev.map(c => {
        if (c.id === targetId) {
          return { ...c, messages: [...c.messages, errorMsg] };
        }
        return c;
      }));
      return null;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setMessageQueue(prev => {
        if (prev.length > 0) {
          const [nextItem, ...remaining] = prev;
          setTimeout(() => {
            handleSendMessage(nextItem.query, nextItem.imageData, true, targetId);
          }, 350);
          return remaining;
        }
        return prev;
      });
    }
  };

  const handleRemoveQueuedMessage = (id) => {
    setMessageQueue(prev => prev.filter(m => m.id !== id));
  };

  const handleForcePushQueuedMessage = (id) => {
    const target = messageQueue.find(m => m.id === id);
    if (target) {
      setMessageQueue(prev => prev.filter(m => m.id !== id));
      handleSendMessage(target.query, target.imageData, true);
    }
  };

  const handleClearQueue = () => {
    setMessageQueue([]);
  };

  // Low-bandwidth Handlers
  const handleRunSMS = async () => {
    const res = await simulateSMS('+919876543210', smsQuery);
    setSmsResult(res);
  };

  const handleRunIVR = async () => {
    const res = await simulateIVR('+919876543210', activeDistrict, currentLang);
    setIvrResult(res);
  };

  // Dedicated Standalone Full-Screen Login & Authentication Page (Matching User Reference)
  if (activeWorkspace === 'login') {
    return (
      <AuthPage
        initialTheme={theme}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onLoginSuccess={(user, token) => {
          setUserProfile(user);
          localStorage.setItem('aakashavani_user', JSON.stringify(user));
          if (token) localStorage.setItem('aakashavani_token', token);
          if (user?.district) setActiveDistrict(user.district);
          setActiveWorkspace('home');
        }}
        onBackToApp={() => setActiveWorkspace('home')}
      />
    );
  }

  // Dedicated Mobile Interface
  if (isMobileView) {
    return (
      <div className={`w-full h-full min-h-screen overflow-hidden ${theme === 'light' ? 'light-theme bg-[#F5F7F3]' : 'bg-[#080C14]'}`}>
        <PhoneSimulatorFrame
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          onExitToDesktop={() => setForceViewMode('desktop')}
          isMobileScreen={isMobileScreen}
        >
          <MobileApp
            district={activeDistrict}
            latitude={latitude}
            longitude={longitude}
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            isEmergencyActive={isEmergencyActive}
            emergencyData={emergencyData}
            onDetectGPS={handleDetectGPS}
            messages={currentMessages}
            isLoading={isLoading}
            onSendMessage={(msg, img) => {
              return handleSendMessage(msg, img);
            }}
            onOpenLiveVoice={() => setLiveVoiceOpen(true)}
            onClearChat={handleClearAllChats}
            onOpenDesktopMode={() => setForceViewMode('desktop')}
            onOpenSms={() => setSmsModalOpen(true)}
            onOpenIvr={() => setIvrModalOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            userProfile={userProfile}
            onLogout={() => {
              setUserProfile(null);
              localStorage.removeItem('aakashavani_user');
            }}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </PhoneSimulatorFrame>

        {/* Live 1-on-1 Hands-Free Voice Assistant Modal for Mobile */}
        <LiveVoiceModal
          isOpen={liveVoiceOpen}
          onClose={() => setLiveVoiceOpen(false)}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          currentLang={currentLang}
          activeDistrict={activeDistrict}
          currentMessages={currentMessages}
        />

        {/* Settings Modal for Mobile */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          appMode={appMode}
          onToggleMode={() => {
            const nextMode = appMode === 'live' ? 'demo' : 'live';
            setAppMode(nextMode);
            localStorage.setItem('aakashavani_app_mode', nextMode);
          }}
        />

        {/* 2G SMS Query Simulator Modal */}
        {smsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">2G SMS Fallback Simulator</h3>
                <button 
                  onClick={() => setSmsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Simulate low-bandwidth feature phone access via GSM cellular protocol.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  defaultValue={`MAUSAM ${activeDistrict.toUpperCase()}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  id="mobile-sms-input"
                />
                <button
                  onClick={async () => {
                    const val = document.getElementById('mobile-sms-input')?.value || `MAUSAM ${activeDistrict}`;
                    try {
                      const res = await simulateSMS(val);
                      alert(`[2G SMS Dispatched]\nTo: 567678\nResponse:\n${res.sms_reply}`);
                    } catch (e) {
                      alert('SMS simulation error');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Send Simulated GSM SMS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IVR Toll-Free Hotline Simulator Modal */}
        {ivrModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">IVR Toll-Free 1800-AAKASHA Hotline</h3>
                <button 
                  onClick={() => setIvrModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Simulating Kisan Call Center voice telephony query.
              </p>
              <button
                onClick={async () => {
                  try {
                    const res = await simulateIVR(activeDistrict, currentLang);
                    alert(`[IVR Voice Call Connected]\nAudio Script:\n${res.ivr_speech_script}`);
                  } catch (e) {
                    alert('IVR simulation error');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Dial Toll-Free Voice Call
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans transition-colors duration-200 ${
      theme === 'light' ? 'light-theme bg-[#F5F7F3] text-[#18251C]' : 'bg-[#080C14] text-slate-100'
    }`}>
      
      {/* Left Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAllChats={handleClearAllChats}
        onOpenSettings={() => setSettingsOpen(true)}
        userProfile={userProfile}
        activeDistrict={activeDistrict}
        onSelectScenario={handleSelectScenario}
        activeWorkspace={activeWorkspace}
        isEmergencyActive={isEmergencyActive}
        emergencyData={emergencyData}
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        onOpenSms={() => setSmsModalOpen(true)}
        onOpenIvr={() => setIvrModalOpen(true)}
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
        onOpenLocationPicker={() => setLocationModalOpen(true)}
        onSelectLocation={handleSelectLocation}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar with Canonical 4 Tabs */}
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeDistrict={activeDistrict}
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenVoice={() => setLiveVoiceOpen(true)}
          onDetectGPS={handleDetectGPS}
          onOpenLocationModal={() => setLocationModalOpen(true)}
          isGPSActive={isGPSActive}
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          isEmergencyActive={isEmergencyActive}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          userProfile={userProfile}
          appMode={appMode}
          onToggleAppMode={handleToggleAppMode}
          onToggleMobileMode={() => setForceViewMode('mobile')}
          isMobileMode={isMobileView}
          onOpenAuthModal={() => {
            if (!userProfile) setActiveWorkspace('login');
            else setAuthModalOpen(true);
          }}
        />

        {/* View 1: Home Dashboard */}
        {activeWorkspace === 'home' && (
          <HomeView
            latitude={latitude}
            longitude={longitude}
            district={activeDistrict}
            language={currentLang}
            onSelectLang={setCurrentLang}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            onNavigate={(tab) => setActiveWorkspace(tab)}
            onSendQuery={(query) => handleSendMessage(query)}
            onOpenVoice={() => setLiveVoiceOpen(true)}
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onOpenTelecom={() => setTelecomModalOpen(true)}
            onOpenSms={() => setSmsModalOpen(true)}
            onOpenIvr={() => setIvrModalOpen(true)}
            userProfile={userProfile}
            onOpenAuthModal={() => {
              if (!userProfile) setActiveWorkspace('login');
              else setAuthModalOpen(true);
            }}
            onOpenPhase5={() => setPhase5ModalOpen(true)}
            onOpenPhase8={() => setPhase8ModalOpen(true)}
            onOpenPhase9={() => setPhase9ModalOpen(true)}
          />
        )}

        {/* View 2: Ask AakashaVani (Conversational Intelligence) */}
        {activeWorkspace === 'ask' && (
          <>
            <ChatContainer
              messages={currentMessages}
              isLoading={isLoading}
              currentLang={currentLang}
              activeDistrict={activeDistrict}
              autoTTS={autoTTS}
              onQuickPrompt={(q) => handleSendMessage(q)}
            />

            <MessageQueueBar
              queue={messageQueue}
              onRemoveMessage={handleRemoveQueuedMessage}
              onForcePushMessage={handleForcePushQueuedMessage}
              onClearQueue={handleClearQueue}
            />

            <ChatInput
              onSendMessage={handleSendMessage}
              onOpenLiveVoice={() => setLiveVoiceOpen(true)}
              onSimulateSMS={() => setSmsModalOpen(true)}
              onSimulateIVR={() => setIvrModalOpen(true)}
              isLoading={isLoading}
              currentLang={currentLang}
            />
          </>
        )}

        {/* View 3: Full WebGIS Studio Map */}
        {activeWorkspace === 'map' && (
          <div className="flex-1 p-3 sm:p-4 h-full">
            <ErrorBoundary name="Full WebGIS Studio">
              <WebGISMap
                latitude={latitude}
                longitude={longitude}
                district={activeDistrict}
                isEmergencyMode={isEmergencyActive}
                emergencyResources={emergencyData?.emergency_resources || []}
                onCloseMap={() => setActiveWorkspace('home')}
                onOpenPhase4={() => setPhase4ModalOpen(true)}
                onOpenPhase7={() => setPhase7ModalOpen(true)}
                onOpenPhase11={() => setPhase11ModalOpen(true)}
                onOpenPhase13={() => setPhase13ModalOpen(true)}
                onOpenPhase15={() => setPhase15ModalOpen(true)}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* View 4: Verified Disaster Warnings & Alerts Center */}
        {activeWorkspace === 'alerts' && (
          <AlertsView
            latitude={latitude}
            longitude={longitude}
            district={activeDistrict}
            appMode={appMode}
            onOpenSms={() => setSmsModalOpen(true)}
            onOpenIvr={() => setIvrModalOpen(true)}
            onOpenPhase3={() => setPhase3ModalOpen(true)}
            onOpenPhase6={() => setPhase6ModalOpen(true)}
            onOpenPhase10={() => setPhase10ModalOpen(true)}
            onOpenPhase12={() => setPhase12ModalOpen(true)}
            onOpenPhase14={() => setPhase14ModalOpen(true)}
            onOpenPhase16={() => setPhase16ModalOpen(true)}
            onNavigate={(tab) => setActiveWorkspace(tab)}
          />
        )}

        {/* View 5: Dedicated Full Login / Auth Page */}
        {activeWorkspace === 'login' && (
          <div className="flex-1 overflow-y-auto">
            <AuthPage
              onLoginSuccess={(profile) => {
                setUserProfile(profile);
                if (profile?.district) setActiveDistrict(profile.district.split(',')[0].trim());
                setActiveWorkspace('home');
              }}
              onBackToApp={() => setActiveWorkspace('home')}
              initialTheme={theme}
              currentLang={currentLang}
              onLanguageChange={setCurrentLang}
            />
          </div>
        )}

        {/* View 6: Fallback 404 Unmapped Sector Page */}
        {!['home', 'ask', 'map', 'alerts', 'login'].includes(activeWorkspace) && (
          <NotFoundPage onNavigateHome={() => setActiveWorkspace('home')} />
        )}

      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        theme={theme}
        setTheme={setTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        activeDistrict={activeDistrict}
        latitude={latitude}
        longitude={longitude}
        onDetectGPS={handleDetectGPS}
        isGPSActive={isGPSActive}
        autoTTS={autoTTS}
        setAutoTTS={setAutoTTS}
        allowAutoTraining={allowAutoTraining}
        setAllowAutoTraining={setAllowAutoTraining}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onClearAllChats={handleClearAllChats}
        onExportConversation={handleExportConversation}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onAuthSuccess={(profile) => {
          if (profile.district) setActiveDistrict(profile.district.split(',')[0].trim());
        }}
      />

      {/* Live 1-on-1 Hands-Free Voice Assistant Modal */}
      <LiveVoiceModal
        isOpen={liveVoiceOpen}
        onClose={() => setLiveVoiceOpen(false)}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        currentLang={currentLang}
        activeDistrict={activeDistrict}
        currentMessages={currentMessages}
      />

      {/* Phase 2: National Telecom & Multi-Channel Broadcast Modal */}
      <Phase2TelecomModal
        isOpen={telecomModalOpen}
        onClose={() => setTelecomModalOpen(false)}
        district={activeDistrict}
        currentLang={currentLang}
      />

      {/* Phase 3: Autonomous Village IoT Sirens & Drone Survey Modal */}
      <Phase3DroneSirenModal
        isOpen={phase3ModalOpen}
        onClose={() => setPhase3ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 4: WebGIS Studio & Doppler Radar Nowcasting Modal */}
      <Phase4WebGISModal
        isOpen={phase4ModalOpen}
        onClose={() => setPhase4ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 5: Resilient Telecom Gateway & USSD Engine Modal */}
      <Phase5TelecomGatewayModal
        isOpen={phase5ModalOpen}
        onClose={() => setPhase5ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 6: Multi-Agent Swarm & Incident Command Modal */}
      <Phase6AgentSwarmModal
        isOpen={phase6ModalOpen}
        onClose={() => setPhase6ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 7: INSAT-3DS Space Satellite & Cyclone ADT Modal */}
      <Phase7SatelliteSpaceModal
        isOpen={phase7ModalOpen}
        onClose={() => setPhase7ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 8: Decentralized Edge AWS Mesh & Smart Contracts Modal */}
      <Phase8EdgeMeshModal
        isOpen={phase8ModalOpen}
        onClose={() => setPhase8ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 9: Offline Embedded Edge-AI & SLM Studio Modal */}
      <Phase9OfflineAIModal
        isOpen={phase9ModalOpen}
        onClose={() => setPhase9ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 10: WMO WIS 2.0 & Sovereign EOC War-Room Modal */}
      <Phase10WmoEocModal
        isOpen={phase10ModalOpen}
        onClose={() => setPhase10ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 11: INCOIS Ocean Buoys & Tsunami Warning Modal */}
      <Phase11OceanBuoyModal
        isOpen={phase11ModalOpen}
        onClose={() => setPhase11ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 12: Quantum-Resilient Disaster Infrastructure Modal */}
      <Phase12QuantumGridModal
        isOpen={phase12ModalOpen}
        onClose={() => setPhase12ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 13: IITM Damini Lightning Detection & EFM Studio Modal */}
      <Phase13LightningModal
        isOpen={phase13ModalOpen}
        onClose={() => setPhase13ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 14: PINN Flash Flood & Urban Digital Twin Modal */}
      <Phase14FlashFloodPinnModal
        isOpen={phase14ModalOpen}
        onClose={() => setPhase14ModalOpen(false)}
        district={activeDistrict}
      />

      {/* Phase 15: Himalayan Cryosphere & GLOF Radar Modal */}
      <Phase15CryosphereGlofModal
        isOpen={phase15ModalOpen}
        onClose={() => setPhase15ModalOpen(false)}
        region="Eastern Himalayas"
      />

      {/* Phase 16: Sovereign National Digital Twin & Command Hub Modal */}
      <Phase16NationalTwinModal
        isOpen={phase16ModalOpen}
        onClose={() => setPhase16ModalOpen(false)}
      />

      {/* 2G SMS Query Simulator Modal */}
      {smsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">2G SMS Fallback Simulator</h3>
              </div>
              <button 
                onClick={() => { setSmsModalOpen(false); setSmsResult(null); }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulates low-bandwidth 2G feature phone SMS queries (160 character limit) when data network is down.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">SMS Body (Format: MAUSAM &lt;DISTRICT&gt;)</label>
              <input
                type="text"
                value={smsQuery}
                onChange={(e) => setSmsQuery(e.target.value)}
                placeholder="e.g. MAUSAM WARDHA or MAUSAM PURI"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            <button
              onClick={handleRunSMS}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
            >
              Dispatch Simulated SMS
            </button>

            {smsResult && (
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Incoming SMS Response:</span>
                  <span className="text-cyan-400 font-mono font-bold">{smsResult.char_count}/160 chars</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed border border-white/5">
                  {smsResult.sms_response}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Automated IVR Hotline Simulator Modal */}
      {ivrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">IVR Voice Hotline Simulator</h3>
              </div>
              <button 
                onClick={() => { setIvrModalOpen(false); setIvrResult(null); }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulates automated toll-free telephone hotline for non-smartphone users with regional audio playback.
            </p>

            <button
              onClick={handleRunIVR}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Initiate Simulated Toll-Free Call ({activeDistrict})
            </button>

            {ivrResult && (
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Spoken Telephony Script:</span>
                  <span className="text-emerald-400 font-mono font-bold">STATUS: {ivrResult.ivr_status}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 text-slate-200 text-xs leading-relaxed border border-white/5">
                  "{ivrResult.audio_script}"
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">DTMF Keypad Menu:</span>
                  <div className="grid grid-cols-1 gap-1 text-[11px] font-mono text-cyan-300">
                    <div>[1] Agromet Crop Advisory</div>
                    <div>[2] Disaster Helplines (112 / 1077)</div>
                    <div>[3] Live AWS Station Telemetry</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Select Custom Location Modal */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentDistrict={activeDistrict}
        currentLat={latitude}
        currentLon={longitude}
        onSelectLocation={handleSelectLocation}
      />

    </div>
  );
}
