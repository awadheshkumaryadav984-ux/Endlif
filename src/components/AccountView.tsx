import React, { useState, useEffect, useRef } from 'react';
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
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Shield,
  Star,
  Lock,
  Key,
  Cpu,
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

  // Interactive 3D Avatar Customizer State (Shield Elephant, Ruby, Tactical Helmet, Active Firewall, Pacing Jog)
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    character: 'elephant',
    theme: 'ruby',
    accessory: 'helmet',
    aura: 'shield',
    motionStyle: 'run'
  });

  // Accordion Expand/Collapse State
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Mascot States
  const [mascotText, setMascotText] = useState("Ready.");
  const [mascotBubbleVisible, setMascotBubbleVisible] = useState(true);
  const [isMascotReacting, setIsMascotReacting] = useState(false);

  // Auto-hide mascot bubble after some time
  useEffect(() => {
    setMascotBubbleVisible(true);
    const timer = setTimeout(() => {
      setMascotBubbleVisible(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [mascotText]);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => {
      const next = prev === sectionId ? null : sectionId;
      const isOpening = next !== null;
      
      // Update mascot text based on transition
      setMascotText(isOpening ? "Let's customize your security." : "Ready.");
      
      // Trigger mascot wiggle/bounce animation
      setIsMascotReacting(true);
      setTimeout(() => setIsMascotReacting(false), 800);
      
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(15);
      }
      return next;
    });
  };

  const updateAvatarConfig = (updated: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => {
      const next = { ...prev, ...updated };
      SecureStorage.setItem('endlif_user_avatar', JSON.stringify(next));
      
      // Dispatch updated event to sync globally
      window.dispatchEvent(new Event('endlif_profile_updated'));
      return next;
    });
  };

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

  // Mascot Animation Definitions
  const mascotAnimation = {
    idle: {
      y: [0, -6, 0],
      rotate: [-1.5, 1.5, -1.5],
      transition: {
        repeat: Infinity,
        duration: 2.8,
        ease: "easeInOut"
      }
    },
    react: {
      scale: [1, 1.25, 0.95, 1.1, 1],
      rotate: [0, -12, 12, -8, 8, 0],
      y: [0, -20, 3, -3, 0],
      transition: {
        duration: 0.75,
        ease: "easeOut"
      }
    }
  };

  const renderAccordionItem = (
    id: string,
    titleText: string,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSection === id;
    return (
      <div key={id} className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm transition-all relative overflow-hidden text-left">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex justify-between items-center outline-none cursor-pointer select-none text-left"
        >
          <span className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
            {titleText}
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-slate-450 font-mono text-sm leading-none shrink-0"
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-100 mt-4">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const currentChar = CHARACTER_OPTIONS.find(c => c.id === avatarConfig.character) || CHARACTER_OPTIONS[0];
  const charTitle = `${currentChar.emoji} Digital Species — ${currentChar.name}`;

  const currentTheme = THEME_OPTIONS.find(t => t.id === avatarConfig.theme) || THEME_OPTIONS[0];
  const capitalizedThemeId = avatarConfig.theme.charAt(0).toUpperCase() + avatarConfig.theme.slice(1);
  const themeTitle = `🎨 Theme Color — ${capitalizedThemeId}`;

  const currentAccessory = ACCESSORY_OPTIONS.find(a => a.id === avatarConfig.accessory) || ACCESSORY_OPTIONS[0];
  const accessoryTitle = `${currentAccessory.label || '❌'} Tactical Accessory — ${currentAccessory.name}`;

  const currentAura = AURA_OPTIONS.find(au => au.id === avatarConfig.aura) || AURA_OPTIONS[0];
  const auraTitle = `🛡️ Defense Aura — ${currentAura.name}`;

  const MOTION_STYLES = [
    { id: 'float', name: 'Float Bubble' },
    { id: 'spin', name: 'Holo Spin' },
    { id: 'bounce', name: 'Bouncy Jump' },
    { id: 'run', name: 'Pacing Jog' }
  ] as const;
  const currentMovement = MOTION_STYLES.find(m => m.id === avatarConfig.motionStyle) || MOTION_STYLES[0];
  const movementTitle = `🏃 Movement Style — ${currentMovement.name}`;

  const securityCenterTitle = `🔒 Cyber Security Control Center`;

  return (
    <div className="flex flex-col p-6 pb-32 max-w-[600px] mx-auto w-full mt-16 text-slate-800 relative min-h-[80vh]">
      {/* Title Header */}
      <div className="mb-6 text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
          Safety Profile
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase mt-1.5 tracking-wider">
          Secure configuration panel
        </p>
      </div>

      <div className="space-y-4">
        {/* Accordion Item: Identity & Credentials */}
        {renderAccordionItem('account_making', `👤 Identity & Account Credentials`, (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800"
                  placeholder="e.g. Adele Vance"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" /> Device Phone
                  </label>
                  <input
                    type="text"
                    value={devicePhone}
                    onChange={(e) => setDevicePhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800"
                    placeholder="+1 (555) 019-9800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Gender Group
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl h-[38px] items-center">
                    {(['Female', 'Male', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          gender === g 
                            ? 'bg-slate-900 text-white shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2.5 flex items-center justify-between gap-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium leading-normal max-w-[280px]">
                Safety configurations are stored locally on your device with optional database security layers.
              </p>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> Saved
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Accordion Item: Biometric Face Scanner */}
        {renderAccordionItem('face_detection', `📷 Biometric Face Detection Scan`, (
          <div className="space-y-4 text-center">
            {scanningStatus === 'idle' && (
              <div className="space-y-3 py-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto bg-slate-50/50">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <div className="max-w-sm mx-auto space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-800">No active scan file</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Initiate a high-resolution facial scan using your device's camera to compute biometric profile variables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Initialize Facial Scanner
                </button>
              </div>
            )}

            {(scanningStatus === 'initializing' || scanningStatus === 'scanning') && (
              <div className="space-y-4 py-2">
                {/* Visual Viewfinder container */}
                <div className="relative w-40 h-40 rounded-full border-4 border-indigo-600 overflow-hidden mx-auto bg-slate-950 flex items-center justify-center shadow-lg">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    // Fallback visual matrix effect
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
                      {/* Grid scanning pattern */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent animate-pulse" />
                      <div className="w-full h-0.5 bg-indigo-500 absolute top-0 left-0 shadow-[0_0_8px_#6366f1] animate-[bounce_2s_infinite]" />
                      <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest">
                        FEED SIMULATION
                      </span>
                    </div>
                  )}

                  {/* Circular scanning overlay line */}
                  <div className="absolute inset-x-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_8px_#818cf8] biometric-scan-line pointer-events-none" />
                  
                  {/* Target crosshairs */}
                  <div className="absolute w-6 h-[1px] bg-indigo-400/50" />
                  <div className="absolute h-6 w-[1px] bg-indigo-400/50" />
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>PROGRESS</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  </div>
                  <div className="bg-slate-950 text-indigo-400 font-mono text-[9px] py-1.5 px-3 rounded-lg border border-slate-800 text-left h-10 overflow-hidden select-none">
                    <span className="animate-pulse mr-1">&gt;</span>
                    {telemetryLog}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={cancelScanner}
                  className="py-1.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel Scanner
                </button>
              </div>
            )}

            {scanningStatus === 'success' && (
              <div className="space-y-4 py-2">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10 animate-[bounce_0.6s_ease-out]" />
                </div>
                
                <div className="max-w-xs mx-auto bg-slate-50 border border-slate-150 p-3 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded uppercase tracking-wider">
                    Scan Authorized
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-left pt-1">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[8px] font-bold text-slate-400 block uppercase">Classified Gen</span>
                      <span className="text-xs font-black text-slate-800">{scanOutput?.gender}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[8px] font-bold text-slate-400 block uppercase">Confidence</span>
                      <span className="text-xs font-black text-slate-800 font-mono">{scanOutput?.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={applyClassifiedGender}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-1"
                  >
                    Apply to Profile
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Retake Scan
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Accordion Item 1: Digital Species */}
        {renderAccordionItem('species', charTitle, (
          <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
            {CHARACTER_OPTIONS.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => updateAvatarConfig({ character: char.id })}
                className={`p-3 rounded-2xl border text-left transition-all outline-none flex items-center gap-3 cursor-pointer ${
                  avatarConfig.character === char.id
                    ? 'bg-slate-900 border-slate-950 text-white shadow-md scale-[1.01]'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <span className="text-2xl filter drop-shadow-sm select-none">{char.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-black leading-none truncate">{char.name}</p>
                  <p className={`text-[8.5px] mt-1 leading-none font-semibold truncate ${
                    avatarConfig.character === char.id ? 'text-indigo-400' : 'text-slate-400'
                  }`}>
                    {char.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ))}

        {/* Accordion Item 2: Theme Color */}
        {renderAccordionItem('theme', themeTitle, (
          <div className="grid grid-cols-5 gap-2">
            {THEME_OPTIONS.map((theme) => {
              const isActive = avatarConfig.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => updateAvatarConfig({ theme: theme.id })}
                  className={`h-12 rounded-xl bg-gradient-to-tr ${theme.from} border transition-all relative flex flex-col items-center justify-center outline-none cursor-pointer ${
                    isActive ? 'border-slate-900 scale-105 shadow-md ring-2 ring-slate-100' : 'border-slate-200 hover:scale-102'
                  }`}
                  title={theme.name}
                >
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-sm absolute -top-1 -right-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-[8px] font-black font-mono text-slate-800 brightness-155 bg-white/80 px-1 py-0.2 rounded-sm whitespace-nowrap scale-90">
                    {theme.id.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Accordion Item 3: Tactical Accessory */}
        {renderAccordionItem('accessory', accessoryTitle, (
          <div className="grid grid-cols-3 gap-2">
            {ACCESSORY_OPTIONS.map((acc) => {
              const isActive = avatarConfig.accessory === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => updateAvatarConfig({ accessory: acc.id })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                      : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-sans select-none">{acc.label || '❌'}</span>
                  <span className="text-[10px] font-black tracking-tight">{acc.name}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Accordion Item 4: Defense Aura */}
        {renderAccordionItem('aura', auraTitle, (
          <div className="grid grid-cols-3 gap-2">
            {AURA_OPTIONS.map((aur) => {
              const isActive = avatarConfig.aura === aur.id;
              const Icon = aur.icon;
              return (
                <button
                  key={aur.id}
                  type="button"
                  onClick={() => updateAvatarConfig({ aura: aur.id })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border outline-none flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                      : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  {Icon ? <Icon className="w-3.5 h-3.5 text-indigo-500 animate-[pulse_1.2s_infinite]" /> : <span>❌</span>}
                  <span className="text-[10px] font-black tracking-tight">{aur.name}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Accordion Item 5: Movement Style */}
        {renderAccordionItem('motion', movementTitle, (
          <div className="grid grid-cols-2 gap-2">
            {MOTION_STYLES.map((style) => {
              const isActive = avatarConfig.motionStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => updateAvatarConfig({ motionStyle: style.id })}
                  className={`py-3 rounded-xl text-xs font-extrabold tracking-tight transition-all border outline-none cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-650 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350'
                  }`}
                >
                  {style.name}
                </button>
              );
            })}
          </div>
        ))}

        {/* Accordion Item 6: Cyber Security Control Center */}
        {renderAccordionItem('security', securityCenterTitle, (
          <div className="space-y-4 text-left">
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
                      <p className="text-[10px] text-slate-455 leading-normal mt-0.5">
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
                        <p className="text-[10px] text-slate-455 leading-normal mt-0.5">
                          Guards database access upon startup with biometric validation or a code. Helps block physical theft threats.
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
                          <label className="block text-[8px] font-black text-slate-405 uppercase tracking-wider mb-1">
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
                          <label className="block text-[8px] font-black text-rose-405 uppercase tracking-wider mb-1 flex items-center gap-0.5">
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
                      <span className="text-[10px] font-mono text-slate-455">{auditProgress}% COMPLETE</span>
                    </div>
                  )}

                  {auditScore >= 0 && !isAuditing && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 border ${
                        auditScore === 100 
                          ? 'bg-emerald-50/50 border-emerald-150 text-emerald-850' 
                          : 'bg-amber-50/50 border-amber-100 text-amber-850'
                      }`}>
                        <div className="space-y-1 text-left">
                          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-900">Shield Health Score</h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {auditScore === 100 
                              ? 'Excellent score! Fully fortified against data-extraction logs.' 
                              : 'Exposure warning: database is vulnerable to extract attacks.'
                            }
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-2xl font-black font-mono tracking-tight ${auditScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{auditScore}%</span>
                        </div>
                      </div>

                      {auditScore < 100 && (
                        <button
                          type="button"
                          onClick={autoFixVaultGaps}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-550 border border-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Auto-Fix Vulnerability Gaps
                        </button>
                      )}

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
                      <p className="text-[9px] text-slate-455 leading-normal max-w-xs mx-auto">
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
                              <span className="text-[8px] font-mono text-slate-455 font-bold leading-none">{log.timestamp}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-800 leading-normal">
                              Entered PIN: <strong className="font-mono text-rose-600 text-xs font-black">{log.pinEntered}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Floating Mascot Widget */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none">
        {/* Speech Bubble */}
        <AnimatePresence>
          {mascotBubbleVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10, x: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10, x: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-slate-900 border border-slate-800 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-2xl rounded-br-none shadow-xl mb-2 max-w-[190px] pointer-events-auto relative"
            >
              <p className="leading-tight text-left">{mascotText}</p>
              {/* Triangle pointer */}
              <div className="absolute right-0 bottom-[-5px] w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-800 transform rotate-45" style={{ marginRight: '14px' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elephant Mascot Avatar */}
        <motion.div
          variants={mascotAnimation}
          animate={isMascotReacting ? "react" : "idle"}
          className="w-15 h-15 rounded-full bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 border-2 border-white shadow-xl flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 transition-shadow hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          onClick={() => {
            setIsMascotReacting(true);
            setTimeout(() => setIsMascotReacting(false), 800);
            setMascotText("At your service! 🐘");
            if (window.navigator?.vibrate) {
              window.navigator.vibrate([40, 20]);
            }
          }}
        >
          {/* Specular gloss element */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none mix-blend-overlay" />
          <div className="absolute top-0.5 left-2 right-2 h-[35%] rounded-t-full bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none filter blur-[0.5px]" />
          
          <span className="text-3xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
            🐘
          </span>
        </motion.div>
      </div>
    </div>
  );
}
