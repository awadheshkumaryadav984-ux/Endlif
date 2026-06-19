import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ChevronRight, 
  Timer, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Radio, 
  Lock, 
  Eye, 
  Cpu, 
  Smartphone,
  Award
} from 'lucide-react';
import { Screen } from '../types';

interface HomeViewProps {
  setScreen: (screen: Screen) => void;
  onSosTrigger: () => void;
  lastCheckInTime: string;
  setLastCheckInTime: (time: string) => void;
}

export default function HomeView({ setScreen, onSosTrigger, lastCheckInTime, setLastCheckInTime }: HomeViewProps) {
  const [isSafeConfirmed, setIsSafeConfirmed] = useState(false);
  const [resetCountdown, setResetCountdown] = useState({ hrs: 12, mins: 30 });
  const [tickerTime, setTickerTime] = useState<string>('00:00:00');
  const [carrierUptime, setCarrierUptime] = useState<string>('99.98%');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time ticking clock for high-stakes futuristic status monitoring
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTickerTime(now.toLocaleTimeString([], { hour12: false }));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Check once-a-day "I'm Safe" lock constraint
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const savedDate = localStorage.getItem('endlif_last_safe_confirm_date');
    if (savedDate === todayStr) {
      setIsSafeConfirmed(true);
    }

    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setResetCountdown({ hrs: h, mins: m });
    };

    calculateTimeUntilMidnight();
    const cdTimer = setInterval(calculateTimeUntilMidnight, 45000);
    return () => clearInterval(cdTimer);
  }, []);

  // SOS button press-hold handler inside
  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    setHoldProgress(0);
    
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current!);
          onSosTrigger();
          return 100;
        }
        return prev + 8;
      });
    }, 60);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    // Fade out progress quickly
    const fadeOut = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev <= 0) {
          clearInterval(fadeOut);
          return 0;
        }
        return prev - 25;
      });
    }, 20);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Clicking SOS triggers immediately for buttery-smooth emergency responses!
  const handleImmediateSosClick = () => {
    onSosTrigger();
  };

  // Safely record user biometric lock
  const handleConfirmSafe = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem('endlif_last_safe_confirm_date', todayStr);
    setIsSafeConfirmed(true);

    const now = new Date();
    const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCheckInTime(stamp);
    
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 30, 40]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-6 pb-26 max-w-[600px] mx-auto w-full space-y-6 mt-16 text-slate-800"
    >
      {/* Dynamic Cyber Header Grid */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-[20px] p-4 text-left shadow-2xs relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-slate-400">ONLINE</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Telemetry Clock</p>
          <p className="text-xl font-black font-mono text-slate-900 tracking-tight mt-1">{tickerTime}</p>
          <p className="text-[8px] font-mono text-indigo-505/90 font-bold mt-1 uppercase flex items-center gap-0.5">
            <Globe className="w-2.5 h-2.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} /> GPS Sync Linked
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-[20px] p-4 text-left shadow-2xs relative overflow-hidden">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Carrier Signal</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-xl font-black text-slate-900 font-mono">ACTIVE</p>
            <span className="text-[9px] font-mono text-emerald-600 font-bold">{carrierUptime}</span>
          </div>
          <p className="text-[8px] font-mono text-rose-500/90 font-bold mt-1 uppercase flex items-center gap-0.5">
            <Radio className="w-2.5 h-2.5 text-rose-500 animate-pulse" /> Dual-SIM Configured
          </p>
        </div>
      </div>

      {/* Primary Safe/Danger status Banner Card */}
      <div 
        onClick={() => setScreen('checkin')}
        className="w-full bg-slate-900 text-white rounded-[24px] p-5 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-all shadow-md relative overflow-hidden group border border-slate-800"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 opacity-30 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500/10 to-emerald-500/30 flex items-center justify-center text-emerald-400 border border-emerald-500/40 animate-pulse">
            <ShieldCheck className="w-6 h-6 shrink-0" />
          </div>
          <div className="text-left font-sans">
            <h2 className="font-extrabold text-base text-slate-100 tracking-tight">YOU ARE CURRENTLY SECURED</h2>
            <p className="text-[11px] text-slate-400 font-medium font-mono">Satellite grid monitor: Sector active • No alert triggers</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-all transform group-hover:translate-x-1" />
      </div>

      {/* Futuristic SOS Central Beacon Hub */}
      <div className="relative flex flex-col items-center justify-center py-5 w-full">
        {/* Futuristic Cyber-Grid Crosshair lines */}
        <div className="absolute w-full h-[1px] bg-slate-200" />
        <div className="absolute w-[1px] h-full bg-slate-200" />

        {/* Dynamic scanning outer radar dial */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-slate-200/90 animate-[spin_40s_linear_infinite]" />
        
        {/* Pulsing visual core layers */}
        <div className="absolute w-[240px] h-[240px] rounded-full bg-rose-500/5 emergency-pulse z-0" />
        <div className="absolute w-[205px] h-[205px] rounded-full bg-rose-500/10 emergency-pulse z-0" style={{ animationDelay: '0.8s' }} />

        {/* Futuristic circular telemetry marker flags */}
        <div className="absolute top-1 pt-0.5 text-[8px] font-mono font-black text-slate-350 tracking-wider bg-slate-50 border border-slate-200 rounded px-1.5 shadow-3xs">
          OUTBOUND BRIDGING ACTIVE
        </div>

        {/* Interactive SOS Trigger Button */}
        <motion.button 
          onClick={handleImmediateSosClick}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          animate={{ scale: isHolding ? 0.93 : 1 }}
          className="relative w-[190px] h-[190px] rounded-full bg-red-650 flex flex-col items-center justify-center cursor-pointer shadow-[0_12px_36px_rgba(244,63,94,0.35)] hover:shadow-[0_16px_44px_rgba(244,63,94,0.45)] z-10 select-none outline-none group border-4 border-slate-100 transition-all select-none selection:bg-transparent"
          title="TAP TO EMERGENCE SEQUENTIAL OUTBOUND SIM MISCALL"
        >
          {/* Progress Circular border track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 scale-102">
            <circle 
              cx="95" 
              cy="95" 
              r="91" 
              fill="transparent" 
              stroke="#FFF" 
              strokeWidth="4" 
              strokeDasharray="572" 
              strokeDashoffset={572 - (572 * holdProgress) / 100}
              className="transition-all duration-75 text-white/50"
            />
          </svg>

          {/* Central emergency text */}
          <span className="text-4xl font-black text-white tracking-widest leading-none drop-shadow-sm select-none">SOS</span>
          <span className="text-[9px] font-black text-rose-100 hover:text-white mt-1 uppercase tracking-widest leading-none font-mono select-none">
            {isHolding ? 'DIAL COMMENCED' : 'TAP TO REAL CALL'}
          </span>
          <span className="text-[9px] text-white/80 mt-1 italic font-mono font-bold leading-none select-none">
            {isHolding ? `${Math.min(100, Math.round(holdProgress))}%` : 'Sequential SIM Alert'}
          </span>
        </motion.button>

        {/* Telemetry bottom coordinate badge */}
        <div className="absolute bottom-1 text-[8px] font-mono font-black text-slate-350 tracking-wider bg-slate-50 border border-slate-200 rounded px-1.5 shadow-3xs flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-rose-500 animate-[bounce_1s_infinite]" /> GEO BRIDGE L1/L2 COORDS
        </div>
      </div>

      {/* Safety Biometric Check-in Panel (Now strictly lockable once-a-day) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-[24px] p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
        
        {/* Holographic scanner top decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-505 via-purple-505 to-emerald-550 opacity-80" />

        <div className="flex justify-between items-start">
          <div className="space-y-1 text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
               Biometric Safety Verification
            </h3>
            <p className="text-xs text-slate-550 font-bold">
              Secure anchor update state check: <span className="font-mono text-emerald-600 font-extrabold">{lastCheckInTime ? `at ${lastCheckInTime}` : 'Pending sync'}</span>
            </p>
          </div>
          <Timer className="w-5 h-5 text-indigo-600 animate-pulse" />
        </div>

        <AnimatePresence mode="wait">
          {!isSafeConfirmed ? (
            <motion.button 
              key="safe-btn-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleConfirmSafe}
              className="w-full h-15 bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 hover:from-slate-850 hover:to-indigo-900 duration-100 shadow-md border border-slate-800"
            >
              <span>Verify Biometric Safety Status</span>
            </motion.button>
          ) : (
            <motion.div 
              key="confirmed-banner-blocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-4 bg-emerald-50 border border-emerald-250 text-emerald-700 font-extrabold text-center rounded-2xl font-mono text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 animate-pulse"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 stroke-[3]" />
                <span>Verified Secure for Today</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block normal-case font-sans">
                Next verification window unlock opens in <strong className="font-mono font-black text-slate-600">{resetCountdown.hrs}h {resetCountdown.mins}m</strong>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-[10px] text-slate-400 leading-normal font-medium text-left">
          * Guard lock protocol: "I'm Safe" can only be tapped once per 24-hr calendar day limit. Your emergency guardians are automatically updated with this status window.
        </p>
      </div>

      {/* Endlife Creator Hub Banner */}
      <div 
        onClick={() => setScreen('creator_hub')}
        className="w-full bg-slate-900 border border-slate-800 rounded-[24px] p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-850 transition-all shadow-sm group relative overflow-hidden text-slate-100"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-550/20 transition-all" />
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-550 via-indigo-650 to-rose-500 text-white flex items-center justify-center group-hover:scale-105 transition-all shrink-0 shadow-md border border-indigo-500/20">
          <Award className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-black font-mono bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 py-0.5 px-2 rounded uppercase tracking-wider">
              CREATOR HUB
            </span>
            <span className="text-[8px] font-black font-mono bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 py-0.5 px-2 rounded uppercase tracking-wider">
              +POINTS & BADGES
            </span>
          </div>
          <p className="font-sans font-black text-sm text-slate-100 mt-1 uppercase tracking-tight">
            Creator Hub
          </p>
          <p className="text-[10px] text-slate-400 font-medium font-sans leading-normal line-clamp-1 truncate mt-0.5">
            Create your channel, earn points, track community growth metrics, and stack awards.
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
      </div>

      {/* Voice Assistant Futuristic Shortcut */}
      <div 
        onClick={() => setScreen('assistant')}
        className="w-full bg-slate-50 border border-slate-200/90 rounded-[24px] p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-100/70 transition-all shadow-2xs group relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-550/10 transition-all" />
        
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-xs border border-indigo-500/20">
          <Sparkles className="w-5.5 h-5.5 animate-pulse" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-mono text-[13px] text-slate-800 font-semibold italic group-hover:text-indigo-700 transition-colors truncate">
            "Hey Achyuta, I'm heading home now."
          </p>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 flex items-center gap-1">
            Achyuta Super Intelligence <span className="text-emerald-500 animate-ping">●</span>
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
      </div>

    </motion.div>
  );
}
