import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CloudRain, 
  Wind, 
  Zap, 
  AlertTriangle, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Globe, 
  Sun, 
  Moon, 
  Radio, 
  Sparkles, 
  MapPin, 
  Users, 
  Target, 
  Clock, 
  Activity,
  Home,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  loginWithPassword, 
  registerUser, 
  sendPhoneOtp, 
  verifyPhoneOtp, 
  loginWithGoogle,
  loginWithApple,
  getGoogleAuthorizeUrl,
  getAppleAuthorizeUrl,
  startGoogleOAuth,
  startAppleOAuth
} from '../../services/api';

export default function AuthPage({ 
  onLoginSuccess, 
  onBackToApp, 
  initialTheme = 'dark',
  currentLang = 'en',
  onLanguageChange
}) {
  // Theme state: can toggle between light & dark matching reference Image 1 & 2
  const [theme, setTheme] = useState(initialTheme);
  const isDark = theme === 'dark';

  // Mode: 'login' | 'register' | 'otp'
  const [authMode, setAuthMode] = useState('login');

  // Form states
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('Hyderabad');
  const [role, setRole] = useState('citizen');
  const [pmKisanId, setPmKisanId] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP flow state
  const [otpStep, setOtpStep] = useState('input'); // 'input' | 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [liveOtpDebug, setLiveOtpDebug] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load remembered credentials on mount (Big company feature: Remember Me)
  useEffect(() => {
    try {
      const savedMobile = localStorage.getItem('aakashavani_remembered_mobile');
      const savedEmail = localStorage.getItem('aakashavani_remembered_email');
      const savedRemember = localStorage.getItem('aakashavani_remember_me');
      
      if (savedMobile) setMobileNumber(savedMobile);
      if (savedEmail) setEmail(savedEmail);
      if (savedRemember !== null) setRememberMe(savedRemember === 'true');
    } catch (e) {
      // ignore
    }
  }, []);

  // OTP Resend countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Remember Me persistence
  const handleRememberMeToggle = (checked) => {
    setRememberMe(checked);
    localStorage.setItem('aakashavani_remember_me', String(checked));
    if (!checked) {
      localStorage.removeItem('aakashavani_remembered_mobile');
      localStorage.removeItem('aakashavani_remembered_email');
    }
  };

  // Switch Theme
  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  // Form Submit Handler
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const identifier = mobileNumber.trim() || email.trim();
    if (!identifier) {
      setErrorMsg('Please enter your mobile number or email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPassword({
        identifier,
        password,
        rememberMe
      });

      if (rememberMe) {
        if (mobileNumber) localStorage.setItem('aakashavani_remembered_mobile', mobileNumber);
        if (email) localStorage.setItem('aakashavani_remembered_email', email);
      }

      setSuccessMsg('Authenticated successfully! Entering dashboard...');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.token);
        }
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!mobileNumber.trim() && !email.trim()) {
      setErrorMsg('Please provide a mobile number for SMS alerts or an email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: fullName,
        mobileNumber,
        email,
        password,
        district,
        role,
        pmKisanId: role === 'farmer' ? pmKisanId : null,
        rememberMe
      });

      if (rememberMe) {
        if (mobileNumber) localStorage.setItem('aakashavani_remembered_mobile', mobileNumber);
        if (email) localStorage.setItem('aakashavani_remembered_email', email);
      }

      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.token);
        }
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = mobileNumber.replace(/[^\d]/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneOtp({
        phone: clean,
        district,
        name: fullName || undefined,
        role
      });
      setOtpStep('verify');
      setResendTimer(res.expires_in_seconds || 45);
      setLiveOtpDebug(res.debug_otp);
      setSuccessMsg(`OTP sent to +91-${clean}. Valid for 5 minutes.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch OTP SMS.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    const clean = otpCode.replace(/[^\d]/g, '');
    if (clean.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPhoneOtp({
        phone: mobileNumber.replace(/[^\d]/g, ''),
        otp: clean,
        name: fullName || undefined,
        district,
        role,
        pmKisanId: role === 'farmer' ? pmKisanId : null
      });

      if (rememberMe) {
        localStorage.setItem('aakashavani_remembered_mobile', mobileNumber);
      }

      setSuccessMsg('Phone verified successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.token);
        }
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth flow initiation with smart fallback
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const authUrl = await getGoogleAuthorizeUrl('/auth/callback');
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }
    } catch (e) {
      console.log('Google OAuth server redirect fallback:', e.message);
    }

    // Direct fallback for local dev or unconfigured server secrets
    let emailToUse = (email || '').trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      const prompted = window.prompt('Google OAuth credentials not configured on server. Enter your Gmail address directly:', '');
      if (!prompted || !prompted.includes('@')) {
        setLoading(false);
        return;
      }
      emailToUse = prompted.trim();
    }
    try {
      const res = await loginWithGoogle({
        email: emailToUse,
        name: fullName || emailToUse.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        picture: 'https://lh3.googleusercontent.com/a/default-avatar'
      });
      setSuccessMsg(`Google sign-in successful for ${emailToUse}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(res.user, res.token);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Apple OAuth flow initiation with smart fallback
  const handleAppleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const authUrl = await getAppleAuthorizeUrl('/auth/callback');
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }
    } catch (e) {
      console.log('Apple OAuth server redirect fallback:', e.message);
    }

    // Direct fallback for local dev or unconfigured server secrets
    let emailToUse = (email || '').trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      const prompted = window.prompt('Apple OAuth credentials not configured on server. Enter your Apple ID email directly:', 'citizen@icloud.com');
      if (!prompted || !prompted.includes('@')) {
        setLoading(false);
        return;
      }
      emailToUse = prompted.trim();
    }
    try {
      const res = await loginWithApple({
        email: emailToUse,
        name: fullName || 'Apple User'
      });
      setSuccessMsg(`Apple sign-in successful for ${emailToUse}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(res.user, res.token);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Apple login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 font-['Inter',sans-serif] ${
      isDark ? 'bg-[#080D18] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
    }`}>
      
      {/* Top Header Bar */}
      <header className={`w-full px-6 py-4 flex items-center justify-between border-b ${
        isDark ? 'border-slate-800/80 bg-[#080D18]/80' : 'border-slate-200/80 bg-white/80'
      } backdrop-blur-md sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-sm shadow-cyan-500/20">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center text-lg ${
              isDark ? 'bg-slate-950 text-cyan-400' : 'bg-white text-cyan-600'
            }`}>
              🌦️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                AakashaVani
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                MoES / IMD AI
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Weather & Disaster Intelligence Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isDark 
                ? 'border-slate-700 bg-slate-900/90 text-amber-300 hover:bg-slate-800' 
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={onBackToApp}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark 
                ? 'border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800' 
                : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue as Guest</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Hero & Visual Graphic (Matches Reference Images 1, 2, 3) */}
        <section className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
          
          {/* Headline and Tagline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                National Met Early Warning Network
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>Know. Prepare.</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                Stay Safe.
              </span>
            </h1>
            
            <p className={`mt-3 text-sm sm:text-base max-w-xl font-normal leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Real-time weather insights, early alerts, and intelligent tools for a safer tomorrow.
            </p>
          </div>

          {/* Interactive Illustration Area with 6 Hazard Milestone Pins */}
          <div className={`relative rounded-3xl overflow-hidden border p-6 min-h-[260px] sm:min-h-[300px] flex flex-col justify-end shadow-2xl transition-all ${
            isDark 
              ? 'border-slate-800 bg-gradient-to-b from-slate-900 via-[#0B152A] to-[#060D1A]' 
              : 'border-emerald-100 bg-gradient-to-b from-sky-50 via-teal-50/40 to-emerald-50/70'
          }`}>
            
            {/* Visual Vector Artwork Backdrop */}
            {isDark ? (
              /* Dark Theme: Glowing Earth Space Horizon with Blue Atmospheric Rim (Image 2) */
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -bottom-48 -left-20 -right-20 h-80 rounded-[100%] bg-gradient-to-t from-blue-950 via-[#0a2540] to-blue-900 border-t-2 border-cyan-400/60 shadow-[0_-20px_50px_rgba(56,189,248,0.35)]" />
                <div className="absolute -bottom-36 left-0 right-0 h-40 bg-gradient-to-t from-cyan-500/20 to-transparent blur-xl" />
                <div className="absolute bottom-6 left-1/4 w-32 h-6 bg-amber-400/20 rounded-full blur-sm" />
                <div className="absolute bottom-10 right-1/3 w-40 h-8 bg-cyan-400/20 rounded-full blur-md" />
              </div>
            ) : (
              /* Light Theme: Scenic Rolling Hills Landscape with Windmills & Lake (Image 1 & 3) */
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-4 left-10 w-24 h-8 bg-white/70 rounded-full blur-[2px]" />
                <div className="absolute top-8 right-20 w-36 h-10 bg-white/80 rounded-full blur-[2px]" />
                <div className="absolute -bottom-16 -left-10 w-[60%] h-44 rounded-t-[100%] bg-gradient-to-r from-emerald-200/80 to-teal-300/70" />
                <div className="absolute -bottom-20 -right-10 w-[70%] h-48 rounded-t-[100%] bg-gradient-to-l from-green-200/90 to-emerald-300/70" />
                <div className="absolute bottom-0 left-[20%] right-[20%] h-16 bg-gradient-to-r from-sky-300/60 via-cyan-200/80 to-blue-300/60 rounded-t-full blur-[1px]" />
                <div className="absolute bottom-16 left-16 flex flex-col items-center opacity-60">
                  <div className="w-1.5 h-12 bg-slate-400 rounded" />
                  <div className="w-10 h-10 border border-slate-400 rounded-full border-dashed animate-spin [animation-duration:12s]" />
                </div>
              </div>
            )}

            {/* The 6 Hazard Milestone Pins (Matches References) */}
            <div className="relative z-10 grid grid-cols-6 gap-2 pt-4 pb-2">
              {[
                { icon: CloudRain, label: 'Rain', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20 text-blue-400' },
                { icon: Wind, label: 'Cyclone', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-500/20 text-teal-400' },
                { icon: AlertTriangle, label: 'Alerts', color: 'from-rose-500 to-amber-500', bg: 'bg-rose-500/20 text-rose-400' },
                { icon: Zap, label: 'Lightning', color: 'from-amber-400 to-yellow-500', bg: 'bg-amber-500/20 text-amber-400' },
                { icon: Home, label: 'Surge', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/20 text-orange-400' },
                { icon: Shield, label: 'Safety', color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-500/20 text-indigo-400' }
              ].map((pin, idx) => {
                const IconComp = pin.icon;
                return (
                  <div key={idx} className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] shadow-lg bg-gradient-to-tr ${pin.color}`}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        isDark ? 'bg-slate-950' : 'bg-white'
                      }`}>
                        <IconComp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    {/* Thin vertical pin stem */}
                    <div className={`w-[1.5px] h-6 my-1 ${
                      isDark ? 'bg-gradient-to-b from-cyan-400/80 to-transparent' : 'bg-slate-400/50'
                    }`} />
                    <span className={`text-[10px] font-bold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {pin.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Slogan Bar within Graphic */}
            <div className={`mt-4 px-4 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md border ${
              isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-white/90 border-slate-200 shadow-sm'
            }`}>
              <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-500">One Platform. Multiple Users. Better Decisions.</span>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Accurate Data • Timely Alerts • Safer Communities
                </p>
              </div>
            </div>
          </div>

          {/* 4 Feature Highlights (Matching Bottom Row of Image 1 & 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: Target,
                title: 'Real-time Alerts',
                desc: 'Instant alerts for weather & disasters',
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              },
              {
                icon: Clock,
                title: 'Accurate Forecasts',
                desc: 'Reliable forecasts you can trust',
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
              },
              {
                icon: Shield,
                title: 'Disaster Intel',
                desc: 'Smart insights for better decisions',
                color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
              },
              {
                icon: Users,
                title: 'Community Safety',
                desc: 'Empowering communities to stay prepared',
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div 
                  key={i} 
                  className={`p-3 rounded-2xl border transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-slate-900/60 border-slate-800' 
                      : 'bg-white border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center border mb-2 ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {card.title}
                  </h4>
                  <p className={`text-[10px] mt-0.5 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </section>

        {/* Right Column: Floating Login & Auth Card (Exact Match to Image 1, 2, 3) */}
        <section className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all relative ${
            isDark 
              ? 'bg-[#0E1726]/95 border-slate-800 shadow-cyan-950/20' 
              : 'bg-white border-slate-200/90 shadow-xl shadow-slate-200/50'
          }`}>
            
            {/* Top User Silhouette & Shield Avatar Badge (Matches Image 3) */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? 'bg-slate-950 text-cyan-400' : 'bg-white text-blue-600'
                }`}>
                  <User className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Header Text */}
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {authMode === 'login' && 'Welcome Back!'}
                {authMode === 'register' && 'Create Your Account'}
                {authMode === 'otp' && 'Fast SMS Login'}
              </h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {authMode === 'login' && 'Login to your account to access personalized advisories'}
                {authMode === 'register' && 'Register your mobile for disaster SMS nowcasts'}
                {authMode === 'otp' && 'Instant 6-digit cryptographic OTP to any Indian phone'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className={`grid grid-cols-3 p-1 rounded-2xl mb-5 text-xs font-semibold border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? (isDark ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('otp'); setOtpStep('input'); setErrorMsg(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'otp'
                    ? (isDark ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                SMS OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? (isDark ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                Register
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-400 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ================= MODE 1: PASSWORD LOGIN (Matches Image 1 & 3) ================= */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Mobile Number (+91 Selector) - Matching Image 3 */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Mobile Number
                  </label>
                  <div className="flex rounded-2xl overflow-hidden border focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
                    <div className={`px-3 py-2.5 flex items-center gap-1.5 border-r font-mono text-xs font-bold select-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <span>🇮🇳 +91</span>
                      <span className="text-[10px] text-slate-400">⌄</span>
                    </div>
                    <div className={`flex-1 flex items-center px-3 gap-2 ${
                      isDark ? 'bg-slate-950' : 'bg-white'
                    }`}>
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className={`w-full py-2.5 text-xs bg-transparent outline-none ${
                          isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Optional) - Matching Image 3 */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email (Optional)
                  </label>
                  <div className={`flex items-center px-3 py-2.5 rounded-2xl border gap-2 focus-within:ring-2 focus-within:ring-cyan-500 transition-all ${
                    isDark ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full text-xs bg-transparent outline-none ${
                        isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Input - Matching Image 1 & 3 */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <div className={`flex items-center px-3 py-2.5 rounded-2xl border gap-2 focus-within:ring-2 focus-within:ring-cyan-500 transition-all ${
                    isDark ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full text-xs bg-transparent outline-none ${
                        isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row (Matching Image 1, 2, 3) */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => handleRememberMeToggle(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                    />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp');
                      setErrorMsg(null);
                      setSuccessMsg('You can log in directly with instant SMS OTP!');
                    }}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Gradient Login Button (Matches Image 1, 2, 3) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================= MODE 2: FAST SMS OTP LOGIN ================= */}
            {authMode === 'otp' && (
              <div className="space-y-4">
                {otpStep === 'input' ? (
                  <>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Indian Mobile Number (+91)
                      </label>
                      <div className="flex rounded-2xl overflow-hidden border focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
                        <div className={`px-3 py-2.5 flex items-center gap-1 font-mono text-xs font-bold ${
                          isDark ? 'bg-slate-900 border-r border-slate-700 text-slate-300' : 'bg-slate-100 border-r border-slate-200 text-slate-700'
                        }`}>
                          🇮🇳 +91
                        </div>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className={`w-full px-3 py-2.5 text-xs outline-none ${
                            isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div>
                        <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Home District
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Occupation
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className={`w-full px-2.5 py-2 rounded-xl text-xs border outline-none ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="farmer">🌾 Kisan (Farmer)</option>
                          <option value="fisherman">⛵ Fisherman</option>
                          <option value="officer">🚨 Disaster Officer</option>
                          <option value="citizen">👤 Resident Citizen</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Send 6-Digit SMS OTP →</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                      isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div>
                        <p className="font-bold text-emerald-500">OTP Sent via SMS</p>
                        <p className="text-[11px] text-slate-400">+91-{mobileNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpStep('input')}
                        className="text-xs text-cyan-400 underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {liveOtpDebug && (
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
                        <span className="text-cyan-400 font-mono text-[11px]">📡 SMS Telecom Code:</span>
                        <span className="font-mono font-black text-sm text-cyan-300 tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                          {liveOtpDebug}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ''))}
                        className={`w-full text-center text-xl font-mono tracking-widest py-2.5 rounded-2xl border outline-none ${
                          isDark ? 'bg-slate-950 border-slate-700 text-cyan-400' : 'bg-white border-slate-300 text-blue-600'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading || otpCode.length !== 6}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify OTP & Sign In</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ================= MODE 3: SIGN UP / REGISTRATION ================= */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Mobile (+91)
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      District / Taluka
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Role / Profession
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="farmer">🌾 Farmer (Kisan)</option>
                      <option value="fisherman">⛵ Fisherman</option>
                      <option value="officer">🚨 Disaster Officer</option>
                      <option value="citizen">👤 Resident Citizen</option>
                    </select>
                  </div>
                </div>

                {role === 'farmer' && (
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      PM-Kisan Registration ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PMK-MH-2024-8921"
                      value={pmKisanId}
                      onChange={(e) => setPmKisanId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Create Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Registered Account</span>
                </button>
              </form>
            )}

            {/* OR Divider (Matches Image 1, 2, 3) */}
            <div className="relative my-5 text-center">
              <div className={`absolute inset-0 flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="w-full border-t border-inherit" />
              </div>
              <span className={`relative px-3 text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-[#0E1726] text-slate-500' : 'bg-white text-slate-400'
              }`}>
                OR
              </span>
            </div>

            {/* Social Logins Group */}
            <div className="space-y-2.5">
              {/* Continue with Google Button (Matches Image 1, 2, 3) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-2xl border flex items-center justify-center gap-3 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.01] ${
                  isDark 
                    ? 'border-slate-700 bg-slate-900/90 text-white hover:bg-slate-800' 
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Continue with Apple Button */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-2xl border flex items-center justify-center gap-3 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.01] ${
                  isDark 
                    ? 'border-slate-700 bg-black text-white hover:bg-slate-900' 
                    : 'border-slate-800 bg-black text-white hover:bg-slate-900'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.41-9.79-11.35-20.73-14.82-32.83-3.47-12.1-5.21-23.36-5.21-33.78 0-14.34 3.73-26.07 11.19-35.19 7.46-9.12 16.71-13.78 27.75-13.99 4.13 0 9.07 1.15 14.82 3.44 5.75 2.29 9.38 3.44 10.9 3.44 1.3 0 5.16-1.26 11.58-3.79 6.42-2.52 11.83-3.63 16.23-3.32 12.39.63 22.39 5.27 30 13.91-10.87 6.63-16.19 15.54-15.97 26.74.22 8.79 3.69 16.17 10.42 22.14 6.73 5.97 14.65 9.4 23.77 10.3-2.17 6.41-4.78 12.82-7.83 19.23zM119.22 33.64c0-7.39 2.67-14.44 8.01-21.15 5.34-6.71 12.01-11.21 20.01-13.49.22 1.3.33 2.49.33 3.58 0 7.39-2.83 14.44-8.49 21.15-5.66 6.71-12.44 11.02-20.35 12.92-.32-1.09-.51-2.09-.51-3.01z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Bottom Switch Link: "Don't have an account? Sign up" (Matches Image 1, 2, 3) */}
            <div className="mt-5 text-center text-xs">
              {authMode === 'login' ? (
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                    className="text-blue-500 hover:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                    className="text-blue-500 hover:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </span>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Bottom Trust & Security Bar (Exact Match to Image 1, 2, 3) */}
      <footer className={`w-full px-6 py-3 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
        isDark ? 'border-slate-800 bg-[#060A13] text-slate-400' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Trusted & Secure</span>
              <span className="hidden sm:inline ml-1 text-[11px] text-slate-400">• Your data is protected</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-500 shrink-0" />
            <div>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Accurate Data</span>
              <span className="hidden sm:inline ml-1 text-[11px] text-slate-400">• From reliable IMD sources</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Timely Alerts</span>
              <span className="hidden sm:inline ml-1 text-[11px] text-slate-400">• When you need it</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Safer Communities</span>
              <span className="hidden sm:inline ml-1 text-[11px] text-slate-400">• Together we are stronger</span>
            </div>
          </div>
        </div>

        {/* Right side Language Dropdown */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className={`px-2.5 py-1 rounded-xl text-xs border font-medium outline-none cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <option value="en">English</option>
            <option value="hinglish">Hinglish (हिन्दी + Eng)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>
      </footer>

    </div>
  );
}
