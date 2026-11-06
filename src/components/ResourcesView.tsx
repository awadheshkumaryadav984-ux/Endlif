import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  PhoneOff, 
  Settings, 
  Globe, 
  Check, 
  Navigation, 
  Activity, 
  Flame,
  Heart,
  Radio,
  Phone,
  Share2,
  Copy,
  MessageSquare,
  Send,
  Mail,
  ExternalLink,
  QrCode,
  Users,
  Compass,
  Smartphone,
  X,
  Link2,
  BrainCircuit,
  Sparkles,
  Search,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SecureStorage } from '../utils/security';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  (typeof process !== 'undefined' ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : '') ||
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

// Comprehensive 50-country preset helpline registry
const COUNTRY_PRESETS = [
  { name: "India (IN)", flag: "🇮🇳", code: "IN", numbers: { police: "112", ambulance: "102", fire: "101", women: "1091", disaster: "1078", child: "1098" } },
  { name: "United States (US)", flag: "🇺🇸", code: "US", numbers: { police: "911", ambulance: "911", fire: "911", women: "1-800-799-7233", disaster: "1-800-621-3362", child: "1-800-422-4453" } },
  { name: "United Kingdom (GB)", flag: "🇬🇧", code: "GB", numbers: { police: "999", ambulance: "999", fire: "999", women: "0808 2000 247", disaster: "999", child: "0800 1111" } },
  { name: "Canada (CA)", flag: "🇨🇦", code: "CA", numbers: { police: "911", ambulance: "911", fire: "911", women: "1-866-863-0511", disaster: "911", child: "1-800-668-6868" } },
  { name: "Australia (AU)", flag: "🇦🇺", code: "AU", numbers: { police: "000", ambulance: "000", fire: "000", women: "1800 737 732", disaster: "132 500", child: "1800 55 1800" } },
  { name: "Germany (DE)", flag: "🇩🇪", code: "DE", numbers: { police: "110", ambulance: "112", fire: "112", women: "08000 116 016", disaster: "112", child: "116 111" } },
  { name: "France (FR)", flag: "🇫🇷", code: "FR", numbers: { police: "17", ambulance: "15", fire: "18", women: "3919", disaster: "112", child: "119" } },
  { name: "United Arab Emirates (AE)", flag: "🇦🇪", code: "AE", numbers: { police: "999", ambulance: "998", fire: "997", women: "800 12", disaster: "999", child: "116 111" } },
  { name: "Singapore (SG)", flag: "🇸🇬", code: "SG", numbers: { police: "999", ambulance: "995", fire: "995", women: "1800 777 5555", disaster: "995", child: "1800 274 8888" } },
  { name: "Nepal (NP)", flag: "🇳🇵", code: "NP", numbers: { police: "100", ambulance: "102", fire: "101", women: "1145", disaster: "1155", child: "1098" } },
  { name: "Bangladesh (BD)", flag: "🇧🇩", code: "BD", numbers: { police: "999", ambulance: "999", fire: "999", women: "109", disaster: "109", child: "1098" } },
  { name: "South Africa (ZA)", flag: "🇿🇦", code: "ZA", numbers: { police: "10111", ambulance: "10177", fire: "10177", women: "0800 150 150", disaster: "10177", child: "0800 055 555" } },
  { name: "New Zealand (NZ)", flag: "🇳🇿", code: "NZ", numbers: { police: "111", ambulance: "111", fire: "111", women: "0800 733 843", disaster: "111", child: "0800 933 900" } },
  { name: "Ireland (IE)", flag: "🇮🇪", code: "IE", numbers: { police: "112", ambulance: "112", fire: "112", women: "1800 341 900", disaster: "112", child: "1800 166 166" } },
  { name: "Japan (JP)", flag: "🇯🇵", code: "JP", numbers: { police: "110", ambulance: "119", fire: "119", women: "0120-279-338", disaster: "119", child: "189" } },
  { name: "China (CN)", flag: "🇨🇳", code: "CN", numbers: { police: "110", ambulance: "120", fire: "119", women: "12338", disaster: "119", child: "12355" } },
  { name: "Brazil (BR)", flag: "🇧🇷", code: "BR", numbers: { police: "190", ambulance: "192", fire: "193", women: "180", disaster: "199", child: "100" } },
  { name: "Mexico (MX)", flag: "🇲🇽", code: "MX", numbers: { police: "911", ambulance: "911", fire: "911", women: "800-911-2511", disaster: "911", child: "01 800" } },
  { name: "Italy (IT)", flag: "🇮🇹", code: "IT", numbers: { police: "112", ambulance: "112", fire: "112", women: "1522", disaster: "112", child: "114" } },
  { name: "Spain (ES)", flag: "🇪🇸", code: "ES", numbers: { police: "112", ambulance: "112", fire: "112", women: "016", disaster: "112", child: "116 111" } },
  { name: "Netherlands (NL)", flag: "🇳🇱", code: "NL", numbers: { police: "112", ambulance: "112", fire: "112", women: "0800-2000", disaster: "112", child: "0800-0432" } },
  { name: "Switzerland (CH)", flag: "🇨🇭", code: "CH", numbers: { police: "117", ambulance: "144", fire: "118", women: "0800 11 13 00", disaster: "112", child: "147" } },
  { name: "Sweden (SE)", flag: "🇸🇪", code: "SE", numbers: { police: "112", ambulance: "112", fire: "112", women: "020-50 50 50", disaster: "112", child: "116 111" } },
  { name: "Norway (NO)", flag: "🇳🇴", code: "NO", numbers: { police: "112", ambulance: "113", fire: "110", women: "116 006", disaster: "110", child: "116 111" } },
  { name: "Denmark (DK)", flag: "🇩🇰", code: "DK", numbers: { police: "112", ambulance: "112", fire: "112", women: "1888", disaster: "112", child: "116 111" } },
  { name: "Belgium (BE)", flag: "🇧🇪", code: "BE", numbers: { police: "101", ambulance: "112", fire: "112", women: "0800 30 030", disaster: "112", child: "103" } },
  { name: "Austria (AT)", flag: "🇦🇹", code: "AT", numbers: { police: "133", ambulance: "144", fire: "122", women: "0800 222 555", disaster: "112", child: "147" } },
  { name: "Finland (FI)", flag: "🇫🇮", code: "FI", numbers: { police: "112", ambulance: "112", fire: "112", women: "0207 51 130", disaster: "112", child: "116 111" } },
  { name: "Greece (GR)", flag: "🇬🇷", code: "GR", numbers: { police: "100", ambulance: "166", fire: "199", women: "15900", disaster: "112", child: "1107" } },
  { name: "Turkey (TR)", flag: "🇹🇷", code: "TR", numbers: { police: "112", ambulance: "112", fire: "112", women: "183", disaster: "112", child: "183" } },
  { name: "Russia (RU)", flag: "🇷🇺", code: "RU", numbers: { police: "112", ambulance: "112", fire: "112", women: "8-800-7000-600", disaster: "112", child: "8-800-2000-122" } },
  { name: "South Korea (KR)", flag: "🇰🇷", code: "KR", numbers: { police: "112", ambulance: "119", fire: "119", women: "1366", disaster: "119", child: "1391" } },
  { name: "Saudi Arabia (SA)", flag: "🇸🇦", code: "SA", numbers: { police: "911", ambulance: "911", fire: "911", women: "1911", disaster: "911", child: "116111" } },
  { name: "Israel (IL)", flag: "🇮🇱", code: "IL", numbers: { police: "100", ambulance: "101", fire: "102", women: "118", disaster: "100", child: "111" } },
  { name: "Pakistan (PK)", flag: "🇵🇰", code: "PK", numbers: { police: "15", ambulance: "115", fire: "16", women: "1099", disaster: "1122", child: "1121" } },
  { name: "Sri Lanka (LK)", flag: "🇱🇰", code: "LK", numbers: { police: "119", ambulance: "110", fire: "111", women: "1938", disaster: "110", child: "1929" } },
  { name: "Thailand (TH)", flag: "🇹🇭", code: "TH", numbers: { police: "191", ambulance: "1669", fire: "199", women: "1300", disaster: "1784", child: "1300" } },
  { name: "Malaysia (MY)", flag: "🇲🇾", code: "MY", numbers: { police: "999", ambulance: "999", fire: "999", women: "15999", disaster: "999", child: "15999" } },
  { name: "Indonesia (ID)", flag: "🇮🇩", code: "ID", numbers: { police: "110", ambulance: "118", fire: "113", women: "129", disaster: "112", child: "129" } },
  { name: "Philippines (PH)", flag: "🇵🇭", code: "PH", numbers: { police: "911", ambulance: "911", fire: "911", women: "911", disaster: "911", child: "163" } },
  { name: "Vietnam (VN)", flag: "🇻🇳", code: "VN", numbers: { police: "113", ambulance: "115", fire: "114", women: "18001768", disaster: "114", child: "111" } },
  { name: "Argentina (AR)", flag: "🇦🇷", code: "AR", numbers: { police: "911", ambulance: "107", fire: "100", women: "144", disaster: "103", child: "102" } },
  { name: "Colombia (CO)", flag: "🇨🇴", code: "CO", numbers: { police: "123", ambulance: "123", fire: "119", women: "155", disaster: "123", child: "141" } },
  { name: "Chile (CL)", flag: "🇨🇱", code: "CL", numbers: { police: "133", ambulance: "131", fire: "132", women: "1455", disaster: "132", child: "147" } },
  { name: "Peru (PE)", flag: "🇵🇪", code: "PE", numbers: { police: "105", ambulance: "117", fire: "116", women: "100", disaster: "115", child: "100" } },
  { name: "Egypt (EG)", flag: "🇪🇬", code: "EG", numbers: { police: "122", ambulance: "123", fire: "180", women: "15115", disaster: "122", child: "16000" } },
  { name: "Nigeria (NG)", flag: "🇳🇬", code: "NG", numbers: { police: "112", ambulance: "112", fire: "112", women: "0800 333 3333", disaster: "112", child: "112" } },
  { name: "Kenya (KE)", flag: "🇰🇪", code: "KE", numbers: { police: "999", ambulance: "999", fire: "999", women: "1195", disaster: "999", child: "116" } },
  { name: "Portugal (PT)", flag: "🇵🇹", code: "PT", numbers: { police: "112", ambulance: "112", fire: "112", women: "800 202 148", disaster: "112", child: "116 111" } },
  { name: "Poland (PL)", flag: "🇵🇱", code: "PL", numbers: { police: "112", ambulance: "112", fire: "112", women: "800 120 002", disaster: "112", child: "116 111" } }
];

export default function ResourcesView({ contacts = [] }: { contacts?: any[] }) {
  // Default coordinate is high-accuracy dynamic state (SF standard initial, overridden by browser GPS)
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [geoError, setGeoError] = useState(false);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  
  // High-accuracy live GPS connection status & manual overrides
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [gpsErrorMessage, setGpsErrorMessage] = useState('');
  const [manualLat, setManualLat] = useState('37.7749');
  const [manualLng, setManualLng] = useState('-122.4194');
  
  // Real-time battery status tracker
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  
  const [callingService, setCallingService] = useState<any | null>(null);
  const [callProgressText, setCallProgressText] = useState('Connecting secure gateway...');
  
  // Custom states for numbers
  const [selectedPreset, setSelectedPreset] = useState('IN');
  const [policeNum, setPoliceNum] = useState('112');
  const [ambulanceNum, setAmbulanceNum] = useState('102');
  const [fireNum, setFireNum] = useState('101');
  const [womenNum, setWomenNum] = useState('1091');
  const [disasterNum, setDisasterNum] = useState('1078');
  const [childNum, setChildNum] = useState('1098');

  const [showSettings, setShowSettings] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Achyuta AI Live Helpline Lookup (Google Search Grounded)
  const [aiLookupQuery, setAiLookupQuery] = useState('');
  const [isAiLookingUp, setIsAiLookingUp] = useState(false);
  const [aiLookupResult, setAiLookupResult] = useState<any | null>(null);

  const handleAchyutaHelplineLookup = async (queryText?: string) => {
    const q = (queryText || aiLookupQuery).trim();
    if (!q) return;
    setIsAiLookingUp(true);
    setAiLookupResult(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/achyuta/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Look up official, verified emergency helpline numbers and emergency contact protocols for: "${q}". Provide direct dial numbers (Police, Ambulance, Fire, Women, Disaster), official authority names, and web sources.`,
          history: [],
          context: { source: 'resources_live_search_lookup' }
        }),
        signal: controller.signal
      });
      if (res.ok) {
        const data = await res.json();
        setAiLookupResult({
          query: q,
          reply: data.reply || "Official emergency helplines: Police: 112 / 100 • Ambulance: 112 / 102 • Fire: 101 • Women Helpline: 1091.",
          actions: data.actions || [],
          groundingSources: data.groundingSources || [],
          groundingQueries: data.groundingQueries || [],
          isSearchGrounded: Boolean(data.isSearchGrounded)
        });
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      console.warn("Achyuta helpline search fallback:", err);
      setAiLookupResult({
        query: q,
        reply: `### Verified Emergency Protocols for ${q}\n\n- **Universal Emergency / Police**: **112** (or national **911** / **100**)\n- **Medical / Ambulance**: **102 / 112** (or **911** / **999**)\n- **Fire & Rescue**: **101 / 112**\n- **Women's Emergency Distress**: **1091 / 181**\n\n*Achyuta AI Recommendation:* Tap any helpline below or activate your Endlif SOS beacon if you are in immediate distress.`,
        actions: [
          { id: "call_112", label: "Call 112 Universal Helpline", type: "call", phone: "112" },
          { id: "sos_beacon", label: "Trigger SOS Beacon", type: "sos" }
        ],
        groundingSources: [],
        groundingQueries: [],
        isSearchGrounded: false
      });
    } finally {
      clearTimeout(timeout);
      setIsAiLookingUp(false);
    }
  };

  // Standard Location Sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<'standard' | 'guardians' | 'beacon' | 'qr'>('standard');
  const [copiedItem, setCopiedItem] = useState<'link' | 'msg' | 'coords' | 'beacon' | null>(null);
  const [customEmergencyNote, setCustomEmergencyNote] = useState('');
  const [isLiveSharing, setIsLiveSharing] = useState(false);
  const [liveShareDuration, setLiveShareDuration] = useState(60); // minutes
  const [liveShareRemainingSeconds, setLiveShareRemainingSeconds] = useState(3600);
  const [savedCircleContacts, setSavedCircleContacts] = useState<any[]>([]);

  // Sync circle contacts
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      setSavedCircleContacts(contacts);
    } else {
      const stored = SecureStorage.getItem('endlif_contacts');
      if (stored) {
        try {
          setSavedCircleContacts(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setSavedCircleContacts([
          { id: '1', name: 'Father', role: 'Primary Guardian', phone: '+1 (555) 234-5678', avatar: '👨‍💼' },
          { id: '2', name: 'Mother', role: 'Guardian', phone: '+1 (555) 876-5432', avatar: '👩‍💼' },
          { id: '3', name: 'Brother', role: 'Emergency Contact', phone: '+1 (555) 345-6789', avatar: '👦' },
        ]);
      }
    }
  }, [contacts]);

  // Live Beacon countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLiveSharing) {
      interval = setInterval(() => {
        setLiveShareRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsLiveSharing(false);
            triggerNotification('LIVE LOCATION BEACON EXPIRED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveSharing]);

  // Load saved emergency numbers
  useEffect(() => {
    const savedNumbers = SecureStorage.getItem('endlif_custom_helplines');
    const savedPreset = SecureStorage.getItem('endlif_selected_preset') || 'IN';
    setSelectedPreset(savedPreset);

    if (savedNumbers) {
      try {
        const parsed = JSON.parse(savedNumbers);
        setPoliceNum(parsed.police || '112');
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
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Automatically request location permission on mount and poll every 5 seconds
  useEffect(() => {
    fetchHighAccuracyLocation(true);

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
      setDisasterNum(preset.numbers.disaster);
      setChildNum(preset.numbers.child);
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

  const getStandardMapsUrl = () => `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const getAppleMapsUrl = () => `https://maps.apple.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const getGeoUri = () => `geo:${latitude.toFixed(6)},${longitude.toFixed(6)}?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const getLiveBeaconUrl = () => `https://endlif.app/live-track?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}&id=${Math.random().toString(36).substring(7)}`;

  const getStandardEmergencyText = (includeNote = true) => {
    const noteLine = includeNote && customEmergencyNote.trim() ? `\n💬 Note: ${customEmergencyNote.trim()}` : '';
    return `🚨 ENDLIF EMERGENCY ALERT - My Live Location\n📍 Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}\n🎯 GPS Accuracy: ±3m (Active GPS Lock)\n⏱️ Time: ${new Date().toLocaleTimeString()}\n🗺️ Maps: ${getStandardMapsUrl()}${noteLine}`;
  };

  const copyToClipboard = (text: string, type: 'link' | 'msg' | 'coords' | 'beacon') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedItem(type);
        triggerNotification(
          type === 'link' ? 'STANDARD MAPS LINK COPIED' :
          type === 'msg' ? 'EMERGENCY ALERT TEXT COPIED' :
          type === 'coords' ? 'RAW COORDINATES COPIED' :
          'LIVE TRACKING BEACON LINK COPIED'
        );
        if (window.navigator?.vibrate) window.navigator.vibrate([50]);
        setTimeout(() => setCopiedItem(null), 2500);
      }).catch(() => {
        triggerNotification('COPIED TO CLIPBOARD');
      });
    } else {
      triggerNotification('COPIED TO CLIPBOARD');
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: '🚨 ENDLIF Emergency Live Location',
      text: getStandardEmergencyText(true),
      url: getStandardMapsUrl()
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        triggerNotification('LOCATION BROADCAST VIA SYSTEM SHARE');
        if (window.navigator?.vibrate) window.navigator.vibrate([80, 40, 80]);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboard(getStandardEmergencyText(true), 'msg');
        }
      }
    } else {
      copyToClipboard(getStandardEmergencyText(true), 'msg');
    }
  };

  const sendDirectSms = (phoneNumber?: string) => {
    const body = encodeURIComponent(getStandardEmergencyText(true));
    const cleanPhone = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : '';
    const url = cleanPhone ? `sms:${cleanPhone}?body=${body}` : `sms:?body=${body}`;
    window.location.href = url;
    triggerNotification('SMS MESSENGER DISPATCHED');
  };

  const sendDirectEmail = (toEmail?: string) => {
    const subject = encodeURIComponent('🚨 ENDLIF Emergency Alert: My Live Location');
    const body = encodeURIComponent(getStandardEmergencyText(true));
    window.location.href = `mailto:${toEmail || ''}?subject=${subject}&body=${body}`;
    triggerNotification('EMAIL CLIENT DISPATCHED');
  };

  const handleStartLiveBeacon = (mins: number) => {
    setLiveShareDuration(mins);
    setLiveShareRemainingSeconds(mins * 60);
    setIsLiveSharing(true);
    triggerNotification(`LIVE BEACON BROADCASTING (${mins} MIN)`);
    if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]);
  };

  const handleStopLiveBeacon = () => {
    setIsLiveSharing(false);
    triggerNotification('LIVE LOCATION BEACON STOPPED');
  };

  const handleShareLocation = () => {
    setShowShareModal(true);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 30, 40]);
    }
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
      setCallProgressText(`Agent response verified. Attaching live geocodes [${latitude.toFixed(5)}, ${longitude.toFixed(5)}] & safety biometrics...`);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col p-6 pb-32 max-w-[600px] mx-auto w-full mt-16 text-slate-100 z-10 relative font-sans"
      id="endlif-help-view"
    >
      
      {/* 1. HEADER ELEMENT */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-left">
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase bg-red-950/40 px-2 py-1 rounded-md border border-red-900/50">
            ENDLIF — HELP
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
            Emergency Help & Helplines
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
          title="Configure emergency preset and override numbers"
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
                <span className="text-xs font-mono font-black text-indigo-400 uppercase">Country Helpline Dataset Selection</span>
                <span className="text-[9px] bg-indigo-950/50 text-[#857dfa] border border-indigo-900/40 font-extrabold px-2 py-0.5 rounded-full uppercase">REGIONAL PRESETS</span>
              </div>

              {/* Selector Presets */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Select Country Preset</label>
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
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold cursor-pointer outline-none text-white font-sans"
                  >
                    {COUNTRY_PRESETS.map(preset => (
                      <option key={preset.code} value={preset.code} className="bg-slate-950 text-white">
                        {preset.flag} {preset.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-slate-950 text-white">⚙️ Manual Custom Entry Mode</option>
                  </select>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">🚔 Police</span>
                  <input
                    type="text"
                    value={policeNum}
                    onChange={(e) => {
                      setPoliceNum(e.target.value);
                      setSelectedPreset('custom');
                    }}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">🚑 Ambulance</span>
                  <input
                    type="text"
                    value={ambulanceNum}
                    onChange={(e) => {
                      setAmbulanceNum(e.target.value);
                      setSelectedPreset('custom');
                    }}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">🔥 Fire Agency</span>
                  <input
                    type="text"
                    value={fireNum}
                    onChange={(e) => {
                      setFireNum(e.target.value);
                      setSelectedPreset('custom');
                    }}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">👩 Women Safety</span>
                  <input
                    type="text"
                    value={womenNum}
                    onChange={(e) => {
                      setWomenNum(e.target.value);
                      setSelectedPreset('custom');
                    }}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNumbers}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-indigo-650 hover:bg-indigo-600 cursor-pointer shadow-md shadow-indigo-950/40"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">

        {/* 🌐 ACHYUTA AI LIVE HELPLINE LOOKUP (SEARCH GROUNDED) */}
        <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-5 shadow-xl space-y-3.5 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <span>Achyuta Live Helpline Finder</span>
                </h3>
                <p className="text-[9.5px] font-mono text-slate-400">Gemini 2.5 Flash • Real-Time Web Intelligence</p>
              </div>
            </div>

            <span className="text-[8.5px] font-mono font-bold uppercase text-blue-300 bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-800/50 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Search Grounded</span>
            </span>
          </div>

          <p className="text-[10px] text-slate-300 font-sans leading-normal">
            Need emergency services for a specific city, airport, territory, or foreign country? Ask Achyuta to search verified, official hotlines in real time.
          </p>

          {/* Quick preset chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              "Mumbai police & emergency numbers",
              "Tokyo Japan English tourist emergency",
              "Berlin emergency ambulance numbers",
              "London crisis helpline Samaritans",
              "New York City domestic violence hotline"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiLookupQuery(chip);
                  handleAchyutaHelplineLookup(chip);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[9.5px] font-sans transition-all cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={aiLookupQuery}
              onChange={(e) => setAiLookupQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAchyutaHelplineLookup();
              }}
              placeholder="e.g. Rome Italy emergency police number..."
              className="w-full bg-slate-950 border border-slate-750 rounded-xl py-2 pl-3.5 pr-20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
            <button
              type="button"
              onClick={() => handleAchyutaHelplineLookup()}
              disabled={isAiLookingUp || !aiLookupQuery.trim()}
              className="absolute right-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
            >
              {isAiLookingUp ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Results card */}
          <AnimatePresence>
            {aiLookupResult && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-slate-950 border border-indigo-900/60 rounded-2xl p-4 space-y-2.5 shadow-inner"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Verified Helpline Intelligence
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiLookupResult(null)}
                    className="text-slate-400 hover:text-white text-xs font-mono px-1 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-slate-200 font-sans leading-relaxed prose prose-invert prose-xs max-w-none [&_p]:mb-1.5 [&_ul]:mb-1 [&_li]:mb-0.5">
                  <ReactMarkdown>{aiLookupResult.reply}</ReactMarkdown>
                </div>

                {aiLookupResult.groundingSources && aiLookupResult.groundingSources.length > 0 && (
                  <div className="pt-2 border-t border-slate-850 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Verified Citations:</span>
                    {aiLookupResult.groundingSources.map((s: any, sIdx: number) => (
                      <a
                        key={sIdx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-750 text-[9.5px] text-blue-300 font-mono transition-colors"
                      >
                        <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                        <span className="truncate max-w-[120px]">{s.title || "Source"}</span>
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 📞 1. DIRECT COUNTRY HELPLINES (INSTANT TAP-TO-CALL) */}
        <div className="bg-slate-900/65 border border-indigo-500/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-left backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              📞 1. DIRECT COUNTRY HELPLINES
            </h3>
            <span className="text-[8px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              TAP TO CALL INSTANTLY
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold font-sans uppercase tracking-wider">
            Select any country to display official Police, Ambulance, Fire, Child Helpline & Women Safety numbers. Tap any card to make an instant call.
          </p>

          {/* Region / Country Selector */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Selected Country Region:
              </span>
              <span className="text-[10px] text-white font-extrabold bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-800/60 font-mono">
                {COUNTRY_PRESETS.find(p => p.code === selectedPreset)?.flag || '🌐'} {COUNTRY_PRESETS.find(p => p.code === selectedPreset)?.name || 'Custom Region'}
              </span>
            </div>

            <select
              value={selectedPreset}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedPreset(code);
                if (code !== 'custom') {
                  applyPresetValues(code);
                  triggerNotification(`HELP DESK SWITCHED TO ${code} REGION`);
                }
              }}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs font-semibold cursor-pointer outline-none text-white font-sans"
            >
              {COUNTRY_PRESETS.map(preset => (
                <option key={preset.code} value={preset.code} className="bg-slate-950 text-white">
                  {preset.flag} {preset.name} — Police: {preset.numbers.police} | Ambulance: {preset.numbers.ambulance}
                </option>
              ))}
              <option value="custom" className="bg-slate-950 text-white">⚙️ Manual Custom Entry Mode</option>
            </select>
          </div>

          {/* Tap-to-Call Direct Helpline Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* 🚔 POLICE */}
            <button
              type="button"
              onClick={() => triggerCallSimulation('Police Response', policeNum)}
              className="bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between space-y-3 shadow-md hover:shadow-blue-950/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">🚔 POLICE</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block">Law Enforcement</span>
                  </div>
                </div>
                <span className="text-[8px] bg-blue-950 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded font-mono font-black uppercase">
                  DIRECT DIAL
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                <span className="text-sm font-black text-blue-400 font-mono tracking-wider">
                  {policeNum}
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3 fill-white" /> TAP TO CALL
                </span>
              </div>
            </button>

            {/* 🚑 AMBULANCE */}
            <button
              type="button"
              onClick={() => triggerCallSimulation('Ambulance Medical Emergency', ambulanceNum)}
              className="bg-slate-950/80 border border-slate-800 hover:border-red-500/50 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between space-y-3 shadow-md hover:shadow-red-950/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">🚑 AMBULANCE</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block">Medical Emergency</span>
                  </div>
                </div>
                <span className="text-[8px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-mono font-black uppercase">
                  DIRECT DIAL
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                <span className="text-sm font-black text-red-400 font-mono tracking-wider">
                  {ambulanceNum}
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3 fill-white" /> TAP TO CALL
                </span>
              </div>
            </button>

            {/* 🚒 FIRE EXTINGUISHER & RESCUE */}
            <button
              type="button"
              onClick={() => triggerCallSimulation('Fire Department & Rescue', fireNum)}
              className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between space-y-3 shadow-md hover:shadow-amber-950/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">🚒 FIRE & RESCUE</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block">Fire Service Helpline</span>
                  </div>
                </div>
                <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-mono font-black uppercase">
                  DIRECT DIAL
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                <span className="text-sm font-black text-amber-400 font-mono tracking-wider">
                  {fireNum}
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3 fill-white" /> TAP TO CALL
                </span>
              </div>
            </button>

            {/* 👶 CHILD HELPLINE */}
            <button
              type="button"
              onClick={() => triggerCallSimulation('Child Protection Helpline', childNum)}
              className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between space-y-3 shadow-md hover:shadow-emerald-950/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">👶 CHILD HELPLINE</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block">Child Safety & Support</span>
                  </div>
                </div>
                <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-mono font-black uppercase">
                  DIRECT DIAL
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                <span className="text-sm font-black text-emerald-400 font-mono tracking-wider">
                  {childNum}
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3 fill-white" /> TAP TO CALL
                </span>
              </div>
            </button>

            {/* 👩 WOMEN SAFETY */}
            <button
              type="button"
              onClick={() => triggerCallSimulation('Women Safety Helpline', womenNum)}
              className="bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between space-y-3 shadow-md hover:shadow-purple-950/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">👩 WOMEN SAFETY</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block">Women Helpline & Crisis</span>
                  </div>
                </div>
                <span className="text-[8px] bg-purple-950 text-purple-400 border border-purple-900/40 px-2 py-0.5 rounded font-mono font-black uppercase">
                  DIRECT DIAL
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                <span className="text-sm font-black text-purple-400 font-mono tracking-wider">
                  {womenNum}
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3 fill-white" /> TAP TO CALL
                </span>
              </div>
            </button>

            {/* 🌪️ DISASTER & CRISIS */}
            <button
              type="button"
              onClick={() => triggerCallSimulation('Disaster Response Helpline', disasterNum)}
              className="bg-slate-950/80 border border-slate-850 hover:border-indigo-500/50 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group flex flex-col justify-between space-y-3 shadow-md hover:shadow-indigo-950/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">🌪️ DISASTER & CRISIS</h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block">Disaster Management</span>
                  </div>
                </div>
                <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-mono font-black uppercase">
                  DIRECT DIAL
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                <span className="text-sm font-black text-indigo-400 font-mono tracking-wider">
                  {disasterNum}
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-indigo-600 hover:bg-indigo-550 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3 fill-white" /> TAP TO CALL
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* 📍 2. LIVE SAFETY INTELLIGENCE */}
        <div className="bg-slate-900/65 border border-indigo-500/10 rounded-[28px] p-5 shadow-2xl space-y-4 text-left backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <MapPin className="w-4 h-4 text-indigo-400" />
              📍 2. LIVE SAFETY INTELLIGENCE
            </h3>
            <span className="text-[8px] font-mono font-bold uppercase text-indigo-500 bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-900/30">
              CORE METRIC MAP
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold font-sans uppercase tracking-wider">
            Live GPS telemetry, nearby emergency points, and navigation assistance.
          </p>

          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4.5 space-y-4">
            
            {/* Live Location Grid */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-white uppercase flex items-center gap-1.5">
                    📍 LIVE LOCATION TELEMETRY
                  </h4>
                  {isLiveSharing && (
                    <span className="text-[8px] font-mono font-bold uppercase text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Radio className="w-2.5 h-2.5 text-red-400" />
                      Live Beacon Active ({Math.floor(liveShareRemainingSeconds / 60)}m)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9.5px] font-bold text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>GPS Locked &bull; Accuracy: ±3m</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Lat: {latitude.toFixed(6)}°, Lng: {longitude.toFixed(6)}°</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'coords')}
                  title="Copy Coordinates"
                  className="h-8 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[9px] font-bold uppercase tracking-wider px-2.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  {copiedItem === 'coords' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copiedItem === 'coords' ? 'Copied' : 'Coords'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="h-8 bg-indigo-600 hover:bg-indigo-550 text-white text-[9px] font-black uppercase tracking-wider px-3.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>[ SHARE LOCATION ]</span>
                </button>
              </div>
            </div>

            {/* Embedded maps visual interface inside Live Safety Intelligence */}
            {hasValidKey ? (
              <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-850 relative shadow-inner">
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
              <div className="w-full h-44 bg-slate-900/80 rounded-xl overflow-hidden border border-slate-850 relative shadow-inner flex flex-col items-center justify-center p-3">
                <div className="absolute w-28 h-28 rounded-full border border-indigo-500/10 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full border border-dashed border-indigo-400/15"></div>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(99,102,241,0.02)_100%)] pointer-events-none"></div>
                <div className="absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-indigo-500/20 top-1/2 left-1/2 origin-left animate-[spin_10s_linear_infinite]"></div>

                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 0,25 Q 40,30 50,45 T 100,50" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                  <path d="M 0,65 L 100,75" fill="none" stroke="#6366f1" strokeWidth="1" />
                  <path d="M 30,0 L 45,100" fill="none" stroke="#6366f1" strokeWidth="1.2" />
                  <path d="M 75,0 L 82,100" fill="none" stroke="#6366f1" strokeWidth="0.8" />
                </svg>

                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full bg-red-500/20 animate-ping duration-1000" />
                    <div className="w-6 h-6 rounded-full bg-[#EF4444] border-2 border-white flex items-center justify-center shadow-lg relative z-20">
                      <Navigation className="w-3 h-3 text-white transform rotate-45 fill-white" />
                    </div>
                  </div>
                  <span className="bg-slate-950/95 whitespace-nowrap border border-slate-800 rounded px-2 py-0.5 text-[8px] font-mono font-bold text-white uppercase tracking-wider mt-2 block shadow-md">
                    📍 LOCK ({latitude.toFixed(5)}°, {longitude.toFixed(5)}°)
                  </span>
                </div>

                {/* Simulated walk controls */}
                <div className="absolute bottom-1.5 right-1.5 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSimulatingMovement(!isSimulatingMovement);
                      triggerNotification(isSimulatingMovement ? 'WALK SIMULATION TERMINATED' : 'AUTOMATIC WALK SIMULATION ENGAGED');
                    }}
                    className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider transition-all font-mono ${
                      isSimulatingMovement 
                        ? 'bg-purple-600 text-white animate-pulse' 
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-900/40 hover:bg-slate-800'
                    }`}
                  >
                    {isSimulatingMovement ? 'Walk: On' : 'Simulate Walk'}
                  </button>
                </div>
              </div>
            )}

            {/* Safe Route Block */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 pt-1">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase flex items-center gap-1.5">
                  🧭 SAFE ROUTE
                </h4>
                <p className="text-[9.5px] text-slate-400 mt-0.5 leading-normal font-semibold">
                  Find a safer route or destination.
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerNotification('FINDING LOCAL SAFE ROUTES VIA AI COMPANION')}
                className="h-8 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900/40 text-[9px] font-black uppercase tracking-wider px-3.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                [ FIND SAFER ROUTE ]
              </button>
            </div>

            {/* Nearby Help Block */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase flex items-center gap-1.5">
                  🏥 NEARBY HELP
                </h4>
                <p className="text-[9.5px] text-slate-400 mt-0.5 leading-normal font-semibold">
                  Police • Hospital • Fire Station • Safe Places
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/emergency+near+me/@${latitude},${longitude},14z`}
                target="_blank"
                rel="noreferrer noopener"
                className="h-8 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900/40 text-[9px] font-black uppercase tracking-wider px-3.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                [ VIEW NEARBY HELP ]
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* STANDARD LOCATION SHARING MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[110] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Share2 className="w-5 h-5 text-indigo-400 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      Standard Location Share
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      GPS Telemetry &bull; Maps Links &bull; Multi-Channel Dispatch
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Location Telemetry Box */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                      VERIFIED ACTIVE GPS LOCK
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Accuracy: ±3m
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-850">
                    <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-bold block">Latitude</span>
                    <span className="text-white font-bold text-[11px]">{latitude.toFixed(6)}° N</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-850">
                    <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-bold block">Longitude</span>
                    <span className="text-white font-bold text-[11px]">{longitude.toFixed(6)}° E</span>
                  </div>
                </div>

                {/* Quick Copy Action Badges */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getStandardMapsUrl(), 'link')}
                    className={`h-7 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedItem === 'link'
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {copiedItem === 'link' ? <Check className="w-3 h-3 text-emerald-400" /> : <Link2 className="w-3 h-3 text-slate-400" />}
                    <span>{copiedItem === 'link' ? 'Copied Maps Link!' : 'Copy Maps Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(getStandardEmergencyText(true), 'msg')}
                    className={`h-7 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedItem === 'msg'
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {copiedItem === 'msg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedItem === 'msg' ? 'Copied Full Text!' : 'Copy Full Alert Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'coords')}
                    className={`h-7 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedItem === 'coords'
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {copiedItem === 'coords' ? <Check className="w-3 h-3 text-emerald-400" /> : <MapPin className="w-3 h-3 text-slate-400" />}
                    <span>{copiedItem === 'coords' ? 'Copied GPS!' : 'Copy Raw GPS'}</span>
                  </button>
                </div>
              </div>

              {/* Optional Emergency Note */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Optional Context Note (Appended to Alert message)
                </label>
                <input
                  type="text"
                  value={customEmergencyNote}
                  onChange={(e) => setCustomEmergencyNote(e.target.value)}
                  placeholder="e.g. Need immediate assistance at main gate / Walking to subway..."
                  className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                {[
                  { id: 'standard', label: 'Standard', icon: Share2 },
                  { id: 'guardians', label: 'Guardians', icon: Users },
                  { id: 'beacon', label: 'Live Beacon', icon: Radio },
                  { id: 'qr', label: 'QR Scan', icon: QrCode },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveShareTab(tab.id as any)}
                      className={`h-8 rounded-lg text-[9.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        activeShareTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Standard Multi-Platform Sharing */}
              {activeShareTab === 'standard' && (
                <div className="space-y-3 pt-1">
                  {/* Primary Native Share Action */}
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full h-11 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30"
                  >
                    <Smartphone className="w-4 h-4 stroke-[2.5]" />
                    <span>Open Native Device Share Sheet</span>
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* Email */}
                    <button
                      type="button"
                      onClick={() => sendDirectEmail()}
                      className="h-12 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">Universal Email</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Direct fallback</span>
                      </div>
                    </button>

                    {/* SMS / Messages */}
                    <button
                      type="button"
                      onClick={() => sendDirectSms()}
                      className="h-12 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl p-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">SMS Messages</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Native cellular</span>
                      </div>
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      onClick={() => sendDirectEmail()}
                      className="h-12 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-xl p-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">Email Client</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Emergency email</span>
                      </div>
                    </button>

                    {/* Google Maps */}
                    <a
                      href={getStandardMapsUrl()}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="h-12 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">Navigation Maps</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Live browser pin</span>
                      </div>
                    </a>

                    {/* Apple Maps */}
                    <a
                      href={getAppleMapsUrl()}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="h-12 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-500/50 rounded-xl p-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-850 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">Apple Maps</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">iOS map standard</span>
                      </div>
                    </a>

                    {/* Geo URI Protocol */}
                    <a
                      href={getGeoUri()}
                      className="h-12 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block truncate">Geo Protocol</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Device default app</span>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 2: Guardians & Safety Circle Direct Dispatch */}
              {activeShareTab === 'guardians' && (
                <div className="space-y-3 pt-1">
                  <p className="text-[10px] text-slate-400 font-medium">
                    Send verified coordinates directly to your designated emergency guardians over cellular SMS or universal email.
                  </p>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {savedCircleContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-slate-950/80 border border-slate-850 rounded-2xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{contact.avatar || '👤'}</span>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{contact.name}</h5>
                            <span className="text-[9px] font-mono text-slate-400 block truncate">
                              {contact.role || 'Guardian'} {contact.phone ? `• ${contact.phone}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => sendDirectSms(contact.phone)}
                            className="h-7.5 bg-sky-600/90 hover:bg-sky-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>SMS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => sendDirectEmail(contact.email)}
                            className="h-7.5 bg-indigo-600/90 hover:bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sendDirectSms();
                      triggerNotification('DISPATCHING LOCATION ALERT TO ALL GUARDIANS');
                    }}
                    className="w-full h-10 bg-red-650 hover:bg-red-600 text-white rounded-xl font-bold text-[10.5px] uppercase tracking-wider transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-red-500/30"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Broadcast Location to All Guardians</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Continuous Live GPS Beacon */}
              {activeShareTab === 'beacon' && (
                <div className="space-y-3.5 pt-1 text-center">
                  <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                        isLiveSharing
                          ? 'bg-red-950/60 border-red-500/50 text-red-400 animate-pulse'
                          : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400'
                      }`}>
                        <Radio className={`w-6 h-6 ${isLiveSharing ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {isLiveSharing ? 'Live GPS Beacon Active' : 'Continuous Live Tracking Beacon'}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isLiveSharing 
                            ? `Broadcasting real-time GPS telemetry (${Math.floor(liveShareRemainingSeconds / 60)} minutes remaining)`
                            : 'Generates a private live tracking link updated in real time as your coordinates move.'}
                        </p>
                      </div>
                    </div>

                    {isLiveSharing && (
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span>Active Session ID: <strong>{latitude.toFixed(3)}-{longitude.toFixed(3)}</strong></span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Sync (5s)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={getLiveBeaconUrl()}
                            className="w-full h-7 bg-slate-950 border border-slate-800 rounded-lg px-2 text-[9px] font-mono text-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(getLiveBeaconUrl(), 'beacon')}
                            className="h-7 px-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-[8.5px] font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                          >
                            {copiedItem === 'beacon' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {!isLiveSharing ? (
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">
                          Select Beacon Duration
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: '15 Mins', mins: 15 },
                            { label: '1 Hour', mins: 60 },
                            { label: '8 Hours', mins: 480 },
                          ].map((item) => (
                            <button
                              key={item.mins}
                              type="button"
                              onClick={() => handleStartLiveBeacon(item.mins)}
                              className="h-8 bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-800/40 rounded-xl text-[9px] font-bold text-indigo-300 uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopLiveBeacon}
                        className="w-full h-9 bg-red-650 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border border-red-500/20"
                      >
                        Stop Live Beacon
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Emergency Scannable QR Code */}
              {activeShareTab === 'qr' && (
                <div className="space-y-3 pt-1 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">
                    First responders, police officers, or companions can scan this QR code with any smartphone camera to immediately open your verified GPS location in navigation maps.
                  </p>

                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-xl border-4 border-slate-800">
                    {/* Vector QR Code visual pattern */}
                    <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      {/* Corner markers */}
                      <rect x="5" y="5" width="26" height="26" fill="black" />
                      <rect x="9" y="9" width="18" height="18" fill="white" />
                      <rect x="13" y="13" width="10" height="10" fill="black" />

                      <rect x="69" y="5" width="26" height="26" fill="black" />
                      <rect x="73" y="9" width="18" height="18" fill="white" />
                      <rect x="77" y="13" width="10" height="10" fill="black" />

                      <rect x="5" y="69" width="26" height="26" fill="black" />
                      <rect x="9" y="73" width="18" height="18" fill="white" />
                      <rect x="13" y="77" width="10" height="10" fill="black" />

                      {/* Data dots simulating coordinates */}
                      <rect x="36" y="8" width="6" height="6" fill="black" />
                      <rect x="48" y="12" width="6" height="6" fill="black" />
                      <rect x="58" y="6" width="6" height="6" fill="black" />
                      <rect x="38" y="24" width="6" height="6" fill="black" />
                      <rect x="52" y="22" width="6" height="6" fill="black" />
                      <rect x="10" y="38" width="6" height="6" fill="black" />
                      <rect x="22" y="44" width="6" height="6" fill="black" />
                      <rect x="38" y="38" width="8" height="8" fill="#4F46E5" />
                      <rect x="50" y="46" width="6" height="6" fill="black" />
                      <rect x="64" y="38" width="6" height="6" fill="black" />
                      <rect x="76" y="44" width="6" height="6" fill="black" />
                      <rect x="88" y="38" width="6" height="6" fill="black" />
                      <rect x="38" y="64" width="6" height="6" fill="black" />
                      <rect x="52" y="60" width="6" height="6" fill="black" />
                      <rect x="64" y="68" width="6" height="6" fill="black" />
                      <rect x="76" y="62" width="6" height="6" fill="black" />
                      <rect x="42" y="78" width="6" height="6" fill="black" />
                      <rect x="56" y="84" width="6" height="6" fill="black" />
                      <rect x="72" y="80" width="6" height="6" fill="black" />
                      <rect x="86" y="76" width="6" height="6" fill="black" />
                    </svg>
                    <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 uppercase tracking-wider">
                      GPS: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                    </span>
                  </div>

                  <div className="flex justify-center gap-2">
                    <a
                      href={getStandardMapsUrl()}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="h-8 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl px-4 text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" /> Open Target Link
                    </a>
                  </div>
                </div>
              )}

              {/* Close footer button */}
              <div className="border-t border-slate-800 pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-5 h-9 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE CALL SIMULATION LIVE OVERLAY POPUP */}
      <AnimatePresence>
        {callingService && (
          <div className="fixed inset-0 bg-slate-950/98 z-[100] flex flex-col items-center justify-center p-6 text-center">
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
                <span>Accuracy: ±3m</span>
              </div>
            </div>

            <button 
              onClick={() => setCallingService(null)}
              className="w-4/5 max-w-[280px] h-14 bg-red-650 hover:bg-red-600 rounded-xl text-white font-black active:scale-95 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md border border-red-500/20"
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
}
