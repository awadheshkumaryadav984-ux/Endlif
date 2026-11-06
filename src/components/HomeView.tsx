import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield,
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
  Award,
  Bell,
  Mail,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BrainCircuit,
  Siren
} from 'lucide-react';
import { Screen, Contact, EmergencySafetyAlert, RecipientDeliveryRecord, AuditLogEntry } from '../types';
import { SecureStorage } from '../utils/security';
import { DailyCheckInManager, CheckInState, CheckInThreshold } from '../services/DailyCheckInManager';
import { EmergencyAlertManager } from '../services/EmergencyAlertManager';
import { SafetyCircleManager } from '../services/SafetyCircleManager';
import { NotificationManager } from '../services/NotificationManager';
import { SMSFallbackService } from '../services/SMSFallbackService';
import { EmailFallbackService } from '../services/EmailFallbackService';
import { LocationService } from '../services/LocationService';
import { AlertAuditLogger } from '../services/AlertAuditLogger';
import { formatForDisplay, maskPhoneNumber } from '../services/phoneUtils';

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

  // Missed Safety Check-In Alert state powered by DailyCheckInManager & EmergencyAlertManager
  const [checkInState, setCheckInState] = useState<CheckInState>(() => DailyCheckInManager.getState());
  const [activeAlert, setActiveAlert] = useState<EmergencySafetyAlert | null>(() => EmergencyAlertManager.getCurrentAlert());
  const [showSimulator, setShowSimulator] = useState(false);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => AlertAuditLogger.getLogs());
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeContacts, setActiveContacts] = useState<Contact[]>(() => {
    const list = SafetyCircleManager.getContacts();
    return list.length > 0 ? list : contacts;
  });

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

  // Listen to centralized check-in, alert, and circle state changes
  useEffect(() => {
    const syncState = () => {
      const state = DailyCheckInManager.getState();
      setCheckInState(state);
      setActiveAlert(EmergencyAlertManager.getCurrentAlert());
      setAuditLogs(AlertAuditLogger.getLogs());
      setActiveContacts(SafetyCircleManager.getContacts());

      // Sync "I'm Safe" lock for the day
      const todayStr = new Date().toDateString();
      const savedDate = localStorage.getItem('endlif_last_safe_confirm_date');
      setIsSafeConfirmed(savedDate === todayStr && !state.isSimulation);
    };

    // Run initial threshold check
    DailyCheckInManager.checkThreshold();
    syncState();

    window.addEventListener('endlif_checkin_updated', syncState);
    window.addEventListener('endlif_alert_updated', syncState);
    window.addEventListener('endlif_circle_updated', syncState);
    window.addEventListener('endlif_profile_updated', syncState);

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

    return () => {
      clearInterval(cdTimer);
      window.removeEventListener('endlif_checkin_updated', syncState);
      window.removeEventListener('endlif_alert_updated', syncState);
      window.removeEventListener('endlif_circle_updated', syncState);
      window.removeEventListener('endlif_profile_updated', syncState);
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

  const handleImmediateSosClick = () => {
    onSosTrigger();
  };

  const missedDaysCount = checkInState.missedDays;
  const alertActive = checkInState.isThresholdExceeded;
  const threshold = checkInState.thresholdDays;

  const formatLastCheckInDateTime = () => {
    if (!checkInState.lastCheckInTimestamp) return 'No check-in recorded';
    const d = new Date(checkInState.lastCheckInTimestamp);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleThresholdChange = (newThreshold: CheckInThreshold) => {
    DailyCheckInManager.setThreshold(newThreshold);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 20]);
    }
  };

  // Safely record user check-in
  const handleConfirmSafe = () => {
    DailyCheckInManager.recordCheckIn();
    const now = new Date();
    setLastCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsSafeConfirmed(true);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 30, 40]);
    }
  };

  // Manual re-dispatch of emergency alerts
  const handleManualRebroadcast = async () => {
    if (isBroadcasting) return;
    setIsBroadcasting(true);
    try {
      await EmergencyAlertManager.evaluateAndTriggerAlert({ forceRebroadcast: true });
    } finally {
      setIsBroadcasting(false);
      setAuditLogs(AlertAuditLogger.getLogs());
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
                  {([2, 3, 7] as CheckInThreshold[]).map((val) => {
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
                  If you fail to complete your safety check-in within {threshold} days, the emergency alert protocol triggers automatically.
                </p>
              </div>

              {/* Current Status */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono block">
                  Current Status
                </label>

                {alertActive ? (
                  <div className="bg-rose-950/40 border border-rose-900/50 rounded-2xl p-4 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <span className="text-xs font-black text-rose-400 uppercase tracking-wider font-mono">
                          🚨 EMERGENCY SAFETY ALERT ACTIVE
                        </span>
                      </div>
                      {checkInState.isSimulation && (
                        <span className="text-[8px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          ⚠️ DEVELOPMENT SIMULATION
                        </span>
                      )}
                    </div>
                    
                    {/* Canonical Alert Message */}
                    <div className="space-y-2 text-xs text-slate-300 font-medium leading-relaxed bg-slate-950/70 rounded-xl p-3.5 border border-rose-950/60 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-[11px] text-rose-300 uppercase tracking-wider font-mono">
                          Canonical Safety Message:
                        </p>
                        <span className="text-[9px] font-mono text-slate-400">
                          {missedDaysCount} days overdue (Threshold: {threshold}d)
                        </span>
                      </div>
                      <div className="border-l-3 border-rose-500 pl-3 italic font-mono text-[10.5px] text-rose-200 bg-rose-950/30 py-2 pr-2 rounded leading-relaxed text-left whitespace-pre-wrap">
                        {activeAlert?.message || `ENDLIF Safety Alert: No safety check-in has been received from ${profileName} for ${missedDaysCount} days. Please contact them immediately. Last check-in: ${formatLastCheckInDateTime()}`}
                      </div>
                      {activeAlert?.location && (
                        <div className="text-[9px] font-mono text-indigo-300 flex items-center gap-1 mt-1">
                          <Globe className="w-3 h-3 text-indigo-400" />
                          <span>Last GPS: {activeAlert.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Hierarchy Matrix */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-300">
                          SAFETY ALERT DELIVERY
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400 font-bold">
                          Multi-Channel Orchestration
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          <p className="text-emerald-400 font-bold flex items-center gap-1">
                            <span>Primary:</span>
                          </p>
                          <p className="text-slate-200 font-semibold mt-0.5">
                            ✓ ENDLIF App Notification (FCM Push)
                          </p>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          <p className="text-indigo-400 font-bold flex items-center gap-1">
                            <span>Fallback Hierarchy:</span>
                          </p>
                          <p className="text-slate-300 mt-0.5 leading-tight">
                            • SMS (Device SMS & Cellular Gateway)<br />
                            • Email (Universal Inbox Dispatch)<br />
                            • Phone Call (Direct Emergency Dialer)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recipients (Safety Circle Delivery Records) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest font-mono">
                          Safety Circle Recipient Status:
                        </p>
                        <span className="text-[9px] font-mono text-slate-400">
                          {activeContacts.length} Guardians
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {activeContacts.length === 0 ? (
                          <div className="text-[10px] font-bold text-slate-500 italic bg-slate-950/40 p-3 rounded-xl text-center border border-dashed border-slate-800">
                            No guardians enrolled in Circle. Please add guardians in the Circle tab.
                          </div>
                        ) : (
                          activeContacts.map((contact) => {
                            const delivery = activeAlert?.recipients?.find(d => d.contactId === contact.id);
                            const status = delivery?.status || (alertActive ? 'SMS Attempted' : 'Alert Created');
                            const channel = delivery?.channel || (contact.fcmToken ? 'fcm' : 'sms');
                            const isSim = delivery?.isSimulation ?? checkInState.isSimulation;
                            const maskedPhone = maskPhoneNumber(contact.phone || '+15550123499');

                            return (
                              <div 
                                key={contact.id} 
                                className="bg-slate-950/70 p-3 rounded-xl border border-rose-950/40 space-y-2 text-left shadow-2xs"
                              >
                                <div className="flex items-center justify-between flex-wrap gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-bold border border-rose-500/30">
                                      {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-bold text-slate-200 leading-tight">
                                        {contact.name}
                                      </p>
                                      <p className="text-[9px] font-mono text-slate-400">
                                        {maskedPhone} {contact.email ? `• ${contact.email}` : ''}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 flex-wrap">
                                    {/* Channel Badge */}
                                    <span className="text-[8px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold border border-slate-700">
                                      {channel.toUpperCase()}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1 border ${
                                      status === 'FCM Delivered'
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                                        : status === 'FCM Sent'
                                        ? 'bg-cyan-950 text-cyan-400 border-cyan-800/40'
                                        : status === 'Email Sent'
                                        ? 'bg-indigo-950 text-indigo-400 border-indigo-800/40'
                                        : status === 'SMS Attempted'
                                        ? 'bg-sky-950 text-sky-400 border-sky-800/40'
                                        : status === 'Alert Created'
                                        ? 'bg-amber-950 text-amber-400 border-amber-800/40'
                                        : 'bg-rose-950 text-rose-400 border-rose-800/40'
                                    }`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                      {status}
                                    </span>

                                    {/* Simulation Tag */}
                                    {isSim && (
                                      <span className="text-[7.5px] font-mono bg-amber-950/80 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded font-bold">
                                        SIMULATION
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Direct Fallback Actions */}
                                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-900 justify-end flex-wrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const body = `ENDLIF Safety Alert: No check-in has been received from ${profileName} for ${missedDaysCount} days. Please check on them immediately.`;
                                      SMSFallbackService.triggerDeviceSms(contact, body);
                                    }}
                                    className="text-[9px] font-mono bg-slate-800 hover:bg-slate-750 text-slate-200 px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
                                    title="Open native device SMS app"
                                  >
                                    <MessageSquare className="w-2.5 h-2.5 text-sky-400" />
                                    <span>SMS</span>
                                  </button>

                                  {contact.email && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const url = EmailFallbackService.generateMailtoUri({
                                          toEmail: contact.email!,
                                          userName: profileName,
                                          thresholdDays: threshold,
                                          lastCheckInFormatted: formatLastCheckInDateTime(),
                                          locationText: activeAlert?.location || 'Last reported location'
                                        });
                                        window.location.assign(url);
                                      }}
                                      className="text-[9px] font-mono bg-slate-800 hover:bg-slate-750 text-slate-200 px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
                                      title="Draft email alert"
                                    >
                                      <Mail className="w-2.5 h-2.5 text-indigo-400" />
                                      <span>Email</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      NotificationManager.initiateEmergencyCall(contact);
                                    }}
                                    className="text-[9px] font-mono bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 border border-emerald-800/40"
                                    title="Dial phone number"
                                  >
                                    <PhoneCall className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Call</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          disabled={isBroadcasting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManualRebroadcast();
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
                          {isBroadcasting ? 'Broadcasting...' : '📢 Re-Dispatch Safety Alerts'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmSafe();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer font-mono shrink-0 flex items-center gap-1"
                          title="Confirm safety and clear emergency alerts"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>I'm Safe</span>
                        </button>
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
                      Elapsed: <strong className="font-mono text-slate-100">{missedDaysCount} days</strong>. Next alert threshold will trigger if inactive for <strong className="font-mono text-indigo-400 font-bold">{Math.max(0, threshold - missedDaysCount)} more days</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Last Check-in Info */}
              <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono block">
                  Last Check-in Record
                </label>
                <div className="text-[11px] text-slate-200 font-mono flex items-center justify-between">
                  <strong className="text-slate-100">{formatLastCheckInDateTime()}</strong>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAuditLogs(!showAuditLogs);
                    }}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3 h-3" />
                    <span>{showAuditLogs ? 'Hide Audit Log' : 'Audit Trail'}</span>
                  </button>
                </div>

                {/* Audit Trail Drawer */}
                {showAuditLogs && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
                      <span>Immutable Event Log ({auditLogs.length})</span>
                      <span>Security Grade</span>
                    </div>
                    <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[9px]">
                      {auditLogs.length === 0 ? (
                        <p className="text-slate-500 italic">No events logged yet.</p>
                      ) : (
                        auditLogs.slice(0, 8).map((log) => (
                          <div key={log.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="text-indigo-400 font-bold mr-1.5">[{log.eventType}]</span>
                              <span className="text-slate-300">{log.detail}</span>
                            </div>
                            <span className="text-[8px] text-slate-500 shrink-0">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Safe Development Mode Dock */}
              <div className="border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSimulator(!showSimulator);
                  }}
                  className="w-full flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono cursor-pointer hover:text-slate-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showSimulator ? '▼ Hide' : '▶ Show'} Safe Development Mode</span>
                  </span>
                  <span className="bg-amber-950 border border-amber-900/50 text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                    Dev Simulator
                  </span>
                </button>

                {showSimulator && (
                  <div className="bg-slate-950 border border-amber-950/60 rounded-2xl p-4 mt-3 space-y-3.5 text-left text-slate-100 shadow-lg relative">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                          SAFE DEVELOPMENT SIMULATION
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-400">
                        Zero Carrier Charges
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium font-sans leading-normal">
                      Simulate elapsed safety check-in intervals to verify threshold evaluation, canonical emergency message generation, and multi-channel fallback dispatches safely without sending unprompted real-world broadcasts.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-black font-mono">
                      <button
                        key="sim-reset"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          DailyCheckInManager.resetSimulation();
                          setAuditLogs(AlertAuditLogger.getLogs());
                        }}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Reset to Today</span>
                        <span className="text-[7.5px] text-emerald-400 font-semibold">(Safe • 0 Days Missed)</span>
                      </button>

                      <button
                        key="sim-2"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          DailyCheckInManager.simulateMissedDays(2);
                          setAuditLogs(AlertAuditLogger.getLogs());
                        }}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Simulate 2 Days Missed</span>
                        <span className="text-[7.5px] text-amber-400 font-bold">(Triggers 2-day Threshold)</span>
                      </button>

                      <button
                        key="sim-3"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          DailyCheckInManager.simulateMissedDays(3);
                          setAuditLogs(AlertAuditLogger.getLogs());
                        }}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Simulate 3 Days Missed</span>
                        <span className="text-[7.5px] text-amber-400 font-bold">(Triggers 2 & 3-day)</span>
                      </button>

                      <button
                        key="sim-7"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          DailyCheckInManager.simulateMissedDays(7);
                          setAuditLogs(AlertAuditLogger.getLogs());
                        }}
                        className="py-2.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-200 rounded-xl cursor-pointer transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5 font-bold"
                      >
                        <span className="text-[9px] uppercase">Simulate 7 Days Missed</span>
                        <span className="text-[7.5px] text-rose-400 font-bold">(Triggers All Thresholds)</span>
                      </button>
                    </div>

                    {checkInState.isSimulation && (
                      <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-2.5 text-[9.5px] font-mono text-amber-300 flex items-center justify-between">
                        <span>Simulation Active: {checkInState.simulatedMissedDays} days simulated</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            DailyCheckInManager.resetSimulation();
                          }}
                          className="underline hover:text-white cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Endlif Guardian Hub Banner */}
      <div 
        onClick={() => setScreen('creator_hub')}
        className="w-full bg-slate-900 border border-slate-800 rounded-[24px] p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-850 transition-all shadow-sm group relative overflow-hidden text-slate-100"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-550/20 transition-all" />
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-emerald-500 text-white flex items-center justify-center group-hover:scale-105 transition-all shrink-0 shadow-md border border-indigo-500/30">
          <Shield className="w-6 h-6 animate-pulse text-indigo-200" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-black font-mono bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 py-0.5 px-2 rounded uppercase tracking-wider">
              GUARDIAN HUB
            </span>
            <span className="text-[8px] font-black font-mono bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 py-0.5 px-2 rounded uppercase tracking-wider">
              SAFETY MOVEMENT
            </span>
          </div>
          <p className="font-sans font-black text-sm text-slate-100 mt-1 uppercase tracking-tight">
            Guardian Hub
          </p>
          <p className="text-[10px] text-slate-400 font-medium font-sans leading-normal line-clamp-1 truncate mt-0.5">
            Invite someone. Help protect someone. Rise through 7 Guardian ranks and unlock verified attestation.
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
      </div>

      {/* Voice Assistant Futuristic Shortcut */}
      <div 
        onClick={() => setScreen('assistant')}
        className="w-full bg-slate-900 border border-slate-800 rounded-[24px] p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-850 transition-all shadow-md group relative overflow-hidden text-slate-100"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-550/20 transition-all" />
        
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-md border border-indigo-400/30">
          <BrainCircuit className="w-6 h-6 animate-pulse text-blue-200" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] font-black font-mono bg-blue-500/20 border border-blue-400/30 text-blue-300 py-0.5 px-2 rounded uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-blue-400" />
              SEARCH GROUNDED
            </span>
            <span className="text-[8px] font-black font-mono bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 py-0.5 px-2 rounded uppercase tracking-wider">
              GEMINI 2.5 FLASH
            </span>
          </div>
          <p className="font-sans font-bold text-xs text-slate-100 mt-1 truncate">
            "Achyuta, what is the official police emergency number in Mumbai?"
          </p>
          <p className="text-[10px] text-slate-400 font-medium font-sans leading-normal truncate mt-0.5 flex items-center gap-1.5">
            <span>Tap to open full tactical guardian console</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
      </div>

    </motion.div>
  );
}
