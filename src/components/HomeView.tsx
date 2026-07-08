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
import { Screen, Contact } from '../types';
import { SecureStorage } from '../utils/security';

interface HomeViewProps {
  setScreen: (screen: Screen) => void;
  onSosTrigger: () => void;
  lastCheckInTime: string;
  setLastCheckInTime: (time: string) => void;
  profileName?: string;
  contacts?: Contact[];
}

export default function HomeView({ 
  setScreen, 
  onSosTrigger, 
  lastCheckInTime, 
  setLastCheckInTime,
  profileName = 'Adele Vance',
  contacts = []
}: HomeViewProps) {
  const [isSafeConfirmed, setIsSafeConfirmed] = useState(false);
  const [resetCountdown, setResetCountdown] = useState({ hrs: 12, mins: 30 });
  const [tickerTime, setTickerTime] = useState<string>('00:00:00');
  const [carrierUptime, setCarrierUptime] = useState<string>('99.98%');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Missed Safety Check-In Alert state
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = SecureStorage.getItem('endlif_checkin_threshold');
    return saved ? parseInt(saved, 10) : 2; // Default to 2 days
  });

  const [lastCheckInTimestamp, setLastCheckInTimestamp] = useState<string | null>(() => {
    return SecureStorage.getItem('endlif_last_safe_confirm_timestamp');
  });

  const [showSimulator, setShowSimulator] = useState(false);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);

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

  // Check once-a-day "I'm Safe" lock constraint + sync check-in timestamp
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const savedDate = localStorage.getItem('endlif_last_safe_confirm_date');
    if (savedDate === todayStr) {
      setIsSafeConfirmed(true);
    } else {
      setIsSafeConfirmed(false);
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

    // Ensure we have a valid initial check-in timestamp in secure storage
    let ts = SecureStorage.getItem('endlif_last_safe_confirm_timestamp');
    if (!ts) {
      const now = new Date();
      ts = now.toISOString();
      SecureStorage.setItem('endlif_last_safe_confirm_timestamp', ts);
      localStorage.setItem('endlif_last_safe_confirm_date', now.toDateString());
    }
    setLastCheckInTimestamp(ts);

    const handleSync = () => {
      const todayStrCurrent = new Date().toDateString();
      const savedDateCurrent = localStorage.getItem('endlif_last_safe_confirm_date');
      setIsSafeConfirmed(savedDateCurrent === todayStrCurrent);
      
      const currentTs = SecureStorage.getItem('endlif_last_safe_confirm_timestamp');
      setLastCheckInTimestamp(currentTs);
    };

    window.addEventListener('endlif_profile_updated', handleSync);

    return () => {
      clearInterval(cdTimer);
      window.removeEventListener('endlif_profile_updated', handleSync);
    };
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

  // Clicking SOS triggers immediately for emergency responses!
  const handleImmediateSosClick = () => {
    onSosTrigger();
  };

  // Helper functions for threshold checking & past timestamp simulations
  const getMissedDays = () => {
    if (!lastCheckInTimestamp) return 0;
    const lastDate = new Date(lastCheckInTimestamp);
    const currentDate = new Date();
    
    const diffMs = currentDate.getTime() - lastDate.getTime();
    if (diffMs <= 0) return 0;
    
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const missedDaysCount = getMissedDays();
  const alertActive = missedDaysCount >= threshold;

  const formatLastCheckInDateTime = () => {
    if (!lastCheckInTimestamp) return 'No successful check-in recorded';
    const d = new Date(lastCheckInTimestamp);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    SecureStorage.setItem('endlif_checkin_threshold', newThreshold.toString());
    
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 20]);
    }
  };

  const handleSimulatePastCheckIn = (daysAgo: number) => {
    const now = new Date();
    if (daysAgo === 0) {
      SecureStorage.setItem('endlif_last_safe_confirm_timestamp', now.toISOString());
      localStorage.setItem('endlif_last_safe_confirm_date', now.toDateString());
      setLastCheckInTimestamp(now.toISOString());
      setIsSafeConfirmed(true);
      setLastCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      const mockDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (60 * 60 * 1000)); // Past date with padding
      SecureStorage.setItem('endlif_last_safe_confirm_timestamp', mockDate.toISOString());
      localStorage.setItem('endlif_last_safe_confirm_date', mockDate.toDateString());
      setLastCheckInTimestamp(mockDate.toISOString());
      setIsSafeConfirmed(false);
      setLastCheckInTime(mockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    // Dispatch profile updated event so App state reloads if necessary
    window.dispatchEvent(new Event('endlif_profile_updated'));
    
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([60, 40]);
    }
  };

  // Safely record user biometric lock
  const handleConfirmSafe = () => {
    const now = new Date();
    const todayStr = now.toDateString();
    localStorage.setItem('endlif_last_safe_confirm_date', todayStr);
    SecureStorage.setItem('endlif_last_safe_confirm_timestamp', now.toISOString());
    setLastCheckInTimestamp(now.toISOString());
    setIsSafeConfirmed(true);

    const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCheckInTime(stamp);

    window.dispatchEvent(new Event('endlif_profile_updated'));
    
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
      <div className="w-full">
        <div className="bg-white border border-slate-200/90 rounded-[20px] p-4 text-left shadow-2xs relative overflow-hidden">
          <div className="absolute top-2.5 right-3.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">ONLINE</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Telemetry Clock</p>
          <p className="text-xl font-black font-mono text-slate-900 tracking-tight mt-1">{tickerTime}</p>
          <p className="text-[8px] font-mono text-indigo-505/90 font-bold mt-1 uppercase flex items-center gap-0.5">
            <Globe className="w-2.5 h-2.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} /> GPS Sync Linked
          </p>
        </div>
      </div>

      {/* Primary Safe/Danger status Banner Card */}
      <div 
        className="w-full bg-slate-900 text-white rounded-[24px] p-5 flex items-center justify-between shadow-md relative overflow-hidden group border border-slate-800"
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
      </div>

      {/* Safety Biometric Check-in Panel (strictly lockable once-a-day) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-[24px] p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
        {/* Holographic scanner top decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80" />

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
              <div className="flex items-center gap-1.5 justify-center">
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

      {/* Futuristic SOS Central Beacon Hub */}
      <div className="relative flex flex-col items-center justify-center py-5 w-full">
        {/* Pulsing outer rings */}
        <div className="absolute w-[250px] h-[250px] rounded-full bg-[#B30000]/10 animate-ping opacity-75 pointer-events-none" />
        <div className="absolute w-[220px] h-[220px] rounded-full bg-[#5A0000]/10 emergency-pulse z-0" />
        
        {/* Interactive SOS Trigger Button */}
        <motion.button 
          onClick={handleImmediateSosClick}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          animate={{ scale: isHolding ? 0.93 : 1 }}
          className="relative w-[190px] h-[190px] rounded-full bg-gradient-to-br from-[#5A0000] to-[#B30000] flex flex-col items-center justify-center cursor-pointer shadow-[0_20px_50px_rgba(90,0,0,0.5)] hover:shadow-[0_24px_55px_rgba(179,0,0,0.6)] z-10 select-none outline-none group border-4 border-white transition-all select-none selection:bg-transparent"
          title="SOS - Tap for Emergency"
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
          <span className="text-5xl font-black text-white tracking-widest leading-none drop-shadow-md select-none">SOS</span>
          <span className="text-[11px] font-extrabold text-rose-200 mt-2.5 uppercase tracking-widest leading-none select-none">
            {isHolding ? `HOLDING ${Math.min(100, Math.round(holdProgress))}%` : 'Tap for Emergency'}
          </span>
        </motion.button>
      </div>



      {/* Missed Safety Check Alert (Collapsed by Default) */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-[24px] p-5 shadow-md relative overflow-hidden text-left text-white transition-all duration-300">
        {/* Decorative banner bar */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${alertActive ? 'from-rose-500 via-pink-500 to-red-600' : 'from-indigo-400 via-indigo-500 to-cyan-400'} opacity-90`} />

        <div 
          onClick={() => setIsAlertExpanded(!isAlertExpanded)}
          className="flex justify-between items-center w-full cursor-pointer select-none py-1"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500 stroke-[3]" />
            <span className="text-xs font-black tracking-widest text-white uppercase font-mono">
              MISSED SAFETY CHECK ALERT
            </span>
          </div>
          <motion.span 
            animate={{ rotate: isAlertExpanded ? 180 : 0 }} 
            className="text-slate-400 font-mono text-xs leading-none"
          >
            ▼
          </motion.span>
        </div>
        
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold text-left select-none pl-7">
          Automatic Warning Broadcast
        </p>

        <AnimatePresence initial={false}>
          {isAlertExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-4 pt-4 border-t border-slate-800 space-y-4"
            >
              {/* Warning Threshold */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono block">
                  Warning Threshold
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 7].map((val) => {
                    const isActive = threshold === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThresholdChange(val);
                        }}
                        className={`py-2 rounded-xl text-xs font-black tracking-wide transition-all border outline-none cursor-pointer ${
                          isActive
                            ? 'bg-white border-white text-slate-900 shadow-sm font-black'
                            : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {val} Days
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold font-sans leading-normal">
                  If you do not confirm safety for {threshold} days, a custom emergency alert will be dispatched automatically.
                </p>
              </div>

              {/* Current Status */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono block">
                  Current Status
                </label>

                {alertActive ? (
                  <div className="bg-rose-950/40 border border-rose-900/50 rounded-2xl p-4 space-y-3.5 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                      <span className="text-xs font-black text-rose-400 uppercase tracking-wider font-mono">
                        🚨 ALERTS DISPATCHED (THRESHOLD EXCEEDED)
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-slate-300 font-medium leading-relaxed bg-slate-950/50 rounded-xl p-3 border border-rose-950/60 shadow-2xs">
                      <p className="font-extrabold text-[12px] text-rose-400">
                        Broadcast Alert details:
                      </p>
                      <div className="border-l-3 border-rose-500 pl-3 italic font-mono text-[10.5px] text-rose-300 bg-rose-950/30 py-1.5 pr-2 rounded leading-normal text-left">
                        "No safety check-in has been received for {profileName} for the selected period of {threshold} days. Please contact this person immediately. Last check-in date: {formatLastCheckInDateTime()}"
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 font-sans">
                        Time since last check-in: <strong className="font-mono text-rose-400">{missedDaysCount} days</strong> (threshold of {threshold} days reached).
                      </p>
                    </div>

                    {/* Contacts dispatched list */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest font-mono">
                        Recipients (Safety Circle):
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {contacts.length === 0 ? (
                          <div className="text-[10px] font-bold text-slate-500 italic bg-slate-950/40 p-2 rounded-xl text-center border border-dashed border-slate-800">
                            No contacts found. Please add guardians in Circle.
                          </div>
                        ) : (
                          contacts.map((c) => (
                            <div key={c.id} className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-rose-950/40 text-[11px] font-bold text-rose-200 shadow-3xs">
                              <span className="truncate pr-1">{c.name} ({c.phone || '+1 (555) 012-3499'})</span>
                              <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 border border-emerald-900/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sent SMS
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono">
                        🟢 SYSTEM SECURED (INTERVAL SECURE)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold font-sans leading-normal">
                      Elapsed: <strong className="font-mono text-slate-100">{missedDaysCount} days</strong>. Next alert threshold will trigger if inactive for <strong className="font-mono text-indigo-400 font-bold">{threshold - missedDaysCount} more days</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Last Check-in */}
              <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono block">
                  Last Check-in
                </label>
                <div className="text-[11px] text-slate-200 font-mono flex items-center gap-1">
                  <strong className="text-slate-100">{formatLastCheckInDateTime()}</strong>
                </div>
              </div>

              {/* Sandbox Testing */}
              <div className="border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSimulator(!showSimulator);
                  }}
                  className="w-full flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono cursor-pointer hover:text-slate-300 transition-colors"
                >
                  <span>{showSimulator ? '▼ Hide' : '▶ Show'} Sandbox Testing Dock</span>
                  <span className="bg-indigo-950 border border-indigo-900/50 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                    Sandbox tool
                  </span>
                </button>

                {showSimulator && (
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 mt-3 space-y-3.5 text-left text-slate-100 shadow-lg relative">
                    <div className="absolute top-1.5 right-2 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[7.5px] font-mono text-amber-500 font-bold">SANDBOX STATE</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium font-sans leading-normal">
                      Select a mock past check-in time to instantly verify how the automatic comparing logic triggers, sends alerts to the Circle, and updates the telemetry status.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-black font-mono">
                      <button
                        key="sim-0"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulatePastCheckIn(0);
                        }}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Reset (Check-In Now)</span>
                        <span className="text-[7.5px] text-slate-400 font-semibold">(0 Days Elapsed)</span>
                      </button>
                      <button
                        key="sim-2"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulatePastCheckIn(2);
                        }}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Simulate 2 Days Ago</span>
                        <span className="text-[7.5px] text-amber-500 font-bold">(Triggers 2-day Threshold)</span>
                      </button>
                      <button
                        key="sim-3"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulatePastCheckIn(3);
                        }}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Simulate 3 Days Ago</span>
                        <span className="text-[7.5px] text-amber-500 font-bold">(Triggers 2 & 3-day)</span>
                      </button>
                      <button
                        key="sim-8"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulatePastCheckIn(8);
                        }}
                        className="py-2.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-200 rounded-xl cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Simulate 8 Days Ago</span>
                        <span className="text-[7.5px] text-rose-400 font-bold">(Triggers All Thresholds!)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
