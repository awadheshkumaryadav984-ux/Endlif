import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, HelpCircle, Users, Navigation, Flame, RefreshCw } from 'lucide-react';

interface CheckInViewProps {
  onConfirmSafety: () => void;
  countdownMinutes: number;
}

export default function CheckInView({ onConfirmSafety, countdownMinutes }: CheckInViewProps) {
  const [seconds, setSeconds] = useState(42);
  const [minutes, setMinutes] = useState(12);
  const [hours, setHours] = useState(23);
  const [isSuccessState, setIsSuccessState] = useState(false);

  // Real ticking countdown logic from mockups
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSec) => {
        if (prevSec <= 0) {
          setMinutes((prevMin) => {
            if (prevMin <= 0) {
              setHours((prevH) => {
                if (prevH <= 0) {
                  // Alarm triggered!
                  clearInterval(timer);
                  return 0;
                }
                return prevH - 1;
              });
              return 59;
            }
            return prevMin - 1;
          });
          return 59;
        }
        return prevSec - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleConfirm = () => {
    setIsSuccessState(true);
    
    // Simulate haptic feedback as per design system requirements
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 20, 40]);
    }

    setTimeout(() => {
      setIsSuccessState(false);
      // Reset countdown to standard random safe time
      setHours(23);
      setMinutes(59);
      setSeconds(59);
      onConfirmSafety();
    }, 2200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-6 pb-24 max-w-[600px] mx-auto w-full mt-16 text-slate-100 z-10 relative"
    >
      {/* Central High-Tech Shield Visual */}
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        {/* Animated Background rings */}
        <div className="absolute inset-0 border border-indigo-500/10 rounded-full animate-pulse"></div>
        <div className="absolute inset-5 border border-indigo-500/20 rounded-full animate-ping z-0" style={{ animationDuration: '4s' }}></div>
        <div className="absolute inset-10 border border-indigo-500/30 rounded-full z-0"></div>

        {/* Shield Container */}
        <div className="relative z-10 w-44 h-44 rounded-full bg-slate-950/70 border border-slate-800/80 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.15)] backdrop-blur-md">
          <ShieldCheck className="w-24 h-24 text-indigo-400 animate-pulse drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
        </div>

        {/* Status Badge */}
        <div className="absolute -bottom-2 bg-emerald-600 text-white font-extrabold text-xs px-5 py-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 flex items-center gap-2 border border-emerald-500">
          <Shield className="w-3.5 h-3.5 fill-white" />
          MONITORING ACTIVE
        </div>
      </div>

      {/* Title Greeting Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          YOU ARE SAFE
        </h2>
        <p className="text-sm text-slate-400 font-bold">
          Security systems are fully operational.
        </p>
      </div>

      {/* Countdown Timer Card */}
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-[28px] p-6 mb-6 text-center shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest font-mono">
          Check-In Required In
        </p>
        <div className="text-4xl font-extrabold text-white flex items-center justify-center gap-2 select-none font-mono tracking-tight">
          <span className="tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{hours.toString().padStart(2, '0')}</span>
          <span className="text-indigo-400 text-xl font-sans font-bold">h</span>
          
          <span className="tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-indigo-400 text-xl font-sans font-bold">m</span>
          
          <span className="text-pink-500 tabular-nums drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">{seconds.toString().padStart(2, '0')}</span>
          <span className="text-pink-500/80 text-xl font-sans font-bold">s</span>
        </div>
      </div>

      {/* Main button Confirm Safety */}
      <div className="w-full space-y-4">
        <AnimatePresence mode="wait">
          {!isSuccessState ? (
            <motion.button 
              key="confirm-btn"
              initial={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              className="w-full h-20 bg-[#5B4BFF] hover:bg-indigo-500 text-white font-black text-2xl rounded-[24px] flex items-center justify-center gap-3.5 key-press duration-150 shadow-[0_0_20px_rgba(91,75,255,0.4)] cursor-pointer select-none border border-indigo-500"
            >
              <span>CONFIRM SAFETY</span>
            </motion.button>
          ) : (
            <motion.div 
              key="success-banner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-20 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-extrabold text-lg flex items-center justify-center gap-2 rounded-[24px] backdrop-blur-md"
            >
              <RefreshCw className="w-6 h-6 animate-spin" /> RESET PROTOCOL RESECURED
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-center text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-bold pt-1">
          Your emergency guardians will be alerted automatically if you do not confirm safety within the countdown limit.
        </p>
      </div>

      {/* Bottom Info Grid Widget */}
      <div className="grid grid-cols-2 gap-4 w-full mt-8">
        <div className="bg-slate-900/50 backdrop-blur-md p-4 border border-slate-800 rounded-[20px] flex flex-col gap-2 shadow-lg hover:border-indigo-500/30 transition-colors">
          <Users className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <span className="font-extrabold text-white text-sm">4 Guardians</span>
          <span className="text-xs text-slate-500 font-bold font-mono">On Standby</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md p-4 border border-slate-800 rounded-[20px] flex flex-col gap-2 shadow-lg hover:border-indigo-500/30 transition-colors">
          <Navigation className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          <span className="font-extrabold text-white text-sm">Live GPS</span>
          <span className="text-xs text-slate-500 font-bold font-mono">Sharing active</span>
        </div>
      </div>
    </motion.div>
  );
}
