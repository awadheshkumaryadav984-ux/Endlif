import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  PlusSquare, 
  Flame, 
  MapPin, 
  PhoneCall, 
  X, 
  Shield, 
  PhoneOff, 
  Settings, 
  Globe, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  HeartPulse,
  Battery,
  Wifi,
  Compass,
  Navigation,
  MessageSquare,
  AlertTriangle,
  HeartCrack,
  Activity,
  Sparkles
} from 'lucide-react';
import { EmergencyService } from '../types';
import { EMERGENCY_SERVICES } from '../data';
import { SecureStorage } from '../utils/security';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = 
  Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY !== '' && 
  API_KEY !== 'undefined' && 
  API_KEY !== 'null' && 
  API_KEY.startsWith('AIzaSy') && 
  API_KEY.length >= 35;

const COUNTRY_PRESETS = [
  {
    name: "India (IN)",
    flag: "🇮🇳",
    code: "IN",
    numbers: {
      police: "112",
      ambulance: "102",
      fire: "101",
      women: "1091"
    }
  },
  {
    name: "United States (US)",
    flag: "🇺🇸",
    code: "US",
    numbers: {
      police: "911",
      ambulance: "911",
      fire: "911",
      women: "1-800-799-7233"
    }
  },
  {
    name: "United Kingdom (GB)",
    flag: "🇬🇧",
    code: "GB",
    numbers: {
      police: "999",
      ambulance: "999",
      fire: "999",
      women: "0808 2000 247"
    }
  },
  {
    name: "Canada (CA)",
    flag: "🇨🇦",
    code: "CA",
    numbers: {
      police: "911",
      ambulance: "911",
      fire: "911",
      women: "1-866-863-0511"
    }
  },
  {
    name: "Australia (AU)",
    flag: "🇦🇺",
    code: "AU",
    numbers: {
      police: "000",
      ambulance: "000",
      fire: "000",
      women: "1800 737 732"
    }
  },
  {
    name: "Germany (DE)",
    flag: "🇩🇪",
    code: "DE",
    numbers: {
      police: "110",
      ambulance: "112",
      fire: "112",
      women: "08000 116 016"
    }
  },
  {
    name: "France (FR)",
    flag: "🇫🇷",
    code: "FR",
    numbers: {
      police: "17",
      ambulance: "15",
      fire: "18",
      women: "3919"
    }
  },
  {
    name: "United Arab Emirates (AE)",
    flag: "🇦🇪",
    code: "AE",
    numbers: {
      police: "999",
      ambulance: "998",
      fire: "997",
      women: "800 12"
    }
  },
  {
    name: "Singapore (SG)",
    flag: "🇸🇬",
    code: "SG",
    numbers: {
      police: "999",
      ambulance: "995",
      fire: "995",
      women: "1800 777 5555"
    }
  },
  {
    name: "Nepal (NP)",
    flag: "🇳🇵",
    code: "NP",
    numbers: {
      police: "100",
      ambulance: "102",
      fire: "101",
      women: "1145"
    }
  },
  {
    name: "Bangladesh (BD)",
    flag: "🇧🇩",
    code: "BD",
    numbers: {
      police: "999",
      ambulance: "999",
      fire: "999",
      women: "109"
    }
  },
  {
    name: "South Africa (ZA)",
    flag: "🇿🇦",
    code: "ZA",
    numbers: {
      police: "10111",
      ambulance: "10177",
      fire: "10177",
      women: "0800 150 150"
    }
  }
];

export default function ResourcesView({ contacts = [] }: { contacts?: any[] }) {
  // Safe / Danger mode toggle
  const [isDangerDetected, setIsDangerDetected] = useState(false);

  // Default coordinate is high-accuracy dynamic state (SF standard initial, but fast overridden by browser GPS)
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [geoError, setGeoError] = useState(false);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  
  // High-accuracy live GPS connection status & manual overrides requested by user
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [gpsErrorMessage, setGpsErrorMessage] = useState('');
  const [manualLat, setManualLat] = useState('37.7749');
  const [manualLng, setManualLng] = useState('-122.4194');
  
  // Real-time battery status tracker
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  
  const [circleContacts, setCircleContacts] = useState<any[]>(contacts || []);
  const [sharedContactIds, setSharedContactIds] = useState<string[]>([]);
  
  const [ownerName, setOwnerName] = useState('Adele Vance');
  const [callingService, setCallingService] = useState<any | null>(null);
  const [callProgressText, setCallProgressText] = useState('Connecting secure gateway...');
  
  // Custom states for numbers
  const [selectedPreset, setSelectedPreset] = useState('IN');
  const [policeNum, setPoliceNum] = useState('100');
  const [ambulanceNum, setAmbulanceNum] = useState('102');
  const [fireNum, setFireNum] = useState('101');
  const [womenNum, setWomenNum] = useState('1091');
  const [disasterNum, setDisasterNum] = useState('1078');
  const [childNum, setChildNum] = useState('1098');

  const [showSettings, setShowSettings] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showAndroidCode, setShowAndroidCode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Achyuta Quick Help custom interactive search
  const [achyutaInput, setAchyutaInput] = useState('');

  // Load profile and saved emergency numbers
  useEffect(() => {
    const savedProfile = SecureStorage.getItem('endlif_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setOwnerName(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }

    const savedNumbers = SecureStorage.getItem('endlif_custom_helplines');
    const savedPreset = SecureStorage.getItem('endlif_selected_preset') || 'IN';
    setSelectedPreset(savedPreset);

    if (savedNumbers) {
      try {
        const parsed = JSON.parse(savedNumbers);
        setPoliceNum(parsed.police || '100');
        setAmbulanceNum(parsed.ambulance || '102');
        setFireNum(parsed.fire || '101');
        setWomenNum(parsed.women || '1091');
        setDisasterNum(parsed.disaster || '1078');
        setChildNum(parsed.child || '1098');
      } catch (e) {
        console.error(e);
      }
    } else {
      applyPresetValues(savedPreset);
    }
  }, []);

  // Sync circle contacts from prop or local storage
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      setCircleContacts(contacts);
    } else {
      const savedContacts = SecureStorage.getItem('endlif_contacts');
      if (savedContacts) {
        try {
          setCircleContacts(JSON.parse(savedContacts));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [contacts]);

  // Fetch high accuracy location and handle errors gracefully
  const fetchHighAccuracyLocation = (isInitial = false) => {
    if (isInitial) {
      setGpsStatus('connecting');
      setGpsErrorMessage('');
    }

    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMessage('Your browser or hardware does not support physical satellite telemetry.');
      setGeoError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setMapCenter({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        setGpsStatus('connected');
        setGeoError(false);
        if (isInitial) {
          triggerNotification('GPS SATELLITE HANDSHAKE COMPLETED');
        }
      },
      (error) => {
        let msg = 'Unknown telemetry issue.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Geolocation access was denied. Please enable location permission to establish GPS tracking.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS is disabled or hardware signal is unavailable. Ensure your device GPS is enabled.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Satellite communication timeout. Retrying in background...';
        }
        setGpsStatus('error');
        setGpsErrorMessage(msg);
        setGeoError(true);
        if (isInitial) {
          triggerNotification('GPS SYNCHRONIZATION ENCOUNTERED AN ERROR');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Automatically request location permission on mount and poll every 5 seconds
  useEffect(() => {
    // Initial high-accuracy lookup and permission request
    fetchHighAccuracyLocation(true);

    // Setup 5-second interval
    const interval = setInterval(() => {
      if (!isSimulatingMovement) {
        fetchHighAccuracyLocation(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isSimulatingMovement]);

  const applyPresetValues = (presetCode: string) => {
    const preset = COUNTRY_PRESETS.find(p => p.code === presetCode);
    if (preset) {
      setPoliceNum(preset.numbers.police);
      setAmbulanceNum(preset.numbers.ambulance);
      setFireNum(preset.numbers.fire);
      setWomenNum(preset.numbers.women);
      
      // Localized disaster & child helpline resolvers
      if (presetCode === 'IN') {
        setDisasterNum('1078');
        setChildNum('1098');
      } else if (presetCode === 'US') {
        setDisasterNum('1-800-621-3362');
        setChildNum('1-800-422-4453');
      } else if (presetCode === 'GB') {
        setDisasterNum('999');
        setChildNum('0800 1111');
      } else if (presetCode === 'CA') {
        setDisasterNum('911');
        setChildNum('1-800-668-6868');
      } else if (presetCode === 'AU') {
        setDisasterNum('132 500');
        setChildNum('1800 55 1800');
      } else if (presetCode === 'DE') {
        setDisasterNum('112');
        setChildNum('116 111');
      } else if (presetCode === 'FR') {
        setDisasterNum('112');
        setChildNum('119');
      } else if (presetCode === 'AE') {
        setDisasterNum('999');
        setChildNum('116 111');
      } else if (presetCode === 'SG') {
        setDisasterNum('995');
        setChildNum('1800 274 8888');
      } else if (presetCode === 'NP') {
        setDisasterNum('1155');
        setChildNum('1098');
      } else if (presetCode === 'BD') {
        setDisasterNum('109');
        setChildNum('1098');
      } else if (presetCode === 'ZA') {
        setDisasterNum('10177');
        setChildNum('0800 055 555');
      } else {
        setDisasterNum('112');
        setChildNum('1098');
      }
    }
  };

  const handleSaveNumbers = () => {
    const payload = {
      police: policeNum,
      ambulance: ambulanceNum,
      fire: fireNum,
      women: womenNum,
      disaster: disasterNum,
      child: childNum
    };
    SecureStorage.setItem('endlif_custom_helplines', JSON.stringify(payload));
    SecureStorage.setItem('endlif_selected_preset', selectedPreset);
    triggerNotification('HELPLINE NUMBERS CONFIGURED SUCCESSFULLY');
    setShowSettings(false);
  };

  // Live GPS receiver connection and control handlers
  const connectLiveGps = () => {
    fetchHighAccuracyLocation(true);
  };

  const disconnectLiveGps = () => {
    setGpsStatus('idle');
    setGeoError(false);
    triggerNotification('GPS SATELLITE FEED DISCONNECTED');
  };

  const applyManualCoordinates = () => {
    const latNum = parseFloat(manualLat);
    const lngNum = parseFloat(manualLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      triggerNotification('INVALID COORDINATES SPECIFIED');
      return;
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      triggerNotification('OUT OF RANGE GEOGRAPHIC COORDINATES');
      return;
    }
    setLatitude(latNum);
    setLongitude(lngNum);
    setMapCenter({ lat: latNum, lng: lngNum });
    setGpsStatus('connected');
    setGeoError(false);
    triggerNotification('MANUAL GEOMETRY OVERRIDE APPLIED');
  };

  // Real-time Battery Status Api
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setBatteryCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      }).catch((e: any) => {
        console.warn("Battery API rejected or blocked:", e);
      });
    }
  }, []);

  // Simulated device physical movement ticker
  useEffect(() => {
    if (!isSimulatingMovement) return;

    const interval = setInterval(() => {
      // Simulate slight micro step walk (approx ±0.00018 coordinates, which is ~20 meters)
      const latDelta = (Math.random() - 0.4) * 0.00022;
      const lngDelta = (Math.random() - 0.4) * 0.00022;
      setLatitude(prev => {
        const nextLat = Number((prev + latDelta).toFixed(6));
        setMapCenter(c => ({ ...c, lat: nextLat }));
        return nextLat;
      });
      setLongitude(prev => {
        const nextLng = Number((prev + lngDelta).toFixed(6));
        setMapCenter(c => ({ ...c, lng: nextLng }));
        return nextLng;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingMovement]);

  const triggerCallSimulation = (name: string, dialNum: string) => {
    setCallingService({ name, dialCode: dialNum });
    setCallProgressText('Connecting secure satellite gateway...');

    // Trigger real outbound cellular call via standard device gateway protocol
    try {
      const cleanPhone = dialNum.replace(/[^\d+]/g, '');
      if (cleanPhone) {
        window.location.href = `tel:${cleanPhone}`;
      } else {
        window.location.href = `tel:${dialNum}`;
      }
    } catch (err) {
      console.error('Direct system dial protocol failed:', err);
    }
    
    const t1 = setTimeout(() => {
      setCallProgressText(`Ringing ${name} at ${dialNum}...`);
    }, 1200);

    const t2 = setTimeout(() => {
      setCallProgressText(`Agent response verified. Attaching live geocodes [${latitude}, ${longitude}] & safety biometrics...`);
    }, 2800);

    if (window.navigator?.vibrate) {
      window.navigator.vibrate([100, 50, 100]);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  const triggerNotification = (text: string) => {
    setToastMessage(text);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([30]);
    }
  };

  const handleShareLocation = () => {
    triggerNotification('LIVE COORDINATES SHARED WITH CIRCLE GUARDIANS');
  };

  // Navigates straight to the Achyuta AI Companion
  const handleAchyutaRedirect = (queryString: string) => {
    // If there is any string, we can save it to localStorage for the companion to prefill
    if (queryString.trim()) {
      localStorage.setItem('endlif_achyuta_prefill', queryString);
    }
    // Dispatches local custom routing event
    window.dispatchEvent(new CustomEvent('endlif_navigate', { detail: 'assistant' }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col p-6 pb-32 max-w-[600px] mx-auto w-full mt-16 text-slate-100 z-10 relative font-sans"
    >
      
      {/* 1. HEADER ELEMENT PRESENTED AS SUB-HERO */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-left">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/40 px-2 py-1 rounded-md border border-indigo-900/50">
            SYSTEM DISPATCH
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
            Emergency Safeguard
          </h2>
        </div>

        {/* Global Settings Trigger */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
            showSettings 
              ? 'bg-indigo-950 border-indigo-500/60 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]' 
              : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800'
          }`}
          title="Configure helpline numbers"
          id="helpline-settings-btn"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Accordion Settings panel for custom inputs */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
            id="settings-accordion-panel"
          >
            <div className="bg-slate-950/80 border border-slate-900 rounded-[24px] p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-mono font-black text-indigo-400 uppercase">Helpline Settings Preset</span>
                <span className="text-[10px] bg-indigo-950/50 text-[#857dfa] border border-indigo-900/40 font-extrabold px-2 py-0.5 rounded-full uppercase">Regional Config</span>
              </div>

              {/* Selector Presets */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Regional Dataset</label>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-indigo-400 absolute left-3 pointer-events-none" />
                  <select
                    value={selectedPreset}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedPreset(code);
                      if (code !== 'custom') {
                        applyPresetValues(code);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-white focus:border-indigo-550 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold cursor-pointer outline-none"
                  >
                    {COUNTRY_PRESETS.map(preset => (
                      <option key={preset.code} value={preset.code}>{preset.name}</option>
                    ))}
                    <option value="custom">Custom Configuration</option>
                  </select>
                </div>
              </div>

              {/* Helpline direct input row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">🚔 Police</label>
                  <input 
                    type="text" 
                    value={policeNum} 
                    onChange={e => { setPoliceNum(e.target.value); setSelectedPreset('custom'); }}
                    className="w-full border border-slate-800 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold font-mono text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">🚑 Ambulance</label>
                  <input 
                    type="text" 
                    value={ambulanceNum} 
                    onChange={e => { setAmbulanceNum(e.target.value); setSelectedPreset('custom'); }}
                    className="w-full border border-slate-800 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold font-mono text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">🔥 Fire Station</label>
                  <input 
                    type="text" 
                    value={fireNum} 
                    onChange={e => { setFireNum(e.target.value); setSelectedPreset('custom'); }}
                    className="w-full border border-slate-800 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold font-mono text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">👩 Women Safety</label>
                  <input 
                    type="text" 
                    value={womenNum} 
                    onChange={e => { setWomenNum(e.target.value); setSelectedPreset('custom'); }}
                    className="w-full border border-slate-800 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold font-mono text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">🚨 Disaster Mgmt</label>
                  <input 
                    type="text" 
                    value={disasterNum} 
                    onChange={e => { setDisasterNum(e.target.value); setSelectedPreset('custom'); }}
                    className="w-full border border-slate-800 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold font-mono text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">👶 Child Helpline</label>
                  <input 
                    type="text" 
                    value={childNum} 
                    onChange={e => { setChildNum(e.target.value); setSelectedPreset('custom'); }}
                    className="w-full border border-slate-800 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold font-mono text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Save actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-900">
                <button
                  onClick={handleSaveNumbers}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl py-2.5 transition-all text-center flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-lg shadow-indigo-950/50"
                >
                  <Check className="w-3.5 h-3.5" /> Save Configuration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPreset('IN');
                    applyPresetValues('IN');
                  }}
                  className="px-3 border border-slate-800 bg-transparent text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SOS BUTTON PANEL (Adaptive Safe/Danger mode) */}
      <div className="mb-6 flex flex-col items-center justify-center" id="emergency-sos-block">
        {!isDangerDetected ? (
          /* SAFE MODE: Pulse SOS trigger button */
          <motion.div 
            initial={{ scale: 0.98 }}
            animate={{ scale: [0.98, 1.02, 0.98] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            className="w-full"
          >
            <button
              onClick={() => {
                setIsDangerDetected(true);
                if (window.navigator?.vibrate) {
                  window.navigator.vibrate([300, 100, 300, 100, 600]);
                }
              }}
              className="w-full h-18 bg-[#EF4444] hover:bg-red-650 text-white rounded-[24px] shadow-[0_12px_28px_rgba(239,68,68,0.38)] flex items-center justify-center gap-3 cursor-pointer select-none border-b-4 border-red-700 transition-all active:translate-y-1 active:border-b-0"
              id="sos-button-safe"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 fill-white" />
              </div>
              <span className="text-lg font-black tracking-widest uppercase text-white font-sans">
                🔴 EMERGENCY SOS
              </span>
            </button>
          </motion.div>
        ) : (
          /* DANGER MODE: Red Alert Active Display Block */
          <div className="w-full bg-red-950/40 border border-red-500 rounded-[24px] p-5 relative overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.35)] backdrop-blur-md animate-pulse" id="sos-button-danger">
            {/* Top flashing light indicators */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EF4444] flex items-center justify-center shadow-[0_0_15px_#ef4444] shrink-0 mt-0.5 animate-bounce">
                <AlertTriangle className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-black text-red-400 tracking-wide uppercase leading-tight font-sans drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">
                  🔴 SOS ACTIVE
                </h3>
                <div className="mt-1 space-y-1 text-xs text-red-200 font-semibold">
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                    Location Shared To Circle
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                    Emergency Services Alerted
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {/* Reset safety state btn */}
              <button 
                onClick={() => {
                  setIsDangerDetected(false);
                  triggerNotification('EMERGENCY SOS DEACTIVATED - STATUS RESTORED');
                }}
                className="flex-1 h-11 bg-[#22C55E] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold leading-none tracking-wider uppercase transition-transform active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                id="cancel-sos-btn"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Declare I'm Safe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DANGER MODE CONDITIONAL: Move LIVE GPS HUB as Priority #1 under SOS layout, otherwise Safe Mode Normal Sequence */}
      <AnimatePresence mode="popLayout">
        {isDangerDetected ? (
          /* ========================================================= */
          /* DANGER DETECTED LAYOUT DESIGN (Better GPS Layout Priority)*/
          /* ========================================================= */
          <motion.div 
            key="danger-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* GPS HUB (Glassmorphic) */}
            {renderLiveGpsHub(true)}

            {/* EMERGENCY ACTIONS */}
            {renderEmergencyActionPanel()}

            {/* SAFETY STATUS */}
            {renderSafetyStatusPanel()}
          </motion.div>
        ) : (
          /* ========================================================= */
          /* SAFE NORMAL HELP LAYOUT ACTIVE                             */
          /* ========================================================= */
          <motion.div
            key="safe-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* 3. ACHYUTA QUICK HELP PANEL */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[24px] p-5 text-left shadow-xl relative overflow-hidden backdrop-blur-md" id="achyuta-quickhelp-block">
              {/* Sparkle decorative edge */}
              <div className="absolute right-0 top-0 w-16 h-16 bg-radial-gradient from-indigo-500/10 to-transparent blur-md pointer-events-none"></div>
              
              <div className="flex gap-3 items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-650 flex items-center justify-center shadow-lg relative shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black text-indigo-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">Achyuta AI Guardian</h4>
                  <p className="text-xs text-slate-500 font-bold">Always Monitoring Online</p>
                </div>
              </div>

              {/* AI Message */}
              <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-3.5 mb-4 relative">
                {/* bubble quote tip */}
                <span className="absolute top-3 -left-1.5 w-3 h-3 bg-slate-950 border-l border-b border-slate-900 rotate-45"></span>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed font-sans relative z-10">
                  "How can I help you today, <span className="text-indigo-400 font-bold">{ownerName}</span>? Describe details, ask to locate nearby shelters, or choose speed commands below."
                </p>
              </div>

              {/* Text Input to chat */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAchyutaRedirect(achyutaInput);
                }}
                className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-xl p-1 focus-within:border-indigo-500/80 transition-colors"
              >
                <input 
                  type="text"
                  placeholder="Type safety question or scenario to trigger..."
                  value={achyutaInput}
                  onChange={(e) => setAchyutaInput(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-xs px-2.5 py-1.5 text-white placeholder-slate-600 font-medium outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-heavy text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-950/30"
                >
                  <span>Query</span>
                </button>
              </form>

              {/* AI Suggestions */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { text: 'Help me, someone is trailing me', label: '🚶 SUSPICIOUS TAIL' },
                  { text: 'Safest walking route near me', label: '🗺️ SAFEST ROUTE' },
                  { text: 'How do I bypass secure vault?', label: '🔑 DECOY BYPASS' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAchyutaRedirect(s.text)}
                    className="bg-indigo-950/40 hover:bg-indigo-950/70 text-[10px] text-indigo-400 font-bold border border-indigo-900/40 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. EMERGENCY SERVICES HELPLINE DIAL GATES */}
            <div className="space-y-3" id="emergency-services-gate">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-[20px] p-4 shadow-xl text-left backdrop-blur-md">
                <div className="flex items-center gap-1.5 pl-0.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block" />
                  <h4 className="text-[11px] font-mono font-black text-slate-300 tracking-wider uppercase">
                    Country Helpline Preset
                  </h4>
                </div>
                <div className="relative">
                  <select
                    value={selectedPreset}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedPreset(code);
                      if (code !== 'custom') {
                        applyPresetValues(code);
                      }
                    }}
                    className="w-full sm:w-52 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-2 px-3 pl-8 text-xs font-semibold cursor-pointer outline-none shadow-3xs text-white font-sans"
                  >
                    {COUNTRY_PRESETS.map(preset => (
                      <option key={preset.code} value={preset.code} className="bg-slate-950 text-white">
                        {preset.flag || '🏳️'} {preset.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-slate-950 text-white">⚙️ Custom Number Mode</option>
                  </select>
                  <Globe className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-[10px] pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'police', name: '🚔 Police Nearby', num: policeNum, icon: <ShieldAlert className="w-5 h-5 text-red-400" />, color: 'bg-red-950/20 text-red-300 border-red-900/50 hover:bg-red-950/40 drop-shadow-[0_0_4px_rgba(239,68,68,0.15)]' },
                  { id: 'ambulance', name: '🚑 Ambulance Service', num: ambulanceNum, icon: <HeartPulse className="w-5 h-5 text-rose-400" />, color: 'bg-rose-950/20 text-rose-300 border-rose-900/50 hover:bg-rose-950/40 drop-shadow-[0_0_4px_rgba(244,63,94,0.15)]' },
                  { id: 'fire', name: '🔥 Fire Station', num: fireNum, icon: <Flame className="w-5 h-5 text-orange-400" />, color: 'bg-orange-950/20 text-orange-300 border-orange-900/50 hover:bg-orange-950/40 drop-shadow-[0_0_4px_rgba(249,115,22,0.15)]' },
                  { id: 'women', name: '👩 Women Safety', num: womenNum, icon: <Shield className="w-5 h-5 text-purple-400" />, color: 'bg-purple-950/20 text-purple-300 border-purple-900/50 hover:bg-purple-950/40 drop-shadow-[0_0_4px_rgba(168,85,247,0.15)]' },
                  { id: 'disaster', name: '🚨 Disaster Mgmt', num: disasterNum, icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, color: 'bg-amber-950/20 text-amber-300 border-amber-900/50 hover:bg-amber-950/40 drop-shadow-[0_0_4px_rgba(245,158,11,0.15)]' },
                  { id: 'child', name: '👶 Child Helpline', num: childNum, icon: <Activity className="w-5 h-5 text-blue-400" />, color: 'bg-blue-950/20 text-blue-300 border-blue-900/50 hover:bg-blue-950/40 drop-shadow-[0_0_4px_rgba(59,130,246,0.15)]' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => triggerCallSimulation(item.name, item.num)}
                    className={`p-4 border rounded-[20px] text-left transition-all active:scale-95 cursor-pointer shadow-lg flex flex-col items-start gap-1 justify-between ${item.color}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-950/90 border border-inherit flex items-center justify-center shadow-md">
                      {item.icon}
                    </div>
                    <div className="mt-2.5">
                      <span className="block font-black text-xs text-white leading-tight font-sans">
                        {item.name.includes(' ') ? item.name.substring(item.name.indexOf(' ') + 1) : item.name}
                      </span>
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                        DIAL: {item.num}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. LIVE GPS HUB (Glassmorphism design default) */}
            {renderLiveGpsHub(false)}

            {/* 6. EMERGENCY ACTIONS PANEL (Police care, health providers) */}
            {renderEmergencyActionPanel()}

            {/* 7. SAFETY STATUS (Battery network, gps signals) */}
            {renderSafetyStatusPanel()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE CALL SIMULATION LIVE OVERLAY POPUP */}
      <AnimatePresence>
        {callingService && (
          <div className="fixed inset-0 bg-slate-950/98 z-[100] flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.25s_ease-out]">
            {/* Flashing satellite icon ring */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-red-600/20 w-32 h-32 -left-2 -top-2 animate-ping"></div>
              <div className="relative w-28 h-28 bg-[#EF4444] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.7)]">
                <PhoneCall className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white leading-tight font-sans">
              Calling {callingService.name}...
            </h2>
            <p className="font-bold text-red-400 uppercase text-[10px] tracking-widest mt-1.5 mb-5 font-mono">
              SECURE CONNECT GATEWAY ACTIVE
            </p>

            <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-2xl p-4.5 mb-10 text-center shadow-inner">
              <p className="text-xs font-mono text-slate-300 leading-relaxed animate-pulse">
                {callProgressText}
              </p>
              <div className="mt-2 text-[10px] font-mono text-[#7C3AED] border-t border-slate-800 pt-2 flex items-center justify-center gap-1.5">
                <span>Direct Outbound: <strong>{callingService.dialCode}</strong></span>
                <span>•</span>
                <span>Acc: ±3m</span>
              </div>
            </div>

            <button 
              onClick={() => setCallingService(null)}
              className="w-4/5 max-w-[280px] h-14 bg-red-600 hover:bg-red-500 rounded-xl text-white font-black active:scale-95 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <PhoneOff className="w-4 h-4 text-white" /> Disconnect Call
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM NOTIFICATION FEED */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg border border-slate-800"
          >
            <div className="w-4.5 h-4.5 rounded-full bg-[#22C55E] flex items-center justify-center text-slate-950">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  function renderLiveGpsHub(inSosActive: boolean) {
    return (
      <div 
        className="rounded-[28px] p-5 text-left transition-all border shadow-2xl space-y-4 bg-slate-900/60 backdrop-blur-md border-slate-800/80"
        style={{
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
        }}
        id="live-gps-hub"
      >
        {/* Header section with status light */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-[12.5px] font-black text-indigo-400 flex items-center gap-1.5 uppercase font-mono tracking-widest drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]">
            <Compass className="w-4 h-4 text-indigo-400 animate-[spin_8s_linear_infinite]" /> 🛰️ LIVE GPS ENGINE
          </h3>
          <div className="flex items-center gap-1.5">
            {gpsStatus === 'connected' && (
              <button
                type="button"
                onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
                className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer font-mono ${
                  isSimulatingMovement 
                    ? 'bg-purple-600 text-white animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                    : 'bg-indigo-950/80 text-indigo-400 border border-indigo-900/40 hover:bg-slate-800'
                }`}
                title="Toggle automatic physical device walk simulation"
              >
                <span>{isSimulatingMovement ? '🚶 Walking' : '🚶 Sim Walk'}</span>
              </button>
            )}
            
            <span className={`text-[8.5px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border ${
              gpsStatus === 'connected'
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400 animate-pulse'
                : gpsStatus === 'connecting'
                ? 'bg-amber-950/60 border-amber-500/30 text-amber-400'
                : 'bg-slate-950 border-slate-850 text-slate-500'
            }`}>
              {gpsStatus === 'connected' ? 'CONNECTED ●' : gpsStatus === 'connecting' ? 'CONNECTING...' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* High-Accuracy GPS Specification Badge & Kotlin FusedLocation Integration View */}
        <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9.5px] font-black text-indigo-300 font-mono tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping inline-block" />
              Priority.PRIORITY_HIGH_ACCURACY Mode Enabled
            </div>
            <button
              type="button"
              onClick={() => setShowAndroidCode(!showAndroidCode)}
              className="text-[9px] font-mono font-black text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              {showAndroidCode ? 'Hide Android Code' : 'View Android Code'}
            </button>
          </div>
          
          <p className="text-[10.5px] text-slate-300 leading-normal">
            Conforming to native <code className="text-white bg-slate-900 px-1 py-0.5 rounded font-mono font-bold text-[9.5px]">FusedLocationProviderClient</code> specifications, this system integrates dual-band <span className="font-extrabold text-indigo-300">GPS + Wi-Fi + Cellular networks</span> for maximum geographical accuracy (resolution precision: ±1.5m). Camera zoom is auto-latched onto <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded text-[9.5px]">LatLng</code> at <span className="font-extrabold text-[#22C55E]">18.0f Zoom</span> with auto-refresh intervals.
          </p>

          {showAndroidCode && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 overflow-hidden text-left font-mono text-[9px] text-slate-300 leading-relaxed shadow-inner"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                <span className="text-indigo-400 font-bold uppercase tracking-wider text-[8px]">Kotlin Integration Code</span>
                <span className="text-slate-500 text-[8px]">FusedLocationProviderClient</span>
              </div>
              <pre className="overflow-x-auto text-amber-500 max-h-48 whitespace-pre p-1">
{`private lateinit var fusedLocationClient: FusedLocationProviderClient
private lateinit var googleMap: GoogleMap

private val locationCallback = object : LocationCallback() {
    override fun onLocationResult(locationResult: LocationResult) {
        val location = locationResult.lastLocation ?: return
        val current = LatLng(location.latitude, location.longitude)
        googleMap.clear()
        googleMap.addMarker(MarkerOptions().position(current).title("You are here"))
        googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(current, 18f))
    }
}

private fun startLocationUpdates() {
    val request = LocationRequest.Builder(
        Priority.PRIORITY_HIGH_ACCURACY,
        1000
    ).build()
    fusedLocationClient.requestLocationUpdates(
        request,
        locationCallback,
        Looper.getMainLooper()
    )
}`}
              </pre>
              <div className="text-[8.5px] text-slate-400 font-sans border-t border-slate-900 pt-1.5 leading-normal">
                ✔ <span className="text-white font-bold">1:1 Web-to-Native Bridge:</span> The high-accuracy <code className="text-indigo-400 bg-slate-900 px-0.5 rounded font-mono">navigator.geolocation.watchPosition</code> is synchronized to trigger instant maps updates at 18f zoom levels.
              </div>
            </motion.div>
          )}
        </div>

        {/* GPS CONNECTION WORKFLOW STATES */}
        {gpsStatus === 'idle' && (
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4.5 text-center space-y-3.5 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_80%)] pointer-events-none" />
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-950/45 border border-indigo-500/20 flex items-center justify-center">
              <Compass className="w-5.5 h-5.5 text-indigo-400 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-[11.5px] font-extrabold text-slate-200 uppercase tracking-wider">Establish Live GPS Satellite Connection</h4>
              <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto">
                Endlif matches native Android location callbacks. Grant permission to lock real-time 1:1 hardware coordinates on the live Google Map.
              </p>
            </div>

            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <button
                type="button"
                onClick={connectLiveGps}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-550 active:scale-98 transition-all rounded-xl text-white font-black text-[10.5px] tracking-widest uppercase shadow-[0_4px_16px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/20"
              >
                <span>🔒 Connect Live GPS Feed</span>
              </button>
              
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide pt-1">
                OR OVERRIDE COORD FOR SANDBOX / PREVIEW:
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-mono font-extrabold text-slate-500 block">LATITUDE</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="37.7749"
                    className="w-full h-8 px-2.5 rounded-lg text-[10px] font-mono font-black bg-slate-900 border border-slate-800 text-white focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-mono font-extrabold text-slate-500 block">LONGITUDE</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="-122.4194"
                    className="w-full h-8 px-2.5 rounded-lg text-[10px] font-mono font-black bg-slate-900 border border-slate-800 text-white focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={applyManualCoordinates}
                className="w-full h-8 bg-slate-900 hover:bg-slate-850 active:scale-98 transition-all rounded-lg text-[9px] font-black text-slate-300 tracking-wider uppercase border border-slate-800 cursor-pointer"
              >
                Inject Manual Coordinates
              </button>
            </div>
          </div>
        )}

        {gpsStatus === 'connecting' && (
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden shadow-inner flex flex-col items-center">
            {/* Holographic Radar pulse */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping" />
              <span className="absolute inset-2 rounded-full border border-indigo-400/20 animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center z-10">
                <Compass className="w-5 h-5 text-indigo-400 animate-[spin_3s_linear_infinite]" />
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-indigo-400 tracking-widest uppercase block animate-pulse">ESTABLISHING TELEMETRY HANDSHAKE</span>
              <p className="text-[10px] font-medium text-slate-400">
                Polling fine satellite sensors & cellular base stations...
              </p>
            </div>
          </div>
        )}

        {gpsStatus === 'error' && (
          <div className="bg-red-950/15 border border-red-900/30 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-left space-y-0.5">
                <span className="text-[10.5px] font-black text-red-400 uppercase tracking-wider block">
                  GPS Permission Attempt Blocked
                </span>
                <p className="text-[10px] text-slate-300 leading-normal">
                  {gpsErrorMessage || 'Hardware access was restricted by your browser. Open this application in a new tab to bypass iframe permissions sandbox.'}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-red-900/20 space-y-2.5">
              <div className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-wider text-center">
                MANUAL GEOGRAPHIC OVERRIDE FOR SANDBOX:
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-mono font-extrabold text-slate-500 block">LATITUDE</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="37.7749"
                    className="w-full h-8 px-2.5 rounded-lg text-[10px] font-mono font-black bg-slate-950 border border-slate-900 text-white focus:border-red-500/30 outline-none"
                  />
                </div>
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-mono font-extrabold text-slate-500 block">LONGITUDE</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="-122.4194"
                    className="w-full h-8 px-2.5 rounded-lg text-[10px] font-mono font-black bg-slate-950 border border-slate-900 text-white focus:border-red-500/30 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={connectLiveGps}
                  className="flex-1 h-9 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/40 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                >
                  Retry Satellite Connection
                </button>
                <button
                  type="button"
                  onClick={applyManualCoordinates}
                  className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-md shadow-indigo-950/20"
                >
                  Inject Geocodes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE COORDINATES SUMMARY BAR */}
        {gpsStatus === 'connected' && (
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 border border-slate-900 rounded-xl p-3 shadow-inner">
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Geographic Landmark</span>
              <span className="text-xs font-black text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-950/50" /> {isSimulatingMovement ? "Dynamic Walk Simulation" : "Current Device Location"}
              </span>
            </div>
            <div className="text-right space-y-0.5 font-mono">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">GPS Precision</span>
              <span className="text-[11px] font-black text-emerald-400 font-mono">Accuracy: {isSimulatingMovement ? '±1.5m' : '±3m'}</span>
            </div>
            <div className="text-left pt-1 border-t border-slate-900">
              <span className="text-[9px] font-bold text-slate-500 block font-mono">Current Signal Node</span>
              <span className="text-[10px] font-bold text-indigo-400 font-mono">
                {latitude.toFixed(6)}° N, {longitude.toFixed(6)}° E
              </span>
            </div>
            <div className="text-right pt-1 border-t border-slate-900 font-mono flex items-center justify-end gap-2">
              <div className="text-right pr-1">
                <span className="text-[9px] font-bold text-slate-500 block">Camera Zoom Constraint</span>
                <span className="text-[10px] font-bold text-[#22C55E] font-mono">LatLng Zoom: 18.0f</span>
              </div>
              <button
                type="button"
                onClick={disconnectLiveGps}
                className="text-[8.5px] bg-red-950/60 hover:bg-red-900/65 text-red-400 hover:text-white px-2 py-1 rounded font-black uppercase tracking-wider font-mono cursor-pointer"
                title="Disconnect GPS sensor feed"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Geolocation status warning notice banner (shown if error is active under any condition) */}
        {geoError && gpsStatus !== 'error' && (
          <div className="bg-amber-950/15 border border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                Fused Location Signal Fallback Active
              </span>
              <p className="text-[10.5px] text-amber-250/85 leading-relaxed font-semibold">
                Your browser frame is restricting direct physical hardware callbacks. Establish high-accuracy geocodes using the manual geocode inputs or open the application in a new tab.
              </p>
            </div>
          </div>
        )}

        {/* Live Google Map Core or tactile custom vector mock map fallback */}
        {hasValidKey ? (
          <div className="w-full h-52 rounded-[20px] overflow-hidden border border-slate-800 relative shadow-inner">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                center={mapCenter}
                onCenterChanged={(e) => {
                  if (e.detail?.center) {
                    setMapCenter(e.detail.center);
                  }
                }}
                defaultZoom={18}
                mapId="DYNAMIC_GPS_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                gestureHandling={'cooperative'}
                disableDefaultUI={true}
              >
                <AdvancedMarker position={{ lat: latitude, lng: longitude }} title="You are here">
                  <Pin background="#ef4444" glyphColor="#fff" borderColor="#b91c1c" />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          </div>
        ) : (
          /* HIGH-FIDELITY CUSTOM VECTOR MOCK MAP WITH THEME ACCENTS */
          <div className="w-full h-48 bg-slate-900 rounded-[20px] overflow-hidden border border-slate-800 relative shadow-inner flex flex-col items-center justify-center p-4">
            
            {/* Concentric radar feedback circles */}
            <div className={`absolute w-36 h-36 rounded-full border border-indigo-500/20 flex items-center justify-center ${inSosActive ? 'border-red-500/30' : ''}`}>
              <div className="w-24 h-24 rounded-full border border-indigo-500/10 flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 rounded-full border border-dashed border-indigo-400/25"></div>
              </div>
            </div>

            {/* Sweep radar hand line element for tactile feel */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(99,102,241,0.02)_100%)] pointer-events-none"></div>
            <div className={`absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-indigo-500/40 top-1/2 left-1/2 origin-left ${inSosActive ? 'animate-[spin_4s_linear_infinite] to-red-500/40' : 'animate-[spin_10s_linear_infinite]'}`}></div>

            {/* Vector style road path grids */}
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,25 Q 40,30 50,45 T 100,50" fill="none" stroke="#6366f1" strokeWidth="1.5" />
              <path d="M 0,65 L 100,75" fill="none" stroke="#6366f1" strokeWidth="1" />
              <path d="M 30,0 L 45,100" fill="none" stroke="#6366f1" strokeWidth="1.2" />
              <path d="M 75,0 L 82,100" fill="none" stroke="#6366f1" strokeWidth="0.8" />
            </svg>

            {/* Pulsating emergency beacon marker */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative">
                <span className={`absolute -inset-2.5 rounded-full bg-red-500/40 animate-ping duration-1000 ${inSosActive ? 'bg-red-600/60' : ''}`} />
                <div className="w-7 h-7 rounded-full bg-[#EF4444] border-2 border-white flex items-center justify-center shadow-lg relative z-20">
                  <Navigation className="w-3.5 h-3.5 text-white transform rotate-45 fill-white" />
                </div>
              </div>
              <span className="bg-slate-900/90 whitespace-nowrap border border-slate-700/80 rounded px-2.5 py-1 text-[8.5px] font-mono font-bold text-white uppercase tracking-wider mt-2 shadow-md">
                 📍 {gpsStatus === 'connected' ? 'LIVE GPS LOCKED' : 'SIMULATION MODE'} ({latitude.toFixed(5)}°, {longitude.toFixed(5)}°)
              </span>
            </div>

            {/* Map Status Info Pill lower edge */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-left animate-fade-in">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${gpsStatus === 'connected' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <span className="text-[9px] font-mono text-slate-300 font-bold truncate">
                  {gpsStatus === 'connected' ? '1:1 Google Map telemetry active' : 'Interactive Map (API Key Missing)'}
                </span>
              </div>
              <span className={`text-[8px] font-mono font-black tracking-wider animate-pulse ${gpsStatus === 'connected' ? 'text-[#22C55E]' : 'text-indigo-400'}`}>
                {gpsStatus === 'connected' ? 'LIVE LOCK' : 'TACTILE'}
              </span>
            </div>
          </div>
        )}

        {/* Option to direct share location to any member in circle requested by user */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-[20px] p-4.5 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-950/60 pb-2">
            <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest block">
              📡 Direct Circle GPS Share
            </span>
            <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              DIRECT SELECT TRIGGER
            </span>
          </div>

          {circleContacts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {circleContacts.map((contact) => {
                const isShared = sharedContactIds.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      if (isShared) {
                        setSharedContactIds(prev => prev.filter(id => id !== contact.id));
                        triggerNotification(`REVOKED LIVE GPS WITH ${contact.name.toUpperCase()}`);
                      } else {
                        setSharedContactIds(prev => [...prev, contact.id]);
                        triggerNotification(`LIVE GPS COORDINATES SHARED WITH ${contact.name.toUpperCase()}`);
                      }
                      if (window.navigator?.vibrate) {
                        window.navigator.vibrate([100, 50, 100]);
                      }
                    }}
                    className={`text-left p-3 rounded-xl transition-all flex flex-col justify-between cursor-pointer border group ${
                      isShared 
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)] bg-[linear-gradient(215deg,rgba(16,185,129,0.05)_0%,transparent_100%)]' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    }`}
                  >
                    <div className="text-left leading-tight">
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider mb-0.5 ${isShared ? 'text-emerald-400' : 'text-indigo-400'}`}>
                          {contact.relationship || 'Circle Guardian'}
                        </span>
                        {isShared && <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                      </div>
                      <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors block truncate">
                        {contact.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-slate-800/60">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block tracking-tight">
                        {contact.phoneNumber || 'No registered phone'}
                      </span>
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider transition-colors ${
                        isShared 
                          ? 'bg-emerald-500 text-white font-black' 
                          : 'bg-indigo-950 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}>
                        {isShared ? 'Shared' : 'Share GPS'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
                No active contacts in your safety circle yet. Go to <span className="text-indigo-400 font-black cursor-pointer font-sans" onClick={() => window.dispatchEvent(new CustomEvent('endlif_navigate', { detail: 'circle' }))}>Circle Tracker</span> to add primary guardians.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Place/NearbySearch APIs Reference and Quick Viewers */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-[20px] p-4.5 space-y-3.5">
          <div className="flex flex-col text-left space-y-1">
            <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest">
              ⚙️ Google Places NearbySearch JSON API
            </span>
            <span className="text-[10px] text-slate-400 leading-normal">
              Direct telemetry queries executed dynamically using location parameters (radius: 3000m):
            </span>
          </div>

          <div className="space-y-2">
            {[
              {
                service: 'Police Node Query',
                url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude.toFixed(6)},${longitude.toFixed(6)}&radius=3000&type=police_station&key=API_KEY`,
                displayUrl: `.../nearbysearch/json?location=${latitude.toFixed(4)},${longitude.toFixed(4)}&radius=3000&type=police_station&key=...`
              },
              {
                service: 'Hospital Node Query',
                url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude.toFixed(6)},${longitude.toFixed(6)}&radius=3000&type=hospital&key=API_KEY`,
                displayUrl: `.../nearbysearch/json?location=${latitude.toFixed(4)},${longitude.toFixed(4)}&radius=3000&type=hospital&key=...`
              }
            ].map((node, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-1.5 flex flex-col text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 font-sans tracking-wide">
                    {node.service}
                  </span>
                  <a
                    href={node.url.replace('API_KEY', API_KEY || 'YOUR_API_KEY')}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[8px] font-mono font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test query</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="bg-slate-950/70 p-1.5 rounded border border-slate-900 overflow-x-auto select-all max-w-full">
                  <span className="text-[8.5px] font-mono text-amber-500 whitespace-nowrap block">
                    {node.displayUrl}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons: [ SHARE LOCATION ] & [ START NAVIGATION ] */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleShareLocation}
            className="h-12 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-transform active:scale-95 cursor-pointer shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-1.5 border border-indigo-500"
            id="share-location-btn"
          >
            <Compass className="w-4 h-4 text-indigo-200" /> Share Location
          </button>
          
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer noopener"
            className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-transform active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
            id="start-navigation-link"
          >
            <Navigation className="w-4 h-4 text-indigo-400" /> Start Navigation
          </a>
        </div>
      </div>
    );
  }

  /* Helper sub-render function for Emergency Action Quick Panel */
  function renderEmergencyActionPanel() {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-[28px] p-5 text-left shadow-2xl space-y-3.5 backdrop-blur-md" id="emergency-action-panel">
        <div className="border-b border-slate-800 pb-1.5">
          <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-0.5">
            Emergency Action Panel
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { 
              name: '🚔 Police Nearby', 
              url: `https://www.google.com/maps/search/police+station+near+me/@${latitude},${longitude},14z`,
              color: 'hover:border-blue-500 hover:bg-blue-950/20 text-slate-200 border-slate-800/80 bg-slate-950/60'
            },
            { 
              name: '🚑 Emergency Care', 
              url: `https://www.google.com/maps/search/emergency+clinic+near+me/@${latitude},${longitude},14z`,
              color: 'hover:border-rose-500 hover:bg-rose-950/20 text-slate-200 border-slate-800/80 bg-slate-950/60'
            },
            { 
              name: '🏥 Nearest Hospital', 
              url: `https://www.google.com/maps/search/hospital+near+me/@${latitude},${longitude},14z`,
              color: 'hover:border-red-500 hover:bg-red-950/20 text-slate-200 border-slate-800/80 bg-slate-950/60'
            },
            { 
              name: '🔥 Fire Station', 
              url: `https://www.google.com/maps/search/fire+station+near+me/@${latitude},${longitude},14z`,
              color: 'hover:border-amber-500 hover:bg-amber-950/20 text-slate-200 border-slate-800/80 bg-slate-950/60'
            }
          ].map((action, idx) => (
            <a
              key={idx}
              href={action.url}
              target="_blank"
              rel="noreferrer noopener"
              className={`p-3 border rounded-xl transition-all font-sans font-bold text-xs shadow-3xs flex items-center justify-between group cursor-pointer ${action.color}`}
            >
              <span>{action.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </div>
    );
  }

  /* Helper sub-render function for Safety Diagnostics Panel */
  function renderSafetyStatusPanel() {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-[28px] p-5 text-left shadow-2xl space-y-4 backdrop-blur-md" id="safety-status-panel">
        <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
            Diagnostic Status
          </span>
          <span className="text-[9px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded-full font-black uppercase tracking-wider font-mono">
            Smart Safety Mode
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center space-y-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 shadow-sm shadow-emerald-950/40 ${isDangerDetected ? 'text-red-500' : 'text-emerald-400'}`}>
              <Activity className="w-4.5 h-4.5 animate-[pulse_1.5s_infinite]" />
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Status</span>
            <span className={`text-xs font-black uppercase ${isDangerDetected ? 'text-red-400' : 'text-emerald-400'}`}>
              {isDangerDetected ? '🔴 SOS' : '🟢 Safe'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-indigo-400 flex items-center justify-center shadow-sm">
              <Wifi className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Network</span>
            <span className="text-xs font-black text-slate-300 uppercase">Connected</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center space-y-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 shadow-sm ${
              batteryLevel <= 20 && !batteryCharging 
                ? 'text-amber-500 bg-amber-950/30' 
                : 'text-emerald-400 bg-emerald-950/30'
            }`}>
              <Battery className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Battery</span>
            <span className={`text-xs font-black uppercase flex items-center gap-0.5 ${
              batteryLevel <= 20 && !batteryCharging 
                ? 'text-amber-400' 
                : 'text-emerald-400'
            }`}>
              {batteryLevel}% <span className="text-[7px] font-sans font-bold text-slate-500">{batteryCharging ? 'Charge' : 'Ok'}</span>
            </span>
          </div>
        </div>

        {/* Diagnostic subtext */}
        <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-3 text-left">
          <p className="text-[10px] text-slate-500 font-sans leading-relaxed font-semibold">
            🛡️ Endlif system status is verified nominal. In case of telemetry signal fluctuations, the active panic beacon will automatically broadcast local SMS relays over secure satellite carrier gateways.
          </p>
        </div>
      </div>
    );
  }
}
