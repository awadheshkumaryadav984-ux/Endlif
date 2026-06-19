import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Check, 
  AlertTriangle, 
  Radio, 
  X, 
  Phone, 
  Volume2, 
  Activity, 
  HeartPulse, 
  Globe, 
  Terminal,
  ArrowRight
} from 'lucide-react';
import { Contact } from '../types';

interface SosViewProps {
  onCancelSos: () => void;
  contacts?: Contact[];
}

export default function SosView({ onCancelSos, contacts = [] }: SosViewProps) {
  const [cancelHoldProgress, setCancelHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter circle contacts with active phone numbers
  const validContacts = (contacts || []).filter(c => c.phone);

  // Sequential automatic SIM dialing state
  const [activeCallIndex, setActiveCallIndex] = useState<number>(0);
  const [secondsLeftForNext, setSecondsLeftForNext] = useState<number>(8); // countdown ticker
  const [callingState, setCallingState] = useState<'DIALING' | 'COMPLETED'>('DIALING');
  const [dialLogs, setDialLogs] = useState<string[]>([]);
  const [carrierSimIndex, setCarrierSimIndex] = useState<number>(1);

  // Soundwave mock state for futuristic animation
  const [pulseBeats, setPulseBeats] = useState<number[]>([12, 18, 8, 24, 15, 6, 20]);

  useEffect(() => {
    const waveTicker = setInterval(() => {
      setPulseBeats(Array.from({ length: 9 }, () => Math.floor(Math.random() * 26) + 6));
    }, 200);
    return () => clearInterval(waveTicker);
  }, []);

  // Outbound SIM triggering function
  const dialContact = (index: number) => {
    if (!validContacts || validContacts.length === 0) return;
    const contact = validContacts[index];
    if (contact && contact.phone) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog = `[${timeStr}] SIM DEV_PORT: Opened native SIM-${carrierSimIndex} bridge to ${contact.name} at ${contact.phone}`;
      
      setDialLogs(prev => [newLog, ...prev]);

      // Direct phone protocol command triggering standard device dialer
      window.location.href = `tel:${contact.phone.replace(/\s+/g, '')}`;

      // Simulate a haptic device alert kick
      if (window.navigator?.vibrate) {
        window.navigator.vibrate([180, 80, 200]);
      }
    }
  };

  // Automatically cycle through safety network on load
  useEffect(() => {
    if (validContacts.length === 0) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDialLogs([`[${timeStr}] CRITICAL: Empty Safety Circle database. Please configure contact phone numbers in Profile.`]);
      setCallingState('COMPLETED');
      return;
    }

    // Trigger dial for first contact immediately
    dialContact(0);

    const ticker = setInterval(() => {
      setSecondsLeftForNext(prev => {
        if (prev <= 1) {
          // Progress to next circular guardian or wrap up
          const nextIndex = activeCallIndex + 1;
          if (nextIndex < validContacts.length) {
            setActiveCallIndex(nextIndex);
            dialContact(nextIndex);
            return 8; // Reset countdown delay for the next SIM broadcast
          } else {
            setCallingState('COMPLETED');
            const doneTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setDialLogs(prev => [`[${doneTime}] Dispatch complete. Sequential circle alert run verified successfully.`, ...prev]);
            clearInterval(ticker);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [activeCallIndex, contacts]);

  // Handle manual tap action for a specific circle contact
  const handleManualForceCall = (index: number) => {
    setActiveCallIndex(index);
    setSecondsLeftForNext(8);
    dialContact(index);
  };

  // Hold-to-cancel controller
  const startCancelHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    setCancelHoldProgress(0);

    holdTimerRef.current = setInterval(() => {
      setCancelHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current!);
          onCancelSos();
          return 100;
        }
        return prev + 6;
      });
    }, 60);
  };

  const stopCancelHold = () => {
    setIsHolding(false);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
    }
    // Slowly fade progress down
    const fadeOut = setInterval(() => {
      setCancelHoldProgress((prev) => {
        if (prev <= 0) {
          clearInterval(fadeOut);
          return 0;
        }
        return prev - 15;
      });
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-950 text-white z-[120] overflow-y-auto overflow-x-hidden flex flex-col items-center select-none font-sans scrollbar-none pb-12">
      
      {/* Background Holographic Topology decoration */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img 
          className="w-full h-full object-cover mix-blend-color-dodge filter hue-rotate-15" 
          alt="Satellite telemetry safety grid background map" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC29S8YMahIPfgQAJVigeoKe2INCSa6_9HL4wOSJJzTxfGVVPwpgYVQ7Za9i6sV_piNSKZCmWAMEExEDpgAnxyY3EGoxI7JTtmE4F1VrmYPH7_DGUO9EPAagLYo1VvhIkRFixdHb92qBu9YbagALDdccLOe__vx9vqICaKjWfnm2AIin6C35CkP0M_XHH-joch3SNzoxbk5R0781Q8QLwBS8iltim-kYk7yoNmV7a1Uxx5nvbPmDjc6pCXFB8W5fXR5rl02cMezOvQ"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
      </div>

      <main className="relative z-10 w-full max-w-[500px] flex-1 flex flex-col justify-between px-6 pt-12 pb-6 items-center text-center space-y-6">
        
        {/* Top Header Badge */}
        <header className="w-full flex flex-col items-center">
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-4 py-1.5 rounded-full mb-3 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest font-mono">AUTOMATED EMERGENCE CARRIER BRIDGE</span>
          </div>

          <h1 className="text-3xl font-black text-slate-100 tracking-tighter leading-none animate-[pulse_1.8s_infinite]">
            SIM OUTBOUND DIALING
          </h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5 font-mono">
            Calling Safety Circle contact list sequentially
          </p>
        </header>

        {/* Live Audio Telemetry Animation Indicator */}
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden space-y-4">
          <div className="absolute top-2 right-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[9px] font-bold text-rose-400 font-mono">ACTIVE CELL</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <Phone className="w-7 h-7 animate-[bounce_1.5s_infinite]" />
            </div>
            
            <div className="text-left flex-1 min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 block">Currently Broadcast Dialing</span>
              {validContacts[activeCallIndex] ? (
                <>
                  <span className="text-lg font-black text-white block truncate leading-tight">{validContacts[activeCallIndex].name}</span>
                  <span className="text-xs font-mono font-extrabold text-rose-400 mt-0.5 block">{validContacts[activeCallIndex].phone}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-350 italic block mt-1">Readying guardian ports...</span>
              )}
            </div>
          </div>

          {/* Futuristic Simulated Voice Level Waveform */}
          <div className="flex items-end justify-center gap-1.5 pb-2 pt-1 h-8 rounded-xl bg-slate-950/50">
            {pulseBeats.map((wt, i) => (
              <motion.div 
                key={i} 
                animate={{ height: wt }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="w-1 bg-gradient-to-t from-indigo-500 to-rose-500 rounded-full" 
                style={{ height: '10px' }}
              />
            ))}
          </div>

          {/* Progress bar and automatic progression ticker */}
          {callingState === 'DIALING' && validContacts.length > 1 && (
            <div className="pt-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 mb-1.5 uppercase">
                <span>Auto sequencing simulation</span>
                <span className="text-indigo-400">Next dial in {secondsLeftForNext}s</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-1000" 
                  style={{ width: `${(secondsLeftForNext / 8) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Contacts sequence dashboard selector (Where user can force select/trigger via Sim) */}
        <div className="w-full space-y-3">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider text-left pl-1 font-mono flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-indigo-500" /> SIM Telephony Checklist
          </h3>

          <div className="space-y-2 max-h-[190px] overflow-y-auto scrollbar-none pr-0.5">
            {validContacts.length === 0 ? (
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                No circular safety contacts with active phone numbers discovered. Please add them.
              </div>
            ) : (
              validContacts.map((contact, idx) => {
                const isActive = idx === activeCallIndex;
                const isCompleted = idx < activeCallIndex;
                const isPending = idx > activeCallIndex;

                return (
                  <div
                    key={contact.id}
                    onClick={() => handleManualForceCall(idx)}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-rose-950/30 to-indigo-950/30 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.1)]' 
                        : 'bg-slate-900/60 border-slate-800/80 grayscale opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          alt={contact.name} 
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                          src={contact.avatar}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${contact.name}`;
                          }}
                        />
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-505 rounded-full border-2 border-slate-950 flex items-center justify-center text-[7px] font-black text-white">
                            ●
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white leading-none">{contact.name}</span>
                          <span className="text-[8px] font-black bg-slate-80s bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                            {contact.role}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{contact.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded text-[8px] font-black text-emerald-400 font-mono uppercase tracking-widest">
                          Pushed 📞
                        </div>
                      )}
                      {isActive && (
                        <span className="bg-rose-500/20 border border-rose-500/40 text-rose-400 px-2 py-0.5 rounded text-[8px] font-black font-mono animate-pulse tracking-widest uppercase">
                          Dialing SIM
                        </span>
                      )}
                      {isPending && (
                        <span className="bg-slate-800 border-slate-705 px-2 py-0.5 rounded text-[8px] text-slate-400 font-black font-mono tracking-widest uppercase">
                          Queued
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-505 flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform">
                        <Phone className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live System Diagnostics Feed terminal */}
        <div className="w-full bg-slate-950/90 border border-slate-900 rounded-2xl p-4 text-left font-mono space-y-1.5">
          <p className="text-[10px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Carrier Log Diagnostics
          </p>
          <div className="text-[9px] text-indigo-400/90 space-y-1 max-h-[85px] overflow-y-auto pr-1 select-text scrollbar-none font-semibold">
            {dialLogs.map((log, lidx) => (
              <p key={lidx} className="leading-normal break-all">{log}</p>
            ))}
            <p className="text-slate-600 leading-normal">[Telemetry System] Ready. Active Satellite Coordinate links armed.</p>
            <p className="text-slate-600 leading-normal">[Dual-SIM Control] Checked local device antennas: SIM-1 registered carrier online.</p>
          </div>
        </div>

        {/* Cancel button with Hold progress countdown */}
        <div className="w-full space-y-3 pt-2 select-none">
          <motion.button 
            onMouseDown={startCancelHold}
            onMouseUp={stopCancelHold}
            onMouseLeave={stopCancelHold}
            onTouchStart={startCancelHold}
            onTouchEnd={stopCancelHold}
            animate={{ scale: isHolding ? 0.96 : 1 }}
            className="w-full h-15 bg-white hover:bg-slate-100 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-3 relative overflow-hidden transition-all shadow-xl select-none outline-none cursor-pointer border border-slate-200"
          >
            {/* hold progress indicator background fill */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-rose-500/20 mix-blend-multiply pointer-events-none transition-all duration-75"
              style={{ width: `${cancelHoldProgress}%` }}
            />

            <span>Cancel & Dismiss SOS</span>

            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="absolute inset-0 w-7 h-7 -rotate-90">
                <circle cx="14" cy="14" r="12" fill="transparent" stroke="#E2E8F0" strokeWidth="2.5" />
                <circle 
                  cx="14" 
                  cy="14" 
                  r="12" 
                  fill="transparent" 
                  stroke="#EF4444" 
                  strokeWidth="2.5" 
                  strokeDasharray="75" 
                  strokeDashoffset={75 - (75 * cancelHoldProgress) / 100}
                  className="transition-all duration-75"
                />
              </svg>
              <span className="text-[10px] font-black font-mono text-slate-950">
                X
              </span>
            </div>
          </motion.button>

          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
            {isHolding ? 'RELEASING CANCELLATION BAR...' : 'PRESS AND HOLD BUTTON STEADILY TO COMPENSATE AND DISMISS SYSTEM ALERT'}
          </p>
        </div>

      </main>
    </div>
  );
}
