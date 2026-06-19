import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Fingerprint, RefreshCw, AlertTriangle, ShieldCheck, MapPin, Camera } from 'lucide-react';
import { SecureStorage, SIMULATED_INTRUDER_AVATARS } from '../utils/security';
import ThreeDAvatar from './ThreeDAvatar';

interface VaultGateProps {
  onUnlock: (isDecoy: boolean) => void;
}

export default function VaultGate({ onUnlock }: VaultGateProps) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [errorText, setErrorText] = useState('');
  const [isBiometricValidating, setIsBiometricValidating] = useState(false);
  const [unlockTriggered, setUnlockTriggered] = useState(false);
  const [intruderTriggered, setIntruderTriggered] = useState(false);

  const correctPin = localStorage.getItem('endlif_app_pin') || '1234';
  const decoyPin = localStorage.getItem('endlif_decoy_pin') || '0000';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !unlockTriggered && !intruderTriggered) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorText('');
      
      // Auto submit at 4 digits
      if (nextPin.length === 4) {
        validatePin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === correctPin) {
      // Normal Unlock
      setUnlockTriggered(true);
      setTimeout(() => {
        onUnlock(false);
      }, 700);
    } else if (inputPin === decoyPin) {
      // Decoy Unlock (Coerced Bypass)
      setUnlockTriggered(true);
      localStorage.setItem('endlif_decoy_active', 'true');
      setTimeout(() => {
        onUnlock(true); // Decoy alert logged
      }, 700);
    } else {
      // Wrong code
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPin('');
      setErrorText(`Incorrect Passcode (Attempt ${nextAttempts}/3)`);
      
      if (window.navigator?.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }

      if (nextAttempts >= 3) {
        // Log critical hacker event & lock security console
        triggerIntruderAlert(inputPin);
      }
    }
  };

  const triggerIntruderAlert = (pinUsed: string) => {
    setIntruderTriggered(true);
    
    // Simulate coordinates
    const mockLat = +(37.7749 + (Math.random() - 0.5) * 0.02).toFixed(4);
    const mockLng = +(-122.4194 + (Math.random() - 0.5) * 0.02).toFixed(4);
    
    // Log intrusion profile
    const logsStr = localStorage.getItem('endlif_intruder_logs') || '[]';
    try {
      const parsedLogs = JSON.parse(logsStr);
      const newLog = {
        id: `intruder_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        pinEntered: pinUsed,
        coords: { lat: mockLat, lng: mockLng },
        snapshotUrl: SIMULATED_INTRUDER_AVATARS[Math.floor(Math.random() * SIMULATED_INTRUDER_AVATARS.length)]
      };
      parsedLogs.unshift(newLog);
      localStorage.setItem('endlif_intruder_logs', JSON.stringify(parsedLogs));
    } catch (e) {
      console.error("Intrusion logging failed", e);
    }
  };

  const triggerBiometricScan = () => {
    setIsBiometricValidating(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 10) {
        clearInterval(interval);
        setIsBiometricValidating(false);
        // Biometrics matched bypass
        setUnlockTriggered(true);
        setTimeout(() => {
          onUnlock(false);
        }, 700);
      }
    }, 150);
  };

  const resetIntruderLock = () => {
    setAttempts(0);
    setPin('');
    setIntruderTriggered(false);
    setErrorText('Emergency reset authorized. Re-enter valid lock.');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none select-none">
      
      {/* Absolute Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-950/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Red Alert Threat Overlay */}
      <AnimatePresence>
        {intruderTriggered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/95 z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-900/40 border border-red-500 flex items-center justify-center text-red-500 animate-bounce mb-6">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>

            <h2 className="text-2xl font-black tracking-wide text-red-500 uppercase">
              SECURITY LOCK DETECTED
            </h2>
            <p className="text-xs text-red-300 max-w-sm mt-3 font-semibold font-mono leading-relaxed">
              MAX INTRUDER ATTEMPTS REPLAYED. AN UNAUTHORIZED USER RECORDED. PHOTO CAPTURE REGISTERED ON TACTICAL SAFE CLOUD STORAGE.
            </p>

            {/* Simulated Live Viewport Capture Indicator */}
            <div className="mt-6 p-4 bg-slate-900 border border-red-900/60 rounded-2xl w-full max-w-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[7px] text-red-400 font-bold font-mono tracking-widest leading-none">REC FEED OUTLET ACTIVE</span>
              </div>
              <div className="w-full h-32 bg-slate-950 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-red-900/30">
                <Camera className="w-8 h-8 text-red-500/30 absolute animate-pulse" />
                <div className="text-[9px] text-slate-500 font-mono text-center relative z-10 px-4">
                  Front camera raster index: <br />
                  <span className="text-red-400 font-bold font-mono">100% EXPOSURE SAVED</span>
                </div>
              </div>
              <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                <span>GEO: 37.7749 N</span>
                <span>FAIL_CODE: {attempts} ERRORS</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 w-full max-w-xs">
              <button
                type="button"
                onClick={resetIntruderLock}
                className="w-full py-3 bg-red-650 hover:bg-red-600 border border-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                De-authorize lockout warning
              </button>
              <button
                type="button"
                onClick={() => onUnlock(false)}
                className="w-full py-2.5 bg-slate-900/60 border border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Override as developer (Safe Mode)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Guard Message */}
      <div className="text-center mt-12 flex flex-col items-center">
        <div className="mb-4">
          <ThreeDAvatar 
            config={{
              character: 'dragon',
              theme: unlockTriggered ? 'emerald' : 'indigo',
              accessory: 'none',
              aura: unlockTriggered ? 'fire' : 'none',
              motionStyle: unlockTriggered ? 'spin' : 'float'
            }} 
            size="md" 
            interactive={false} 
          />
        </div>

        <h1 className="text-xl font-black tracking-normal uppercase flex items-center justify-center gap-1.5">
          {unlockTriggered ? (
            <>
              <Unlock className="w-5 h-5 text-emerald-500 animate-bounce" /> Securing Access...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 text-indigo-500" /> Vault Gate Lock
            </>
          )}
        </h1>
        
        <p className={`text-[10px] uppercase tracking-wider font-mono font-extrabold mt-1.5 ${
          errorText ? 'text-rose-500' : 'text-slate-400'
        }`}>
          {errorText || "Enter 4-Digit biometric validation passcode"}
        </p>
      </div>

      {/* Entering PIN Indicator Bullets */}
      <div className="flex items-center justify-center gap-4 my-6">
        {[0, 1, 2, 3].map((idx) => {
          const filled = pin.length > idx;
          return (
            <motion.div
              key={idx}
              animate={{
                scale: filled ? [1, 1.25, 1.1] : 1,
                backgroundColor: filled ? (unlockTriggered ? '#10b981' : '#4f46e5') : '#334155'
              }}
              className="w-4.5 h-4.5 rounded-full border border-slate-800 shadow-inner"
              transition={{ duration: 0.12 }}
            />
          );
        })}
      </div>

      {/* Interactive Keypad Stage */}
      <div className="w-full max-w-sm mx-auto mb-8 px-4">
        {isBiometricValidating ? (
          <div className="h-72 bg-slate-900/60 border border-indigo-950 rounded-3xl flex flex-col items-center justify-center gap-4 text-center p-6 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 to-transparent animate-pulse" />
            <Fingerprint className="w-16 h-16 text-indigo-500 animate-ping absolute opacity-30" />
            <Fingerprint className="w-16 h-16 text-indigo-400 animate-pulse relative" />
            <div className="text-xs font-mono text-slate-400 font-extrabold animate-pulse uppercase tracking-widest mt-2">
              Scanning Biometric ID Nodes... <br />
              <span className="text-indigo-400 text-[10px]">98% COMPATIBLE</span>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold leading-normal font-sans max-w-xs">
              Matching thermal facial anchors and thumb vectors securely against on-device encrypted keychain indexes (Sandy sandbox context).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="w-16 h-16 font-sans font-black text-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-750 text-slate-100 rounded-full flex items-center justify-center transition-all active:scale-[0.88] cursor-pointer shadow-md select-none"
              >
                {num}
              </button>
            ))}

            {/* Back deletion option */}
            <button
              type="button"
              onClick={handleDelete}
              className="w-16 h-16 bg-slate-950/40 text-slate-400 hover:text-slate-200 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.88] cursor-pointer text-center select-none"
            >
              Clear
            </button>

            {/* 0 button */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 font-sans font-black text-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-750 text-slate-100 rounded-full flex items-center justify-center transition-all active:scale-[0.88] cursor-pointer shadow-md select-none"
            >
              0
            </button>

            {/* Fingerprint / Biometric bypass option */}
            <button
              type="button"
              onClick={triggerBiometricScan}
              className="w-16 h-16 bg-indigo-950/60 border border-indigo-900/70 hover:bg-indigo-900 text-indigo-400 rounded-full flex items-center justify-center transition-all active:scale-[0.88] cursor-pointer shadow-lg select-none"
              title="Simulate FaceID / Biometric Sensor"
            >
              <Fingerprint className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[9px] text-slate-500 font-mono mb-4 w-full">
        <span>SECURITY ENVELOPE: ACTIVE SANDBOX • SECTOR V: RECOVERY SECURED • SSL ON</span>
      </div>
    </div>
  );
}
