import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Sun, 
  Moon, 
  Monitor, 
  Smartphone, 
  Maximize2 
} from 'lucide-react';

export default function PhoneSimulatorFrame({
  children,
  theme = 'dark',
  onToggleTheme,
  onExitToDesktop,
  isMobileScreen = false
}) {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [batteryLevel, setBatteryLevel] = useState(98);

  // Live Clock for the Status Bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // If on actual mobile device (< 768px), render 100% full screen with native feel
  if (isMobileScreen) {
    return (
      <div className="w-full h-[100dvh] flex flex-col bg-[#F5F8F5] dark:bg-[#070B14] overflow-hidden">
        {children}
      </div>
    );
  }

  // Desktop Simulator View: Ultra-realistic iPhone 16 Pro Titanium Chassis
  return (
    <div className="w-full min-h-screen bg-[#DDE3DD] dark:bg-[#03060B] py-4 sm:py-6 px-2 flex flex-col items-center justify-center transition-colors duration-200 relative overflow-x-hidden">
      
      {/* Top Floating Simulator Control Bar */}
      <header className="mb-4 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-white/10 text-xs font-black text-slate-800 dark:text-white">
          <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>iPhone 16 Pro Simulator</span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        )}

        {/* Exit to Desktop Workstation Button */}
        <button
          onClick={onExitToDesktop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit to Desktop</span>
        </button>
      </header>

      {/* Realistic Phone Device Container */}
      <div className="relative group">
        
        {/* Left Hardware Buttons: Action Button & Volume Rockers */}
        <div className="absolute -left-[14px] top-24 w-[3.5px] h-7 bg-[#28292C] dark:bg-[#323337] rounded-l-sm shadow-md"></div>
        <div className="absolute -left-[14px] top-36 w-[3.5px] h-12 bg-[#28292C] dark:bg-[#323337] rounded-l-sm shadow-md"></div>
        <div className="absolute -left-[14px] top-52 w-[3.5px] h-12 bg-[#28292C] dark:bg-[#323337] rounded-l-sm shadow-md"></div>

        {/* Right Hardware Button: Side / Power Button */}
        <div className="absolute -right-[14px] top-36 w-[3.5px] h-16 bg-[#28292C] dark:bg-[#323337] rounded-r-sm shadow-md"></div>

        {/* Outer Titanium Chassis Frame */}
        <div className="w-[390px] sm:w-[412px] h-[830px] sm:h-[860px] bg-[#1C1C1F] dark:bg-[#18181B] rounded-[56px] p-[10px] shadow-[0_25px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.15),0_0_0_2px_rgba(0,0,0,0.8)] border-2 border-[#38383E] dark:border-[#2C2C32] relative flex flex-col transition-all">
          
          {/* Inner Screen Display (Glossy OLED Border) */}
          <div className="relative w-full h-full rounded-[46px] overflow-hidden bg-[#F5F8F5] dark:bg-[#070B14] flex flex-col shadow-inner select-none border border-black/30">
            
            {/* iOS Top Status Bar (Live Clock, Dynamic Island, Battery) */}
            <div className="w-full h-11 px-6 pt-2 flex items-center justify-between z-40 bg-transparent text-slate-900 dark:text-white shrink-0 pointer-events-none select-none">
              
              {/* Left: Time */}
              <div className="w-16 text-xs font-semibold tracking-tight text-center pl-1 font-mono">
                {currentTime}
              </div>

              {/* Center: Interactive Dynamic Island Pill */}
              <div className="w-28 h-7 bg-black rounded-full shadow-md flex items-center justify-between px-2.5 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
                {/* Front Camera Lens Reflection */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#08101E] border border-white/10 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#1A365D]"></div>
                </div>
                {/* FaceID Sensor Dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#0F172A]"></div>
              </div>

              {/* Right: Cellular Signal, WiFi & Battery Icons */}
              <div className="w-16 flex items-center justify-end gap-1.5 pr-1">
                {/* 4-bar cellular */}
                <div className="flex items-end gap-[1.5px] h-2.5">
                  <div className="w-[2.5px] h-1 bg-current rounded-[0.5px]"></div>
                  <div className="w-[2.5px] h-1.5 bg-current rounded-[0.5px]"></div>
                  <div className="w-[2.5px] h-2 bg-current rounded-[0.5px]"></div>
                  <div className="w-[2.5px] h-2.5 bg-current rounded-[0.5px]"></div>
                </div>

                {/* WiFi Wave */}
                <Wifi className="w-3.5 h-3.5" />

                {/* iOS Battery Capsule */}
                <div className="flex items-center gap-[1px]">
                  <div className="w-5 h-2.5 border border-current rounded-[3px] p-[1px] flex items-center">
                    <div 
                      style={{ width: `${batteryLevel}%` }} 
                      className="h-full bg-current rounded-[1px]"
                    ></div>
                  </div>
                  <div className="w-[1.5px] h-1 bg-current rounded-r-[1px]"></div>
                </div>
              </div>

            </div>

            {/* Main Application Viewport */}
            <div className="flex-1 w-full overflow-hidden flex flex-col relative">
              {children}
            </div>

            {/* iOS Bottom Home Indicator Bar */}
            <div className="w-full h-5 bg-transparent flex items-center justify-center shrink-0 pointer-events-none z-40 pb-1">
              <div className="w-32 h-1 bg-slate-400/80 dark:bg-white/60 rounded-full shadow-sm"></div>
            </div>

          </div>

          {/* Speaker Ear-piece Slit at very top bezel */}
          <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-14 h-1 bg-[#121214] rounded-full"></div>

        </div>

      </div>

    </div>
  );
}
