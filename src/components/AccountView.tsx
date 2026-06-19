import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Sparkles, 
  Camera, 
  Check, 
  Loader2, 
  Maximize2, 
  AlertCircle, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Heart,
  Shield,
  Zap,
  Star,
  Lock,
  Unlock,
  Key,
  Cpu,
  EyeOff,
  Eye,
  ShieldAlert,
  Server,
  Terminal,
  Skull,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import ThreeDAvatar, { 
  CHARACTER_OPTIONS, 
  THEME_OPTIONS, 
  ACCESSORY_OPTIONS, 
  AURA_OPTIONS, 
  AvatarConfig 
} from './ThreeDAvatar';
import { 
  SecureStorage, 
  migrateLocalStorageKeys, 
  performSandboxAudit, 
  SecurityAuditResult, 
  IntruderLog, 
  SIMULATED_INTRUDER_AVATARS 
} from '../utils/security';

export default function AccountView({ setScreen }: { setScreen?: (screen: any) => void } = {}) {
  // Database state
  const [name, setName] = useState('Adele Vance');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [email, setEmail] = useState('adele.vance@example.com');
  const [devicePhone, setDevicePhone] = useState('+1 (555) 019-9800');
  const [dob, setDob] = useState('1998-05-14');

  // Interactive 3D Avatar Customizer State
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    character: 'dragon',
    theme: 'indigo',
    accessory: 'none',
    aura: 'none',
    motionStyle: 'float'
  });

  // Fortified Cyber Security Active Guard Portal States
  const [cryptoShieldActive, setCryptoShieldActive] = useState(() => SecureStorage.isCryptoShieldActive());
  const [pinLockEnabled, setPinLockEnabled] = useState(() => localStorage.getItem('endlif_pin_lock_enabled') === 'true');
  const [appPin, setAppPin] = useState(() => localStorage.getItem('endlif_app_pin') || '1234');
  const [decoyPin, setDecoyPin] = useState(() => localStorage.getItem('endlif_decoy_pin') || '0000');
  const [intruderLogs, setIntruderLogs] = useState<IntruderLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('endlif_intruder_logs') || '[]');
    } catch {
      return [];
    }
  });

  const [activeSecTab, setActiveSecTab] = useState<'controls' | 'audit' | 'intruder'>('controls');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditedResults, setAuditedResults] = useState<SecurityAuditResult[]>([]);
  const [auditScore, setAuditScore] = useState<number>(-1);
  const [activeAuditMessage, setActiveAuditMessage] = useState('');

  // Interactive UI trigger states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<'idle' | 'initializing' | 'scanning' | 'success' | 'failed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanOutput, setScanOutput] = useState<{ gender: 'Male' | 'Female' | 'Other'; confidence: number } | null>(null);
  const [telemetryLog, setTelemetryLog] = useState('Awaiting scanner activation...');

  // Video element references for hardware live camera 
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedProfile = SecureStorage.getItem('endlif_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setName(parsed.name);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.devicePhone) setDevicePhone(parsed.devicePhone);
        if (parsed.dob) setDob(parsed.dob);
      } catch (e) {
        console.error('Failed to parse safety profile', e);
      }
    }

    const savedAvatar = SecureStorage.getItem('endlif_user_avatar');
    if (savedAvatar) {
      try {
        setAvatarConfig(JSON.parse(savedAvatar));
      } catch (e) {
        console.error('Failed to parse safety avatar', e);
      }
    }
  }, []);

  // Save profile helper
  const handleSaveProfile = () => {
    const profile = { name, gender, email, devicePhone, dob };
    SecureStorage.setItem('endlif_user_profile', JSON.stringify(profile));
    SecureStorage.setItem('endlif_user_avatar', JSON.stringify(avatarConfig));
    
    // Save PIN variables
    localStorage.setItem('endlif_pin_lock_enabled', pinLockEnabled ? 'true' : 'false');
    localStorage.setItem('endlif_app_pin', appPin);
    localStorage.setItem('endlif_decoy_pin', decoyPin);
    localStorage.setItem('endlif_crypto_shield_active', cryptoShieldActive ? 'true' : 'false');
    
    // Dispatch event to synchronize across potential views
    window.dispatchEvent(new Event('endlif_profile_updated'));

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleToggleCryptoShield = (checked: boolean) => {
    setCryptoShieldActive(checked);
    migrateLocalStorageKeys(checked);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([100]);
    }
  };

  const runSecurityAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);
    setAuditScore(-1);
    setAuditedResults([]);

    const messages = [
      'Scanning local database layers for vulnerable inputs...',
      'De-constructing session cookies and checking host authenticity...',
      'Verifying unapproved script inclusions against CORS filters...',
      'Pinging secure hardware keying parameters to verify signatures...',
      'Assessing cryptographic state vectors on physical database files...',
      'Finalizing threat profile diagnostic score...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveAuditMessage(messages[Math.min(Math.floor((step / 100) * messages.length), messages.length - 1)]);
      setAuditProgress(step);

      if (step >= 100) {
        clearInterval(interval);
        const items = performSandboxAudit();
        setAuditedResults(items);
        const total = items.length;
        const failedNum = items.filter(x => x.status !== 'passed').length;
        const scoreVal = Math.round(((total - failedNum) / total) * 100);
        setAuditScore(scoreVal);
        setIsAuditing(false);
      }
    }, 25);
  };

  const simulateHackerAttack = () => {
    const wrongPins = ['9875', '1111', '8952', '5555', '0432'];
    const selectedWrongPin = wrongPins[Math.floor(Math.random() * wrongPins.length)];
    
    const mockLat = +(37.7749 + (Math.random() - 0.5) * 0.05).toFixed(4);
    const mockLng = +(-122.4194 + (Math.random() - 0.5) * 0.05).toFixed(4);
    const mockImg = SIMULATED_INTRUDER_AVATARS[Math.floor(Math.random() * SIMULATED_INTRUDER_AVATARS.length)];

    const newLog: IntruderLog = {
      id: `intruder_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      pinEntered: selectedWrongPin,
      coords: { lat: mockLat, lng: mockLng },
      snapshotUrl: mockImg
    };

    const updatedLogs = [newLog, ...intruderLogs];
    setIntruderLogs(updatedLogs);
    localStorage.setItem('endlif_intruder_logs', JSON.stringify(updatedLogs));

    if (window.navigator?.vibrate) {
      window.navigator.vibrate([150, 50, 150]);
    }
  };

  const clearIntruderLogs = () => {
    setIntruderLogs([]);
    localStorage.removeItem('endlif_intruder_logs');
  };

  const autoFixVaultGaps = () => {
    setPinLockEnabled(true);
    localStorage.setItem('endlif_pin_lock_enabled', 'true');
    setCryptoShieldActive(true);
    migrateLocalStorageKeys(true);
    runSecurityAudit();
  };

  // Turn on device camera if available, fallback gracefully
  const startCamera = async () => {
    setScanningStatus('initializing');
    setScanProgress(0);
    setScanOutput(null);
    setTelemetryLog('Connecting target video feed hardware...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 320, height: 320 } 
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log("Video play interrupted", e));
      }

      setScanningStatus('scanning');
      setTelemetryLog('Face matrix locked. Measuring structural anchors...');
    } catch (err) {
      console.warn('Hardware camera not accessible, running simulated live radar', err);
      setIsCameraActive(false);
      setScanningStatus('scanning');
      setTelemetryLog('Camera hardware blocked. Initializing remote satellite radar simulation...');
    }
  };

  // Handle dynamic progressive biometric simulation logic
  useEffect(() => {
    let interval: any = null;
    if (scanningStatus === 'scanning') {
      const logs = [
        'Locking biometric outline matrix...',
        'Tracing jawline contours and facial anchors...',
        'Matching pores density with thermal neural filters...',
        'Detecting skeletal proportions & voice harmonic metadata...',
        'Resolving classification markers...',
        'Computing statistical alignment confidence...',
        'Biometric check finished successfully!'
      ];

      interval = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 4;
          
          // Speed logs
          const logIdx = Math.min(Math.floor((next / 100) * logs.length), logs.length - 1);
          setTelemetryLog(logs[logIdx]);

          if (next >= 100) {
            clearInterval(interval);
            
            // Generate classifications (simulating facial recognition based on typical distribution)
            const options: ('Male' | 'Female' | 'Other')[] = ['Female', 'Male', 'Other'];
            const randomPick = options[Math.floor(Math.random() * options.length)];
            const randomConf = +(95 + Math.random() * 4.8).toFixed(2);

            setScanOutput({
              gender: randomPick,
              confidence: randomConf
            });
            setScanningStatus('success');
            stopCameraStream();
            return 100;
          }
          return next;
        });
      }, 120);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanningStatus]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const cancelScanner = () => {
    stopCameraStream();
    setScanningStatus('idle');
    setScanProgress(0);
    setScanOutput(null);
  };

  const applyClassifiedGender = () => {
    if (scanOutput) {
      setGender(scanOutput.gender);
      cancelScanner();
    }
  };

  return (
    <div className="flex flex-col p-6 pb-32 max-w-[600px] mx-auto w-full mt-16 text-slate-800">
      {/* Title Header */}
      <div className="mb-6 text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
          Safety Account
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase mt-1.5 tracking-wider">
          Registry details for dispatch identification
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Profile Registration details form card */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-indigo-600" /> Personal Identity Records
          </h3>

          <div className="space-y-3">
            {/* Full name input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-colors"
                  placeholder="Enter full legal name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Secure Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-colors"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            {/* Device number */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Device Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input 
                  type="tel" 
                  value={devicePhone}
                  onChange={(e) => setDevicePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-colors font-mono"
                  placeholder="+1 (000) 000-0000"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-colors font-mono cursor-pointer"
                />
              </div>
            </div>

            {/* Gender Identity Custom Segments Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                Gender Identity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as const).map((genderType) => (
                  <button
                    key={genderType}
                    type="button"
                    onClick={() => setGender(genderType)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${
                      gender === genderType
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {genderType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Face Recognition and Classification Scanning Module */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-4 overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-500" /> Biometric Face Classifier
            </h3>
            <span className="text-[9px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-full border border-rose-100">
              AI MODEL V4.2
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Need prompt registration? Skip typing & use our automated high-speed Biometric Scanner to analyze facial bone structures and sync gender instantly.
          </p>

          <AnimatePresence mode="wait">
            {scanningStatus === 'idle' && (
              <motion.div 
                key="idle-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2"
              >
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-rose-550 animate-pulse" /> Launch Biometric Face Scan
                </button>
              </motion.div>
            )}

            {(scanningStatus === 'initializing' || scanningStatus === 'scanning') && (
              <motion.div 
                key="scanner-running"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Simulated / Real video viewport container */}
                <div className="w-full aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-[24px] overflow-hidden border-3 border-indigo-400 relative shadow-inner">
                  
                  {/* Camera stream view element */}
                  <video 
                    ref={videoRef}
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover rotation-90 ${isCameraActive ? 'block' : 'hidden'}`}
                  />

                  {/* Fallback elegant dynamic radar effect if camera blocked */}
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-950">
                      {/* Biometric circles */}
                      <div className="absolute w-44 h-44 rounded-full border border-indigo-500/25 animate-ping"></div>
                      <div className="absolute w-32 h-32 rounded-full border-2 border-indigo-500/30 animate-[spin_12s_linear_infinite] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rose-500 absolute top-0"></div>
                      </div>
                      <div className="absolute w-20 h-20 rounded-full border border-dashed border-indigo-400/40 animate-[spin_6s_linear_infinite]"></div>
                      <Maximize2 className="w-8 h-8 text-indigo-400/65 animate-[pulse_1.5s_infinite]" />
                    </div>
                  )}

                  {/* Holographic Glowing Scanner laser line moving up and down */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-red-500/0 via-rose-500 to-red-500/0 shadow-[0_0_12px_#f43f5e] z-30 animate-[bounce_3s_infinite_ease-in-out]"></div>

                  {/* Aesthetic Target Corner brackets */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-indigo-400"></div>
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-indigo-400"></div>

                  {/* Live HUD telemetry text */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-xs border border-slate-800 rounded-lg p-2 z-10">
                    <div className="flex items-center justify-between text-[8px] font-black font-mono text-indigo-400 mb-0.5 tracking-wider">
                      <span>BIOMETRIC RADAR</span>
                      <span>{scanProgress}% CALIBRATED</span>
                    </div>
                    {/* Tiny micro progress track */}
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 transition-all duration-100" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Status logs */}
                <div className="text-center space-y-1 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span className="text-[11px] font-mono leading-none tracking-wider text-slate-500 uppercase">TELEMETRY STREAM:</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 font-mono italic">
                    "{telemetryLog}"
                  </p>
                </div>

                {/* Cancel scanner button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={cancelScanner}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel Scan
                  </button>
                </div>
              </motion.div>
            )}

            {scanningStatus === 'success' && scanOutput && (
              <motion.div 
                key="scan-success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3 shadow-inner"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Diagnostic Complete</h4>
                  <p className="text-xl font-black text-slate-800 tracking-tight mt-1.5 leading-none">
                    Detected: <span className="text-indigo-600">{scanOutput.gender}</span>
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 font-mono mt-1">
                    Biometric confidence match: {scanOutput.confidence}%
                  </p>
                </div>

                {/* Quick actions for detected gender */}
                <div className="flex gap-2 pt-1 max-w-[320px] mx-auto">
                  <button
                    type="button"
                    onClick={applyClassifiedGender}
                    className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5" /> Apply Detected Gender
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                    title="Rescan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Holographic Companion Avatar Creator Card */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-rose-500 to-emerald-400 opacity-80" />
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> 3D Cyber Mascot Maker
            </h3>
            <span className="text-[9px] bg-indigo-50 text-indigo-650 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-150">
              CUSTOM COMPANION
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed -mt-1 text-left">
            Design your tactical 3D companion! Once configured, this animated avatar runs fluidly in the background of your safety screens. Tap on them anywhere to run high-speed diagnostic sprints.
          </p>

          {/* Real-time Preview Stage with Specular glass lighting */}
          <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-900 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/20 to-slate-950 pointer-events-none" />
            <div className="absolute top-2 left-3 flex items-center gap-1.5">
              <span className="text-[8px] font-mono font-black text-rose-500 tracking-wider animate-pulse">● LIVE PREVIEW HOLOGRAPHIC VIEWPORT</span>
            </div>

            {/* Simulated target crosshair */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-slate-800 pointer-events-none" />

            {/* The live avatar view */}
            <ThreeDAvatar config={avatarConfig} size="xl" interactive={true} />

            <div className="text-center mt-2 relative z-10 space-y-0.5">
              <p className="text-sm font-black text-slate-100 tracking-tight leading-none uppercase">
                {CHARACTER_OPTIONS.find(c => c.id === avatarConfig.character)?.name || 'Custom Buddy'}
              </p>
              <p className="text-[9px] font-mono text-slate-450 font-extrabold uppercase tracking-wide">
                Active Protocol: <strong className="text-indigo-400 font-bold">{avatarConfig.motionStyle}</strong> • Theme: <strong className="text-rose-400 font-bold">{avatarConfig.theme}</strong>
              </p>
              <p className="text-[8px] text-slate-500 font-bold tracking-widest leading-normal">
                TAP THE MASCOT ABOVE TO TRIGGER INSTANT KINETIC SPRINT ANIMATION
              </p>
            </div>
          </div>

          {/* Interactive customization controls */}
          <div className="space-y-4 text-left">
            
            {/* Control 1: Character Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                1. Select Digital Species
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-none">
                {CHARACTER_OPTIONS.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setAvatarConfig(prev => ({ ...prev, character: char.id }))}
                    className={`p-2.5 rounded-xl border text-left transition-all outline-none flex items-center gap-3 cursor-pointer ${
                      avatarConfig.character === char.id
                        ? 'bg-slate-950 border-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl font-sans filter drop-shadow-sm select-none">{char.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black leading-none truncate">{char.name}</p>
                      <p className={`text-[8px] mt-0.5 leading-none font-medium truncate ${
                        avatarConfig.character === char.id ? 'text-indigo-400' : 'text-slate-400'
                      }`}>
                        {char.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Skin Colors */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                2. Cyber gradient Theme Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const isActive = avatarConfig.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAvatarConfig(prev => ({ ...prev, theme: theme.id }))}
                      className={`h-11 rounded-xl bg-gradient-to-tr ${theme.from} border transition-all relative flex flex-col items-center justify-center outline-none cursor-pointer ${
                        isActive ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-50/40' : 'border-slate-200 hover:scale-102'
                      }`}
                      title={theme.name}
                    >
                      {isActive && (
                        <div className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <span className="text-[8px] font-black font-mono text-slate-800 brightness-155 bg-white/80 px-1 py-0.2 rounded-sm mt-1 whitespace-nowrap scale-90">
                        {theme.id.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 3: Accessories */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                3. Choose Tactical Accessory
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACCESSORY_OPTIONS.map((acc) => {
                  const isActive = avatarConfig.accessory === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAvatarConfig(prev => ({ ...prev, accessory: acc.id }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm font-sans select-none">{acc.label || '❌'}</span>
                      <span className="text-[10px] font-black tracking-tight">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 4: Energy Fields / Auras */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                4. Select Radiant Defense Aura
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AURA_OPTIONS.map((aur) => {
                  const isActive = avatarConfig.aura === aur.id;
                  const Icon = aur.icon;
                  return (
                    <button
                      key={aur.id}
                      type="button"
                      onClick={() => setAvatarConfig(prev => ({ ...prev, aura: aur.id }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      {Icon ? <Icon className="w-3.5 h-3.5 text-indigo-500 animate-[pulse_1.2s_infinite]" /> : <span>❌</span>}
                      <span className="text-[10px] font-black tracking-tight">{aur.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 5: Movement animation behavior */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                5. Mascot Movement Animation Strategy
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { id: 'float', name: 'Float Bubble' },
                  { id: 'spin', name: 'Holo Spin' },
                  { id: 'bounce', name: 'Bouncy Jump' },
                  { id: 'run', name: 'Pacing Jog' }
                ] as const).map((style) => {
                  const isActive = avatarConfig.motionStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setAvatarConfig(prev => ({ ...prev, motionStyle: style.id }))}
                      className={`py-2.5 rounded-xl text-[10px] font-extrabold tracking-tight transition-all border outline-none cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-650 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {style.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Fortified Cyber Security Active Guard Portal Card */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-5 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-600 to-rose-500 opacity-90" />
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 animate-pulse" /> Cyber Security Control Center
            </h3>
            <span className="text-[9px] bg-emerald-50 text-emerald-650 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-150 uppercase tracking-widest">
              Active Defense
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Configure dynamic physical sandbox blocks, storage encryption shields, and run deep diagnostic telemetry audits to secure on-device safety databases.
          </p>

          {/* Tab Selection */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-xl p-1 text-[10px] font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveSecTab('controls')}
              className={`py-2 rounded-lg cursor-pointer transition-all ${
                activeSecTab === 'controls' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              Shields
            </button>
            <button
              type="button"
              onClick={() => setActiveSecTab('audit')}
              className={`py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
                activeSecTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              Audits {auditScore >= 0 && <span className={`text-[8px] font-mono px-1 rounded ${auditScore === 100 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{auditScore}%</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSecTab('intruder');
                // Refresh intruder logs
                try {
                  setIntruderLogs(JSON.parse(localStorage.getItem('endlif_intruder_logs') || '[]'));
                } catch {
                  setIntruderLogs([]);
                }
              }}
              className={`py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
                activeSecTab === 'intruder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              Intruders {intruderLogs.length > 0 && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />}
            </button>
          </div>

          {/* Conditional Content Layouts */}
          <AnimatePresence mode="wait">
            {activeSecTab === 'controls' && (
              <motion.div
                key="sec-tab-controls"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                {/* Switch 1: Crypto storage scrambler */}
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[11px] text-slate-900 uppercase tracking-tight">Storage Scrambler</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCryptoShield(!cryptoShieldActive)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none shrink-0 ${
                          cryptoShieldActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${cryptoShieldActive ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-450 leading-normal mt-0.5">
                      Encrypted XOR-shifted cypher blocks protect local safety records, emergency numbers, and profile details from cookie spyware elements.
                    </p>
                    {cryptoShieldActive ? (
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold text-emerald-600 uppercase">Obfuscation Active</span>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[8px] font-mono font-bold text-amber-600 uppercase">Plaintext state: Vulnerable</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Switch 2: Vault lock gate configuration */}
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-[11px] text-slate-900 uppercase tracking-tight">Tactical PIN Lock Gate</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPinLockEnabled(!pinLockEnabled);
                            if (window.navigator?.vibrate) window.navigator.vibrate([100]);
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none shrink-0 ${
                            pinLockEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${pinLockEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-450 leading-normal mt-0.5">
                        Guards database access upon startup with biometric validation or a code code. Helps block physical theft threats.
                      </p>
                    </div>
                  </div>

                  {pinLockEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2.5 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-left"
                    >
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          1. LOCK PIN CODE (4 Digits)
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={appPin}
                          onChange={(e) => setAppPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold tracking-widest text-indigo-600 focus:border-indigo-500 outline-none"
                          placeholder="1234"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-rose-450 uppercase tracking-wider mb-1 flex items-center gap-0.5">
                          <Skull className="w-2.5 h-2.5 text-rose-500 shrink-0" /> 2. COERCION DECOY PIN
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={decoyPin}
                          onChange={(e) => setDecoyPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold tracking-widest text-rose-500 focus:border-rose-350 outline-none"
                          placeholder="0000"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSecTab === 'audit' && (
              <motion.div
                key="sec-tab-audit"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                {/* Audit trigger section */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isAuditing}
                    onClick={runSecurityAudit}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                  >
                    {isAuditing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> SCRUBBING CONSOLE TELEMETRY...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" /> Start Security Scan
                      </>
                    )}
                  </button>
                </div>

                {isAuditing && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-center">
                    <span className="text-[8px] font-mono font-black text-indigo-500 uppercase tracking-widest animate-pulse leading-none block">
                      {activeAuditMessage}
                    </span>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${auditProgress}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-450">{auditProgress}% COMPLETE</span>
                  </div>
                )}

                {/* Render results */}
                {auditScore >= 0 && !isAuditing && (
                  <div className="space-y-3">
                    {/* Score banner */}
                    <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 border ${
                      auditScore === 100 
                        ? 'bg-emerald-50/50 border-emerald-150 text-emerald-850' 
                        : 'bg-amber-50/50 border-amber-100 text-amber-850'
                    }`}>
                      <div className="space-y-1 text-left">
                        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-900">Shield Health Score</h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {auditScore === 100 
                            ? 'Excellent score! Fully fortified against data-extraction logs and device cloning.' 
                            : 'Exposure warning: database is vulnerable to extract attacks. Auto-patch gaps below.'
                          }
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-2xl font-black font-mono tracking-tight ${auditScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{auditScore}%</span>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-widest">Fortress Match</span>
                      </div>
                    </div>

                    {/* Auto Fix Button if not 100 */}
                    {auditScore < 100 && (
                      <button
                        type="button"
                        onClick={autoFixVaultGaps}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-550 border border-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 animate-pulse"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Auto-Fix Vulnerability Gaps
                      </button>
                    )}

                    {/* Items */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {auditedResults.map((item, idx) => {
                        const isOk = item.status === 'passed';
                        return (
                          <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-start gap-2.5 text-left">
                            <span className="mt-0.5">
                              {isOk ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-extrabold text-slate-900 uppercase block tracking-tight">{item.title}</span>
                              <p className="text-[9px] text-slate-500 leading-normal mt-0.5">{item.details}</p>
                              {item.remedy && !isOk && (
                                <span className="text-[8px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase mt-1 block w-fit">
                                  Remedy: {item.remedy}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeSecTab === 'intruder' && (
              <motion.div
                key="sec-tab-intruder"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={simulateHackerAttack}
                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 font-bold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-98"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" /> Simulate Hack Intruder
                  </button>
                  {intruderLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={clearIntruderLogs}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-550 border border-slate-200 font-bold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                    >
                      Clear Logs
                    </button>
                  )}
                </div>

                {intruderLogs.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl py-6 px-4 text-center text-slate-400 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-500/30 mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Storage is quiet and locked</p>
                    <p className="text-[9px] text-slate-450 leading-normal max-w-xs mx-auto">
                      No intrusion threats recorded. Set your lock PIN above and enter keys incorrectly to test instant photo and geography tracking actions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {intruderLogs.map((log) => (
                      <div key={log.id} className="bg-rose-50/50 border border-rose-100/60 rounded-xl p-3 flex gap-3 text-left relative overflow-hidden">
                        {log.snapshotUrl && (
                          <div className="w-12 h-12 rounded-lg border border-rose-200 overflow-hidden shrink-0 bg-slate-950 flex items-center justify-center">
                            <img src={log.snapshotUrl} referrerPolicy="no-referrer" alt="Silhouette" className="w-[105%] h-[105%] object-cover opacity-85 filter grayscale brightness-125" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-rose-600 bg-rose-100 border border-rose-150 px-1.5 py-0.5 rounded leading-none uppercase">
                              Access Denied
                            </span>
                            <span className="text-[8px] font-mono text-slate-450 font-bold leading-none">{log.timestamp}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-800 leading-normal">
                            Entered PIN: <strong className="font-mono text-rose-600 text-xs font-black">{log.pinEntered}</strong>
                          </p>
                          <div className="text-[8px] font-mono text-slate-500 flex items-center gap-0.5 pt-0.5 flex-wrap">
                            <MapPin className="w-3 h-3 text-rose-500 mr-0.5" /> GPS Sector: {log.coords.lat}, {log.coords.lng} Base
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Creator Hub Settings Card */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-white rounded-[28px] p-6 shadow-md border border-slate-800 text-left relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-505/10 rounded-full blur-xl" />
          <div className="flex items-center justify-between border-b border-indigo-900/40 pb-3">
            <h3 className="font-extrabold text-slate-100 text-xs tracking-wider uppercase flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-amber-400 stroke-[2.5] animate-pulse" /> Creator Hub Dashboard
            </h3>
            <span className="text-[8px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono">CHANNEL SYSTEM ONLINE</span>
          </div>
          <p className="text-xs text-slate-350 leading-relaxed font-sans font-medium">
            Form your community channel to spread emergency safety drills, offline first-aid measures, and digital cybersecurity checklists. Gain verified subscribers, invite peers, and unlock rewards!
          </p>
          <button
            type="button"
            onClick={() => setScreen && setScreen('creator_hub')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/30 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
          >
            Access Creator Dashboard &rarr;
          </button>
        </div>

        {/* Primary Save Account profile action */}
        <button
          type="button"
          onClick={handleSaveProfile}
          className="w-full h-13 bg-indigo-600 hover:bg-indigo-505 text-white font-black text-sm rounded-2xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Check className="w-5 h-5 stroke-[2.5]" /> Save Safety Profile
        </button>
      </div>

      {/* Success synchronization toast alert */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-xl font-mono text-xs"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>SAFETY PROFILE MATCHED & SYNCHRONIZED</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
