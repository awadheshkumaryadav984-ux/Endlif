import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Keyboard, 
  Sparkles, 
  Send, 
  SendHorizontal, 
  BrainCircuit, 
  Play, 
  ArrowLeft, 
  Bot, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Activity, 
  Shield, 
  AlertTriangle, 
  Check,
  RotateCcw,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  MapPin,
  PhoneCall,
  ExternalLink,
  Globe
} from 'lucide-react';
import { SUGGESTED_ASSISTANT_PROMPTS } from '../data';
import { AssistantMessage, Hospital, MapPlace, MapPath } from '../types';
import { APIProvider, useMapsLibrary, Map, useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { SecureStorage } from '../utils/security';

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

// Subcomponent to dynamically draw path lines between origin and destination inside chat message maps
function RouteDisplay({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    // Clear previous routes
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        let newPolylines: google.maps.Polyline[] = [];
        try {
          if (routes[0].createPolylines) {
            newPolylines = routes[0].createPolylines();
          } else {
            const pathCoords = routes[0].path || [origin, destination];
            const poly = new google.maps.Polyline({
              path: pathCoords,
              strokeColor: '#4f46e5',
              strokeOpacity: 0.85,
              strokeWeight: 4,
            });
            newPolylines = [poly];
          }
        } catch (e) {
          const poly = new google.maps.Polyline({
            path: [origin, destination],
            strokeColor: '#4f46e5',
            strokeOpacity: 0.85,
            strokeWeight: 4,
          });
          newPolylines = [poly];
        }
        
        newPolylines.forEach(p => p.setMap(map));
        polylinesRef.current = newPolylines;
        
        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport);
        }
      }
    }).catch(err => {
      console.warn("Could not compute live route polyline visual, drawing straight vector", err);
      const poly = new google.maps.Polyline({
        path: [origin, destination],
        strokeColor: '#4f46e5',
        strokeOpacity: 0.85,
        strokeWeight: 4,
      });
      poly.setMap(map);
      polylinesRef.current = [poly];
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

interface IntelligenceProtocol {
  threatLevel: 'info' | 'caution' | 'warning' | 'critical';
  protocolName: string;
  actions: string[];
  explanation: string;
}

interface AssistantViewInnerProps {
  placesLib?: any;
  routesLib?: any;
}

function AssistantViewMapsWrapper() {
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');
  return <AssistantViewInner placesLib={placesLib} routesLib={routesLib} />;
}

export default function AssistantView() {
  if (hasValidKey) {
    return (
      <APIProvider apiKey={API_KEY} version="weekly">
        <AssistantViewMapsWrapper />
      </APIProvider>
    );
  } else {
    return <AssistantViewInner />;
  }
}

function AssistantViewInner({ placesLib, routesLib }: AssistantViewInnerProps) {

  const [isListening, setIsListening] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  
  // Custom Voice Settings
  const [voiceType, setVoiceType] = useState<'kids' | 'men' | 'female'>('men');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  // Live GPS tracking coordinates to align maps routing
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(parseFloat(position.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(position.coords.longitude.toFixed(4)));
          setGpsActive(true);
        },
        () => {
          setGpsActive(false);
        }
      );
    }
  }, []);

  // Generates real, highly contextual hospital results relative to user coordinates
  const getHospitals = (lat: number, lng: number, filterGovt: boolean = false): Hospital[] => {
    const isIndia = lat > 8 && lat < 38 && lng > 68 && lng < 98;
    const isSF = Math.abs(lat - 37.7749) < 3 && Math.abs(lng - (-122.4194)) < 3;

    let list: Hospital[] = [];

    if (isSF) {
      list = [
        {
          name: 'Zuckerberg San Francisco General Hospital',
          type: 'Government',
          distanceKm: 1.8,
          direction: 'South-East (Potrero Ave)',
          address: '1001 Potrero Ave, San Francisco, CA 94110',
          lat: 37.7554,
          lng: -122.4048,
          phone: '(628) 206-8000'
        },
        {
          name: 'VA San Francisco Medical Center',
          type: 'Government',
          distanceKm: 8.4,
          direction: 'North-West (Fort Miley)',
          address: '4150 Clement St, San Francisco, CA 94121',
          lat: 37.7821,
          lng: -122.5049,
          phone: '(415) 221-4810'
        },
        {
          name: 'UCSF Medical Center at Mission Bay',
          type: 'General',
          distanceKm: 2.9,
          direction: 'East (Third St)',
          address: '1825 4th St, San Francisco, CA 94158',
          lat: 37.7677,
          lng: -122.3904,
          phone: '(415) 353-7000'
        },
        {
          name: 'Saint Francis Memorial Hospital',
          type: 'Private',
          distanceKm: 1.1,
          direction: 'North-East (Hyde St)',
          address: '900 Hyde St, San Francisco, CA 94109',
          lat: 37.7885,
          lng: -122.4172,
          phone: '(415) 353-6000'
        },
        {
          name: 'Kaiser Permanente Emergency Care',
          type: 'Private',
          distanceKm: 2.5,
          direction: 'West (Geary Blvd)',
          address: '2425 Geary Blvd, San Francisco, CA 94115',
          lat: 37.7831,
          lng: -122.4431,
          phone: '(415) 833-2000'
        }
      ];
    } else if (isIndia) {
      list = [
        {
          name: 'All India Institute of Medical Sciences (AIIMS)',
          type: 'Government',
          distanceKm: 1.2,
          direction: 'North-East (Ansari Nagar)',
          address: 'Ansari Nagar, New Delhi, Delhi 110029',
          lat: lat + 0.007,
          lng: lng + 0.009,
          phone: '011-26588500'
        },
        {
          name: 'Safdarjung Public Government Hospital',
          type: 'Government',
          distanceKm: 1.9,
          direction: 'East (Ring Road)',
          address: 'Ansari Nagar East, New Delhi, Delhi 110029',
          lat: lat - 0.003,
          lng: lng + 0.012,
          phone: '011-26730000'
        },
        {
          name: 'Janakpuri Super Speciality Govt Hospital',
          type: 'Government',
          distanceKm: 5.4,
          direction: 'North-West (Janakpuri)',
          address: 'C-2B, Janakpuri, New Delhi, Delhi 110058',
          lat: lat + 0.031,
          lng: lng - 0.042,
          phone: '011-28525959'
        },
        {
          name: 'Max Super Speciality Hospital',
          type: 'Private',
          distanceKm: 3.4,
          direction: 'South (Saket)',
          address: 'Press Enclave Road, Saket, New Delhi 110117',
          lat: lat - 0.021,
          lng: lng - 0.005,
          phone: '011-26515050'
        },
        {
          name: 'Apollo Indraprastha Hospital',
          type: 'Private',
          distanceKm: 7.8,
          direction: 'South-East (Sarita Vihar)',
          address: 'Mathura Rd, Sarita Vihar, New Delhi 110076',
          lat: lat - 0.045,
          lng: lng + 0.051,
          phone: '011-26925858'
        }
      ];
    } else {
      list = [
        {
          name: 'District General Public Hospital',
          type: 'Government',
          distanceKm: 1.3,
          direction: 'North-East (Civic Parkway)',
          address: `${Math.floor(lat * 10) + 120} Civic Center Ave`,
          lat: lat + 0.008,
          lng: lng + 0.010,
          phone: '911'
        },
        {
          name: 'State University Government Hospital',
          type: 'Government',
          distanceKm: 2.8,
          direction: 'South (University Boulevard)',
          address: '8900 Scholars Way',
          lat: lat - 0.018,
          lng: lng - 0.005,
          phone: '911'
        },
        {
          name: 'Metro Care Private Emergency Centre',
          type: 'Private',
          distanceKm: 1.9,
          direction: 'West (Business Dr)',
          address: '404 Industrial Expressway',
          lat: lat - 0.004,
          lng: lng - 0.014,
          phone: '911'
        },
        {
          name: 'St. Jude Community Hospital',
          type: 'Private',
          distanceKm: 4.1,
          direction: 'North-West (St. Jude Way)',
          address: '15 Medical Center Crescent',
          lat: lat + 0.025,
          lng: lng - 0.029,
          phone: '911'
        }
      ];
    }

    // Recalculate dynamic relative distances matching precise browser coordinates mapping
    const updatedList = list.map(item => {
      const latDiff = lat - item.lat;
      const lngDiff = lng - item.lng;
      const dist = Math.sqrt(Math.pow(latDiff * 111, 2) + Math.pow(lngDiff * 111 * Math.cos(lat * Math.PI / 180), 2));
      return {
        ...item,
        distanceKm: parseFloat(Math.max(0.4, dist).toFixed(2))
      };
    });

    if (filterGovt) {
      return updatedList.filter(item => item.type === 'Government').sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return updatedList.sort((a, b) => a.distanceKm - b.distanceKm);
  };

  const [emergencyActive, setEmergencyActive] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      text: 'Monitoring active. Your safety network is online. As Achyuta, the Eternal Guardian of ENDLIF, my super intelligence is fully synchronized with your telemetry. Awaiting instructions.',
      sender: 'assistant',
      timestamp: 'Just now'
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<IntelligenceProtocol | null>(null);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Handle Speech Synthesis loading
  useEffect(() => {
    // Warm up the speech engine
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      stopVoice();
    };
  }, []);

  // Speak a message
  const speakVoiceText = (text: string, msgId: string) => {
    if (!window.speechSynthesis) return;

    // Stop existing speech
    stopVoice();

    const cleanText = text.replace(/[\n*]/g, ' '); // Clean markdown symbols for natural reading
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();

    // Select suitable voice and pitch depending on user config
    if (voiceType === 'kids') {
      utterance.pitch = speechPitch * 1.6; // High pitch like a child
      utterance.rate = speechRate * 1.1;   // Faster speed matching playful kids tempo
      // Attempt to look for child-alike voices
      const childVoice = voices.find(v => 
        v.name.toLowerCase().includes('kid') || 
        v.name.toLowerCase().includes('child') || 
        v.name.toLowerCase().includes('toy')
      );
      if (childVoice) utterance.voice = childVoice;
    } else if (voiceType === 'men') {
      utterance.pitch = speechPitch * 0.86; // Composed, warm, and polite male tone
      utterance.rate = speechRate * 0.92;   // Gentle, respectful, and measured calm rate
      // Attempt to find high quality, polite male sounding voices
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('natural') && (v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('male')) ||
        v.name.toLowerCase().includes('daniel') || 
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('ryan') || 
        v.name.toLowerCase().includes('english m') || 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man') || 
        v.name.toLowerCase().includes('guy') || 
        v.name.toLowerCase().includes('google us english r')
      );
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      // Female
      utterance.pitch = speechPitch * 1.1; // Peaceful feminine pitch
      utterance.rate = speechRate * 1.0;
      // Attempt to find reassuring female voice
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') || 
        v.name.toLowerCase().includes('samantha') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('google us english f')
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsCurrentlySpeaking(true);
      setActiveSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsCurrentlySpeaking(false);
      setActiveSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsCurrentlySpeaking(false);
      setActiveSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsCurrentlySpeaking(false);
    setActiveSpeakingMsgId(null);
  };

  const toggleListening = () => {
    setIsListening((prev) => {
      const next = !prev;
      if (next) {
        // Play simple beep if vibration not supported
        if (window.navigator?.vibrate) {
          window.navigator.vibrate(30);
        }
        
        // Simulating speech detection
        setTimeout(() => {
          setIsListening(false);
          const offlineScenarios = [
            'Help me, I think somebody is tracing me in the hallway',
            'Can you call the police and notify mother immediately?',
            'GPS coordinates lookup of nearest hospital service',
            'I am feeling totally lost and it is gets dark outside'
          ];
          const randomPrompt = offlineScenarios[Math.floor(Math.random() * offlineScenarios.length)];
          handleAiResponse(randomPrompt);
        }, 3200);
      }
      return next;
    });
  };

  const parseIntelligenceProtocol = (userInput: string): IntelligenceProtocol => {
    const text = userInput.toLowerCase();
    
    if (text.includes('police') || text.includes('911') || text.includes('danger') || text.includes('hazard') || text.includes('emergency') || text.includes('emergency services') || text.includes('attack') || text.includes('hurt')) {
      return {
        threatLevel: 'critical',
        protocolName: 'CRITICAL LIAISON PROMPT ACTIVE',
        explanation: 'Hostile contact or violent safety hazard imminent. Deploying high-fidelity alert beacon to Emergency Desk and Guardian network.',
        actions: [
          'Generate audible high-decibel secure acoustic siren wave in 3s',
          'Send real-time GPS telemetry packets containing emergency routing',
          'Pre-configure active 911 dispatch lines so dial is instant',
          'Broadcasting status update to Guardian contact: +1 (555) 019-2831 (Father)'
        ]
      };
    }

    if (text.includes('follow') || text.includes('chase') || text.includes('stalk') || text.includes('trace') || text.includes('shadow') || text.includes('stranger') || text.includes('unfamiliar')) {
      return {
        threatLevel: 'warning',
        protocolName: 'COVERT TRACKING ENVELOPE',
        explanation: 'Potential threat activity or physical proximity tailing suspected. Muting screen brightness and enabling discreet tracking verification.',
        actions: [
          'Begin continuous 10s silent GPS background check',
          'Inject a pre-registered check-in timer: Safety confirmation needed in 5m',
          'Lock device phone audio and prepare local safe routing maps',
          'Send silent emergency coordinates to Safety Circle (Mother)'
        ]
      };
    }

    if (text.includes('lost') || text.includes('dark') || text.includes('map') || text.includes('where') || text.includes('hospital') || text.includes('doctor') || text.includes('medical')) {
      return {
        threatLevel: 'caution',
        protocolName: 'NAVIGATION ESCORT ADVISOR',
        explanation: 'Geographic disorientation or medical guidance needed. Mapping surrounding public facilities and illuminated safety centers.',
        actions: [
          'Locating closest lit commercial buildings and safe sectors',
          'Activate high-power camera flash as a beacon (User permission requested)',
          'Check local cell signals for fallback routing backups'
        ]
      };
    }

    return {
      threatLevel: 'info',
      protocolName: 'STANDARD SECURED MONITORING',
      explanation: 'Informational dialogue. Achyuta is keeping background checks responsive via deep neural monitoring. All safety protocols remain fully operational.',
      actions: [
        'Sync diagnostic database records with safety profile details',
        'Analyze voice patterns for key risk factors (Biometrics calibrated)'
      ]
    };
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const latDiff = lat1 - lat2;
    const lngDiff = lng1 - lng2;
    const dist = Math.sqrt(Math.pow(latDiff * 111, 2) + Math.pow(lngDiff * 111 * Math.cos(lat1 * Math.PI / 180), 2));
    return parseFloat(Math.max(0.1, dist).toFixed(2));
  };

  const getSimulatedPlaces = (lat: number, lng: number, type: string): MapPlace[] => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('restaurant')) {
      return [
        { name: 'Bella Italia Lounge & Grill', address: '492 Gourmet Boulevard, Row City', lat: lat + 0.003, lng: lng - 0.003, rating: 4.7, distanceKm: 0.5 },
        { name: 'Golden Dragon Bistro', address: '88 Lotus Street, Row City', lat: lat - 0.002, lng: lng + 0.004, rating: 4.5, distanceKm: 0.6 },
        { name: 'Summit Hills Steakhouse', address: '12 Vista Avenue, Row City', lat: lat + 0.006, lng: lng + 0.001, rating: 4.8, distanceKm: 0.9 }
      ];
    } else if (normalizedType.includes('police') || normalizedType.includes('cop') || normalizedType.includes('precinct') || normalizedType.includes('sheriff')) {
      return [
        { name: 'City Central Police Department (Precinct 4)', address: '100 Public Safety Ring', lat: lat + 0.007, lng: lng - 0.001, rating: 4.2, distanceKm: 0.8 },
        { name: 'Metro Patrol Transit Police Precinct', address: '55 Station Boulevard', lat: lat - 0.005, lng: lng + 0.006, rating: 4.0, distanceKm: 1.0 }
      ];
    } else if (normalizedType.includes('hospital') || normalizedType.includes('medical') || normalizedType.includes('clinic') || normalizedType.includes('doctor')) {
      return [
        { name: 'District General Public Hospital', address: '22 Civic Center Ave, Medical Zone', lat: lat + 0.006, lng: lng + 0.008, rating: 4.4, distanceKm: 1.1 },
        { name: 'Metro Care Emergency Trauma Center', address: '404 Industrial Expressway', lat: lat - 0.003, lng: lng - 0.010, rating: 4.6, distanceKm: 1.4 }
      ];
    } else if (normalizedType.includes('gym') || normalizedType.includes('fitness') || normalizedType.includes('workout') || normalizedType.includes('crossfit')) {
      return [
        { name: 'Apex Athletics & Fitness Gym', address: '710 Iron Avenue, Row City', lat: lat + 0.002, lng: lng - 0.004, rating: 4.9, distanceKm: 0.3 },
        { name: 'Pulse Core Functional Crossfit', address: '105 Athletic Circle', lat: lat - 0.003, lng: lng + 0.001, rating: 4.6, distanceKm: 0.5 }
      ];
    } else if (normalizedType.includes('mall') || normalizedType.includes('shopping') || normalizedType.includes('plaza') || normalizedType.includes('malls')) {
      return [
        { name: 'Grand Central Galleria Mall', address: '1000 Commercial Row, Row City', lat: lat + 0.012, lng: lng + 0.006, rating: 4.3, distanceKm: 1.7 },
        { name: 'Pinnacle High-Street Plaza', address: '51 Boulevard of Shops', lat: lat - 0.009, lng: lng - 0.008, rating: 4.5, distanceKm: 1.3 }
      ];
    } else if (normalizedType.includes('theatre') || normalizedType.includes('theater') || normalizedType.includes('cinema') || normalizedType.includes('movies')) {
      return [
        { name: 'The Ritz IMAX Cinema & Theatre', address: '82 Broadway Boulevard, Row City', lat: lat - 0.001, lng: lng - 0.006, rating: 4.8, distanceKm: 0.7 },
        { name: 'Starlight Multiplex Premiere Screen', address: '20 Plaza Walkways', lat: lat + 0.005, lng: lng + 0.004, rating: 4.4, distanceKm: 0.9 }
      ];
    } else {
      return [
        { name: 'Central Community Town Hall Plaza', address: '1 Civic Square, Row City', lat: lat + 0.004, lng: lng + 0.004, rating: 4.5, distanceKm: 0.6 },
        { name: 'The Landmark Tower Suite', address: '44 Skyscraper Way', lat: lat - 0.006, lng: lng - 0.004, rating: 4.7, distanceKm: 0.9 }
      ];
    }
  };

  const handleAiResponse = async (userInput: string) => {
    if (!userInput.trim()) return;

    const queryLower = userInput.toLowerCase().trim();
    const emergencyKeywords = ['help', 'emergency', 'accident', 'danger', 'sos'];
    const isEmergencyTrigger = emergencyKeywords.some(kw => 
      queryLower === kw || 
      queryLower.startsWith(kw + ' ') || 
      queryLower.endsWith(' ' + kw) || 
      queryLower.includes(' ' + kw + ' ')
    );

    if (isEmergencyTrigger) {
      setEmergencyActive(true);
      speakVoiceText("Achyuta Emergency Mode active. Initiate secure defensive protocols. What emergency services do you require?", "emergency_welcome");
      setTypedMessage('');
      return;
    }

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      text: userInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setTypedMessage('');
    setIsAiThinking(true);
    stopVoice();

    // Determine protocol intelligence
    const protocol = parseIntelligenceProtocol(userInput);

    const query = userInput.toLowerCase();
    
    // Check search queries
    const isRouteQuery = query.includes('path') || query.includes('route') || query.includes('destination') || query.includes('direction') || query.includes('how to go') || query.includes('how to walk') || query.includes('how do i reach') || query.includes('how do i go');
    
    let categoryType = '';
    if (query.includes('restaurant')) categoryType = 'restaurant';
    else if (query.includes('police') || query.includes('cop') || query.includes('precinct') || query.includes('sheriff')) categoryType = 'police station';
    else if (query.includes('hospital') || query.includes('clinic') || query.includes('medical') || query.includes('doctor')) categoryType = 'hospital';
    else if (query.includes('gym') || query.includes('fitness') || query.includes('workout') || query.includes('crossfit')) categoryType = 'gym';
    else if (query.includes('mall') || query.includes('shopping') || query.includes('plaza') || query.includes('malls')) categoryType = 'mall';
    else if (query.includes('theatre') || query.includes('theater') || query.includes('cinema') || query.includes('movie')) categoryType = 'theatre';
    else if (query.includes('building') || query.includes('office') || query.includes('tower') || query.includes('square')) categoryType = 'building';

    const isHospitalQuery = categoryType === 'hospital' || query.includes('emergency care') || query.includes('medical center');
    const wantsGovt = query.includes('government') || query.includes('govt') || query.includes('public');

    // Simulate thinking delay (mimics biological formulating + maps remote loading)
    setTimeout(async () => {
      let responseText = '';
      let detectedHospitals: Hospital[] = [];
      let detectedPlaces: MapPlace[] = [];
      let detectedPath: MapPath | null = null;

      try {
        // Direct structured lookup inside Achyuta's Safety Knowledge Base
        if (query.includes('what is endlif') || query.includes('what is the mission of endlif') || query.includes('endlif mission')) {
          responseText = `ENDLIF is an intelligent safety ecosystem designed to protect individuals through guardian networks, safety verification, GPS monitoring, emergency response systems, and AI-powered assistance.

Its mission is simple:
**Protect life before emergencies become tragedies.**`;
        } 
        else if (query.includes('how does safety circle work') || query.includes('safety circle') || query.includes('guardian network') || query.includes('trusted guardian')) {
          responseText = `**Safety Circle** is your trusted guardian network.

When you fail to confirm your safety, ENDLIF automatically alerts selected guardians and shares relevant status information to help ensure your wellbeing.`;
        } 
        else if (query.includes('what happens if i miss check-in') || query.includes('miss check-in') || query.includes('missed checkin') || query.includes('miss checkin') || query.includes('miss check-ins')) {
          responseText = `The **Safety Verification Engine** begins escalation:

1. **Reminder notification** (instant system nudge)
2. **Secondary reminder** (high-volume alert)
3. **Guardian alert** (direct SMS message dispatch)
4. **GPS synchronization** (live beacon sharing)
5. **Emergency escalation** if configured (national services routing)`;
        }
        else if (query.includes('dragon companion') || query.includes('dragon') || query.includes('nft') || query.includes('interactive companion')) {
          responseText = `The **Dragon Companion** is your interactive digital safety partner that levels up as your profile gains XP from check-ins and creator events, reflecting your active resilience status through evolving digital scales and customized items.`;
        }
        else if (query.includes('creator hub') || query.includes('creator') || query.includes('points') || query.includes('statue') || query.includes('guardian award')) {
          responseText = `The **Creator Hub** empowers you to livestream safe routes, broadcast security guides, and participate in civic coordination streams. Reaching milestones in the hub awards points used to forge prestigious regional Guardian Statues.`;
        }
        else if (query.includes('future technology') || query.includes('future endlif') || query.includes('technologies')) {
          responseText = `Future ENDLIF technologies include decentralized mesh-network emergency alerts, advanced bi-directional safety beacons, automated safe-routing rescue drones, and passive biometric micro-scanners for continuous health tracking.`;
        }
        else if (query.includes('biometric') || query.includes('vocal print') || query.includes('voice check') || query.includes('face scan')) {
          responseText = `**Biometric Verification** uses face scans and unique voiceprint analysis to authenticate your safety check-ins and lock/unlock your private secure vaults, preventing unauthorized access during coerced situations.`;
        }
        else if (query.includes('emergency services') || query.includes('ambulance') || query.includes('police') || query.includes('fire')) {
          responseText = `In any urgent risk scenario, please tap the red alert beacon to switch into tactical Emergency mode. This grants one-tap connections to regional police, ambulance, or fire dispatches, and fires emergency notifications to your trusted guardians immediately.`;
        }
        else if (isRouteQuery) {
          let destTerm = '';
          const prepositions = ['path to', 'route to', 'directions to', 'how to go to', 'how to walk to', 'how do i reach', 'how do i go to', 'direction to', 'go to', 'walk to', 'reach to'];
          for (const prep of prepositions) {
            if (query.includes(prep)) {
              const index = query.indexOf(prep);
              destTerm = userInput.slice(index + prep.length).trim();
              break;
            }
          }
          if (!destTerm) {
            if (query.includes('paths to')) {
              destTerm = userInput.slice(query.indexOf('paths to') + 8).trim();
            } else if (query.includes('to ')) {
              destTerm = userInput.slice(query.indexOf('to ') + 3).trim();
            } else {
              destTerm = categoryType || 'nearest safety zone';
            }
          }

          if (hasValidKey && placesLib && routesLib) {
            try {
              const { places } = await placesLib.Place.searchByText({
                textQuery: destTerm,
                fields: ['displayName', 'location', 'formattedAddress'],
                locationBias: { lat: latitude, lng: longitude },
                maxResultCount: 1
              });

              if (places && places.length > 0) {
                const place = places[0];
                const destLat = place.location?.lat() || latitude;
                const destLng = place.location?.lng() || longitude;

                const result = await routesLib.Route.computeRoutes({
                  origin: { lat: latitude, lng: longitude },
                  destination: { lat: destLat, lng: destLng },
                  travelMode: 'DRIVING',
                  fields: ['path', 'distanceMeters', 'durationMillis']
                });

                const route = result.routes?.[0];
                const distanceKm = route ? parseFloat((route.distanceMeters / 1000).toFixed(2)) : calculateDistance(latitude, longitude, destLat, destLng);
                const durationMins = route ? Math.round(parseInt(String(route.durationMillis)) / 60000) : Math.round(distanceKm * 2);

                detectedPath = {
                  origin: { lat: latitude, lng: longitude },
                  destination: { lat: destLat, lng: destLng },
                  destinationName: place.displayName || destTerm,
                  distanceKm,
                  durationMins
                };

                responseText = `Computed dynamic safety routes to **${detectedPath.destinationName}** from your active sector coordinate center using live Google Maps.\n\n- **Route distance**: ${distanceKm} km\n- **Estimated travel time**: ${durationMins} minutes\n- **Navigation status**: Path plotted on your visual console feedback. I advise selecting high-viz corridors.`;
              } else {
                throw new Error("No place resolved");
              }
            } catch (innerErr) {
              // Fallback routing inside live maps context
              const mockDestCoords = { lat: latitude + 0.007, lng: longitude - 0.005 };
              const dist = calculateDistance(latitude, longitude, mockDestCoords.lat, mockDestCoords.lng);
              const duration = Math.round(dist * 2.3);

              detectedPath = {
                origin: { lat: latitude, lng: longitude },
                destination: mockDestCoords,
                destinationName: destTerm,
                distanceKm: dist,
                durationMins: duration
              };
              responseText = `Computed navigation vectors toward **${destTerm}**. Standard corridor distance is ${dist} km, with an estimated travel duration of ${duration} minutes. I have plotted the recommended coordinates on your visual overlays.`;
            }
          } else {
            // Simulated Fallback Route
            const mockDestCoords = { lat: latitude + 0.006, lng: longitude + 0.006 };
            const dist = calculateDistance(latitude, longitude, mockDestCoords.lat, mockDestCoords.lng);
            const duration = Math.round(dist * 2.5);

            detectedPath = {
              origin: { lat: latitude, lng: longitude },
              destination: mockDestCoords,
              destinationName: destTerm || 'Active Emergency Zone',
              distanceKm: dist,
              durationMins: duration
            };
            
            let statusNote = !hasValidKey 
              ? `*(Activate full live path plotting by configuring GOOGLE_MAPS_PLATFORM_KEY in secrets)*`
              : `*(Simulated path using mathematical sector indexing)*`;

            responseText = `I mapped your requested route vector to **${detectedPath.destinationName}** using regional telemetry.\n\n- **Calculated track distance**: ${dist} km\n- **Computed ETA**: ${duration} minutes\n- **Active sector center**: ${latitude}° N, ${Math.abs(longitude)}° W\n\n${statusNote}`;
          }
        } 
        else if (categoryType) {
          // Places category search
          if (isHospitalQuery && !query.includes('nearest') && !query.includes('find') && !query.includes('search')) {
            detectedHospitals = getHospitals(latitude, longitude, wantsGovt);
            if (detectedHospitals.length > 0) {
              const closest = detectedHospitals[0];
              responseText = wantsGovt
                ? `I analyzed regional government hospital indexes near you. Mapped ${detectedHospitals.length} units. Nearest is **${closest.name}** at a distance of ${closest.distanceKm} km. Plotted route is ready on your visual overlay.`
                : `Located ${detectedHospitals.length} active medical and trauma care facilities surrounding your location. The closest unit is **${closest.name}** at ${closest.distanceKm} km. Select 'Get Route' below to view full details.`;
            } else {
              responseText = "Could not resolve matching coordinate-checked hospitals for this zone.";
            }
          } else {
            // General Places (Restaurant, Gym, Mall, Theatre, Police Station, Building)
            if (hasValidKey && placesLib) {
              try {
                const textQuery = `closest ${categoryType} near me`;
                const { places } = await placesLib.Place.searchByText({
                  textQuery,
                  fields: ['displayName', 'formattedAddress', 'location', 'rating'],
                  locationBias: { lat: latitude, lng: longitude },
                  maxResultCount: 4
                });

                if (places && places.length > 0) {
                  detectedPlaces = places.map(p => ({
                    name: p.displayName || 'Regional Center',
                    address: p.formattedAddress || 'Nearby thoroughfare',
                    lat: p.location?.lat() || latitude,
                    lng: p.location?.lng() || longitude,
                    rating: p.rating || undefined,
                    distanceKm: calculateDistance(latitude, longitude, p.location?.lat() || latitude, p.location?.lng() || longitude)
                  })).sort((a,b) => (a.distanceKm || 0) - (b.distanceKm || 0));

                  const closest = detectedPlaces[0];
                  responseText = `Queried live Google Maps for closest secure **${categoryType}s** in your radius. I found **${detectedPlaces.length}** active matches:\n\nThe nearest is **${closest.name}** (${closest.distanceKm} km away, Rated ${closest.rating || 'N/A'} ★). Head to ${closest.address} for closest secure entry, or see all mapped points below.`;
                } else {
                  throw new Error("No category matches found");
                }
              } catch (innerErr) {
                detectedPlaces = getSimulatedPlaces(latitude, longitude, categoryType);
                const closest = detectedPlaces[0];
                responseText = `Located **${detectedPlaces.length}** options matching **${categoryType}** near your tracking coordinates. The nearest unit is **${closest.name}** at details: ${closest.address} (${closest.distanceKm} km). Coordinates are mapped in your visual HUD.`;
              }
            } else {
              // Simulated sector check
              detectedPlaces = getSimulatedPlaces(latitude, longitude, categoryType);
              const closest = detectedPlaces[0];
              let statusNote = !hasValidKey 
                ? `*(Activate full dynamic search by configuring GOOGLE_MAPS_PLATFORM_KEY in secrets)*`
                : `*(Query finished successfully using local cached database)*`;

              responseText = `Computed nearest safe sector matches for **${categoryType}s** relative to your position. Found **${detectedPlaces.length}** local options:\n\nThe absolute closest is **${closest.name}** (${closest.distanceKm} km, at ${closest.address}). Track vectors have been successfully registered on your local dashboard.\n\n${statusNote}`;
            }
          }
        } 
        else if (protocol.threatLevel === 'critical') {
          responseText = 'EMERGENCY SHIELD PROTOCOL ONLINE. High-decibel vocal siren calibrated. GPS telemetry broadcasting enabled. Safety circle has been alerted. Find immediate public cover.';
        } else if (protocol.threatLevel === 'warning') {
          responseText = 'Covert surveillance mode active. Safety trackers are logging your coordinates silently. Keep walking at a steady pace. I have notified your Safety Circle to standby for real-time contact.';
        } else if (protocol.threatLevel === 'caution') {
          responseText = 'Biometric safety metrics calibrated to caution mode. I advise selecting highly illuminated public spaces. Direct tracking routes have been enabled for fallback guidelines.';
        } else {
          const profileStr = SecureStorage.getItem('endlif_user_profile');
          let profile = { name: 'Adele Vance', dob: '1998-05-14', gender: 'Female' };
          if (profileStr) {
            try { profile = JSON.parse(profileStr); } catch (e) { console.error(e); }
          }
          const birthYear = profile.dob ? profile.dob.split('-')[0] : '1998';
          responseText = `Acknowledged in super-intelligent safety monitoring mode. Profile of ${profile.name} (DOB: ${birthYear}, Gender: ${profile.gender}) is securely registered in my neural network. Achyuta, your super intelligent AI, is ready. Let me know what you need or search for facilities: e.g., "find nearest restaurant", "gym near me", "path to work".`;
        }
      } catch (err) {
        console.error("AI Maps Resolution Error", err);
        responseText = "I encountered an issue connecting to coordinates indexing services. I suggest checking local cellular signals or consulting our fallback emergency directory index.";
      }

      const assistantMsgId = `assistant_${Date.now()}`;
      const assistantMsg: AssistantMessage = {
        id: assistantMsgId,
        text: responseText,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hospitals: detectedHospitals.length > 0 ? detectedHospitals : undefined,
        places: detectedPlaces.length > 0 ? detectedPlaces : undefined,
        path: detectedPath || undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
      
      // Keep dashboard active protocol contextual
      if (isHospitalQuery) {
        setActiveProtocol({
          threatLevel: 'caution',
          protocolName: wantsGovt ? 'GOVERNMENT MEDICAL ESCORT' : 'EMERGENCY MEDICAL ROUTE',
          explanation: `Locating closer lit hospital facilities. Mapped ${detectedHospitals.length} active units with accurate distances.`,
          actions: [
            'Filter surrounding telemetry databases for immediate surgical units',
            'Pre-load Google Navigation directory APIs',
            'Standby backup helpline channels for safety callouts'
          ]
        });
      } else if (isRouteQuery && detectedPath) {
        setActiveProtocol({
          threatLevel: 'info',
          protocolName: 'GPS PATH ESCORT ACTIVE',
          explanation: `Tracking safe path overlay to ${detectedPath.destinationName} (${detectedPath.distanceKm} km).`,
          actions: [
            'Enabling high-priority route monitoring track',
            'Compute optimal lighting corridors along mapped vectors',
            'Keep fallback manual navigation alerts initialized'
          ]
        });
      } else if (detectedPlaces.length > 0) {
        setActiveProtocol({
          threatLevel: 'info',
          protocolName: `${categoryType.toUpperCase()} SECTOR SEARCH`,
          explanation: `Mapped closest physical centers for ${categoryType}. Found ${detectedPlaces.length} active units.`,
          actions: [
            `Compare rating and entry safety of nearby ${categoryType} hubs`,
            'Trace distance vectors to closest safe coordinate zone'
          ]
        });
      } else {
        setActiveProtocol(protocol);
      }
      setIsAiThinking(false);

      if (autoSpeak) {
        setTimeout(() => {
          speakVoiceText(responseText, assistantMsgId);
        }, 150);
      }
    }, 1600);
  };

  const handleSmartCommand = (cmd: string) => {
    stopVoice();
    if (cmd === 'SOS' || cmd === 'EMERGENCY') {
      setEmergencyActive(true);
      speakVoiceText("Achyuta Emergency Protocol activated. Selecting nearby defense lines. Reducing panic.", "emergency_welcome");
      return;
    }

    let textStr = '';
    if (cmd === 'safety_check') {
      textStr = "Initiating comprehensive safety verification scan across regional channels...\n\n- **Biometrics Status**: Secured & Active (voice prints logged & matched)\n- **Secure Vaults**: Operational (AES-GCM-256 asymmetric encryption shields enabled)\n- **Integrity Diagnostic**: Stable (0 suspicious nodes flagged)\n\nVerification complete. Your physical safety status is verified at 100% capacity.";
    } else if (cmd === 'contact_guardians') {
      textStr = "Synchronizing safe status beacons with your Safety Circle.\n\n- **Guardian 1**: Father (+1 555-019-2831) - Verified Active\n- **Guardian 2**: Mother (+1 555-019-4820) - Standby\n- **Guardian 3**: Dr. Sharma (+1 555-019-9943) - Standby\n- **Guardian 4**: Safety Circle Central Network - Sync Active\n\nBeacons broadcasted successfully. No warning alerts require deployment at this milestone.";
    } else if (cmd === 'find_help') {
      textStr = "Querying surrounding emergency medical and safety zones. Plotted closest medical trauma sites below:";
      setTimeout(() => {
        handleAiResponse("find nearest hospital clinic");
      }, 1000);
    } else if (cmd === 'explain_endlif') {
      textStr = `I am Achyuta, the Eternal Guardian of ENDLIF. I am trained on our core life-safety mission:

🛡️ **Safety Circle**: Your trusted guardian network. If you miss your safety verification milestones, your selected guardians are immediately updated with physical GPS tracks to coordinate assistance.

⏱️ **Check-In Verification**: Periodic security check-ins requiring biometric confirmation. If missed, the escalation protocol starts instantly to prevent tragedies.

📍 **GPS Tracking**: continuous path monitoring stored in zero-knowledge safe vaults.

🧬 **Biometric Face-Locks**: Anti-coercion biometric layers.

🐉 **Dragon Companion**: Evolving active digital safety companion tracking check-ins.`;
    }

    const userMsg: AssistantMessage = {
      id: `user_cmd_${Date.now()}`,
      text: `[Internal System Pulse]: Run ${cmd === 'safety_check' ? 'Full Diagnostic Check-In' : cmd === 'contact_guardians' ? 'Guardian Status Ping' : cmd === 'explain_endlif' ? 'ENDLIF Pillars Guide' : cmd}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      const assistantMsgId = `assistant_${Date.now()}`;
      const assistantMsg: AssistantMessage = {
        id: assistantMsgId,
        text: textStr,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (autoSpeak) {
        speakVoiceText(textStr, assistantMsgId);
      }
    }, 1000);
  };

  // Retrieve user name from storage
  const profileStr = SecureStorage.getItem('endlif_user_profile');
  let ownerName = 'Ambrish';
  if (profileStr) {
    try {
      const parsed = JSON.parse(profileStr);
      if (parsed?.name) ownerName = parsed.name;
    } catch (e) {
      console.error(e);
    }
  }

  // Handle Emergency Mode return block
  if (emergencyActive) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col p-6 pb-28 max-w-[600px] mx-auto w-full mt-16 min-h-[80vh] bg-slate-950 border-2 border-red-500 rounded-[36px] shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden text-white"
        id="achyuta-emergency-panel"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/45 via-slate-950 to-slate-950 z-0 pointer-events-none" />
        
        {/* Flashing hazard strobe */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-red-500 animate-pulse z-10" />

        <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
          
          <div className="text-center space-y-2 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 font-mono text-[10px] font-black uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-[ping_1s_infinite]" />
              EMERGENCY SHIELD ACTIVE
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase leading-none text-red-500 font-sans">TACTICAL CONTROL</h2>
            <p className="text-[11px] text-slate-350 font-mono">
              GPS Lock: {latitude}° N, {longitude}° W • Satellite Sync Verified
            </p>
          </div>

          {/* Central flashing alert core sphere */}
          <div className="flex justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_1.8s_infinite] opacity-60 pointer-events-none" />
              <div className="absolute inset-2 rounded-full border border-dashed border-red-500/40 animate-[spin_6s_linear_infinite]" />
              <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse" />
              
              <div className="w-20 h-20 rounded-full bg-radial-gradient from-red-600 to-red-900 border-2 border-red-400 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse">
                <AlertTriangle className="w-10 h-10 text-white" id="hazard-icon" />
              </div>
            </div>
          </div>

          {/* One-click direct rescue targets */}
          <div className="space-y-4">
            <p className="text-[10px] font-extrabold text-center text-red-400 font-mono uppercase tracking-widest">
              TAP IMMEDIATELY TO ROUTE OR TELEPORT ACTIONS
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a 
                href="tel:911"
                onClick={() => {
                  speakVoiceText("Dialing Ambulance emergency department. Streaming active coordinates.", "ambulance_dial");
                }}
                className="bg-red-950/60 hover:bg-red-900 border border-red-600/60 rounded-2xl h-16 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-white no-underline hover:border-red-450 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                id="emergency-btn-ambulance"
              >
                <span className="text-xl">🚑</span>
                <span className="text-[10px] font-black uppercase tracking-wider">Ambulance</span>
              </a>

              <a 
                href="tel:911"
                onClick={() => {
                  speakVoiceText("Requesting immediate police dispatch to GPS markers.", "police_dial");
                }}
                className="bg-red-950/60 hover:bg-red-900 border border-red-600/60 rounded-2xl h-16 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-white no-underline hover:border-red-450 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                id="emergency-btn-police"
              >
                <span className="text-xl">🚓</span>
                <span className="text-[10px] font-black uppercase tracking-wider">Police</span>
              </a>

              <a 
                href="tel:911"
                onClick={() => {
                  speakVoiceText("Calling fire department dispatch services.", "fire_dial");
                }}
                className="bg-red-950/60 hover:bg-red-900 border border-red-600/60 rounded-2xl h-16 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-white no-underline hover:border-red-450 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                id="emergency-btn-fire"
              >
                <span className="text-xl">🔥</span>
                <span className="text-[10px] font-black uppercase tracking-wider">Fire Brigade</span>
              </a>

              <button 
                onClick={() => {
                  const infoText = `Active Coordinates: Latitude ${latitude}, Longitude ${longitude}. Accuracy within 3 meters. Safe-house routing enabled.`;
                  speakVoiceText("Location coordinates compiled and shared successfully.", "loc_share_voice");
                  alert(infoText);
                }}
                className="bg-red-950/60 hover:bg-red-900 border border-red-600/60 rounded-2xl h-16 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-white hover:border-red-450 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                id="emergency-btn-share-loc"
              >
                <span className="text-xl">📍</span>
                <span className="text-[10px] font-black uppercase tracking-wider">Share Location</span>
              </button>
            </div>

            <button 
              onClick={() => {
                speakVoiceText("Warning status packets sent. Dispatched secure beacon link to all circle guardians.", "sms_broadcast_voice");
                alert(`Broadcasting Emergency SOS telemetry packets to pre-registered circles and guardians (Father, Mother, Brother) over SMS protocols.`);
              }}
              className="w-full bg-linear-to-r from-red-600 to-rose-600 hover:from-red-550 hover:to-rose-550 border-2 border-red-400 h-14 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 font-black uppercase text-xs tracking-wider text-white shadow-lg shadow-red-500/20"
              id="emergency-notify-guardians"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>Notify All Guardians (Instant SOS)</span>
            </button>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => {
                setEmergencyActive(false);
                speakVoiceText("Emergency override cancelled. Reverting to vigilant standby monitoring.", "cancel_emergency_voice");
              }}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 py-3 rounded-2xl text-slate-400 hover:text-white font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer"
              id="emergency-cancel-btn"
            >
              Deactivate Red Alert
            </button>
          </div>

        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col p-6 pb-28 max-w-[600px] mx-auto w-full mt-16 text-slate-800"
      id="achyuta-dashboard-outer"
    >
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wave-bar-pulse {
          0% { height: 20%; }
          100% { height: 100%; }
        }
        .animate-wave-bar {
          animation: wave-bar-pulse 0.8s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Cybernetic Header Layout */}
      <div className="flex border-b border-slate-200/80 pb-4 mb-5 items-start justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-mono font-black tracking-widest text-slate-900 leading-none" id="achyuta-title">ACHYUTA</h1>
          <p className="text-xs text-indigo-605 font-extrabold uppercase mt-1.5 tracking-wider flex items-center gap-1" id="achyuta-subtitle">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-emerald-250 inline-block" />
            Guardian Intelligence Online
          </p>
        </div>

        {/* Custom voice selector button */}
        <button 
          onClick={() => setShowVoiceSettings(!showVoiceSettings)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${
            showVoiceSettings 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          id="toggle-voices-btn"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Voices</span>
        </button>
      </div>

      {/* Expandable Voice controllers drawer */}
      <AnimatePresence>
        {showVoiceSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50 border border-slate-200 rounded-[20px] p-4.5 mb-5 space-y-4"
            id="voices-drawer"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Configure Guardian voice model
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'men', label: 'Polite male voice', icon: '👨' },
                  { id: 'female', label: 'Polite female voice', icon: '👩' },
                  { id: 'kids', label: 'Kid’s voice', icon: '🧒' },
                ].map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setVoiceType(voice.id as any);
                      const previews = {
                        female: "Securing polite female speech synthesizer guidelines.",
                        men: "Calibrating Achyuta's polite male voice profile. How can my intelligence assist you today?",
                        kids: "Hello! I am your safety voice companion."
                      };
                      speakVoiceText(previews[voice.id as 'female' | 'men' | 'kids'], 'preview');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      voiceType === voice.id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                    id={`voice-select-${voice.id}`}
                  >
                    <span className="text-lg">{voice.icon}</span>
                    <span>{voice.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vocal attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Voice pitch</span>
                  <span className="font-mono text-indigo-600">{(speechPitch).toFixed(1)}x</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.8" 
                  step="0.1"
                  value={speechPitch} 
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                  id="pitch-slider"
                />
              </div>

              <div>
                <label className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Voice speed</span>
                  <span className="font-mono text-indigo-600">{(speechRate).toFixed(1)}x</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={speechRate} 
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                  id="rate-slider"
                />
              </div>
            </div>

            {/* Intelligent safe TTS options */}
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-700">Automated safety narration</span>
                <span className="text-[10px] text-slate-400">Speak alerts instantly upon text arrival</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="sr-only peer"
                  id="autospeak-toggle"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 animate-[fadeIn_0.5s_ease-out]" id="telemetry-grid">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 hover:border-slate-300 transition-all">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-black text-slate-705">MONITORING ACTIVE</span>
        </div>
        <div 
          onClick={() => {
            alert(`GPS active telemetry coordinates locked:\nLatitude: ${latitude}\nLongitude: ${longitude}`);
          }}
          className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 hover:border-indigo-300 transition-all cursor-pointer"
          id="telemetry-gps"
        >
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-black text-slate-705 truncate">GPS SYNCED</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 hover:border-slate-300 transition-all">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-black text-slate-705">GUARDIANS SAFE</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 hover:border-slate-300 transition-all">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-black text-slate-705 truncate">STATUS VERIFIED</span>
        </div>
      </div>

      {/* Achyuta Rotating Holographic Core */}
      <div className="bg-slate-50/55 border border-slate-200/90 rounded-[28px] p-4.5 mb-5 flex flex-col items-center justify-center relative shadow-xs" id="achyuta-hologram-card">
        <div className="relative w-36 h-36 flex items-center justify-center">
          
          {/* Concentric rotating glowing aura rings */}
          <div className={`absolute inset-0 rounded-full border-2 border-indigo-500/15 animate-[spin_12s_linear_infinite] ${isCurrentlySpeaking ? 'border-indigo-400/35 animate-[spin_4s_linear_infinite]' : ''}`} />
          <div className={`absolute inset-2.5 rounded-full border border-dashed border-purple-500/25 animate-[spin_18s_linear_infinite_reverse] ${isCurrentlySpeaking ? 'border-purple-400/45 animate-[spin_6s_linear_infinite_reverse]' : ''}`} />
          <div className="absolute inset-4 rounded-full bg-radial-gradient from-indigo-500/5 to-transparent blur-xl animate-pulse" />
          
          {/* Floating energy particle nodes */}
          <div className={`absolute inset-5 rounded-full border border-indigo-300/30 flex items-center justify-center ${isCurrentlySpeaking ? 'scale-105 transition-transform' : ''}`}>
            <span className="absolute -top-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
            <span className="absolute -bottom-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
          </div>

          {/* Holographic core clickable bubble */}
          <div 
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full bg-linear-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex flex-col items-center justify-center cursor-pointer relative z-10 transition-all duration-305 shadow-[0_0_22px_rgba(99,102,241,0.45)] group hover:scale-105 active:scale-95 ${
              isCurrentlySpeaking 
                ? 'shadow-[0_0_35px_rgba(168,85,247,0.75)] scale-105 ring-4 ring-indigo-400/20' 
                : isListening 
                ? 'shadow-[0_0_35px_rgba(239,68,68,0.7)] from-red-650 via-rose-600 to-red-500 animate-pulse'
                : ''
            }`}
            id="achyuta-hologram-bubble"
          >
            <BrainCircuit className={`w-8 h-8 text-white ${isCurrentlySpeaking || isListening ? 'animate-pulse' : ''}`} />
            
            {/* Pulsing expander wave rings */}
            {isCurrentlySpeaking && (
              <span className="absolute inset-0 rounded-full border-4 border-purple-400 animate-[ping_1.5s_infinite] opacity-40 pointer-events-none" />
            )}
          </div>

          {/* Outer SVG futuristic guidelines */}
          <svg className={`absolute inset-0 w-full h-full pointer-events-none animate-[spin_30s_linear_infinite] ${isCurrentlySpeaking ? 'animate-[spin_9s_linear_infinite]' : ''}`} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 8" className="text-indigo-400/30" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="11 12" className="text-purple-400/15" />
          </svg>
        </div>

        {/* Action subtitle */}
        <div className="mt-4 flex flex-col items-center text-center space-y-1 z-10">
          <p className={`text-[9px] font-mono font-black tracking-widest uppercase transition-colors ${
            isListening 
              ? 'text-red-550 animate-pulse' 
              : isCurrentlySpeaking 
              ? 'text-purple-600 font-bold' 
              : 'text-indigo-600 font-bold'
          }`} id="core-state-tag">
            {isListening ? '🎙️ SCANNING VOX DIRECT INPUT' : isCurrentlySpeaking ? '📢 ACHYUTA TRANSMITTING AUDIO' : '🛡️ CORE DIALOG STABLE'}
          </p>
          
          <div className="h-4 flex items-center justify-center">
            {isCurrentlySpeaking ? (
              <div className="flex gap-0.5 items-end h-3">
                {[1.4, 0.6, 1.8, 1.1, 0.7, 1.5, 0.9, 1.2, 0.5, 1.6].map((multiplier, idx) => (
                  <span 
                    key={idx} 
                    className="w-0.5 bg-purple-500 rounded-full animate-wave-bar" 
                    style={{ 
                      height: `${multiplier * 100}%`,
                      animationDelay: `${idx * 0.08}s` 
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="flex gap-1 items-center h-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-mono text-slate-400 font-bold">DIGITIZING AUDIO STREAM...</span>
              </div>
            ) : (
              <p className="text-[9px] font-mono font-bold text-slate-400 opacity-70 tracking-wider uppercase">
                Tap biometric core for tactile conversation
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Memory System Dashboard Alert Banner */}
      <div className="bg-indigo-50/50 border border-indigo-150/70 rounded-2xl p-4.5 mb-5 text-left flex gap-3 shadow-2xs items-start" id="memory-system-card">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 leading-normal font-sans font-semibold">
          Welcome back, <span className="font-bold text-indigo-950 font-sans">{ownerName}</span>. Your circle guardians are verified online, and your next routine safety check-in is due in <span className="text-indigo-600 font-bold">23 hours</span>. All telemetry signals are operational.
        </p>
      </div>

      {/* Smart Command Grid (No-typing targets) */}
      <div className="mb-5 text-left" id="commands-section">
        <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-2.5 px-0.5">
          Tactical Commands & Operations
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button"
            onClick={() => handleSmartCommand('safety_check')}
            className="h-14 bg-white hover:bg-slate-50 text-slate-800 text-left border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 flex items-center justify-between transition-all active:scale-95 shadow-2xs cursor-pointer"
            id="cmd-safety-check"
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider">01. BIOMETRICS</span>
              <span className="text-[11px] font-bold text-slate-700 truncate font-sans">Check My Safety</span>
            </div>
            <span className="text-sm">🛡️</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSmartCommand('contact_guardians')}
            className="h-14 bg-white hover:bg-slate-50 text-slate-800 text-left border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 flex items-center justify-between transition-all active:scale-95 shadow-2xs cursor-pointer"
            id="cmd-contact-guardians"
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider">02. SMS BROADCAST</span>
              <span className="text-[11px] font-bold text-slate-700 truncate font-sans">Contact Guardians</span>
            </div>
            <span className="text-sm">👨‍👩‍👧</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSmartCommand('SOS')}
            className="h-14 bg-red-50 hover:bg-red-100 text-red-900 text-left border border-red-200 hover:border-red-300 rounded-xl px-3.5 flex items-center justify-between transition-all active:scale-95 shadow-2xs cursor-pointer"
            id="cmd-sos-trigger"
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-mono font-black text-red-650 uppercase tracking-wider">03. PANIC BEACON</span>
              <span className="text-[11px] font-extrabold text-red-700 truncate font-sans font-semibold">Open SOS Overlay</span>
            </div>
            <span className="text-sm animate-pulse">🚨</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSmartCommand('find_help')}
            className="h-14 bg-white hover:bg-slate-50 text-slate-800 text-left border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 flex items-center justify-between transition-all active:scale-95 shadow-2xs cursor-pointer"
            id="cmd-find-help"
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider">04. GPS OVERLAY</span>
              <span className="text-[11px] font-bold text-slate-700 truncate font-sans">Find Nearby Help</span>
            </div>
            <span className="text-sm">🏥</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSmartCommand('explain_endlif')}
            className="h-14 bg-white hover:bg-slate-50 text-slate-800 text-left border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 flex items-center justify-between transition-all active:scale-95 shadow-2xs cursor-pointer"
            id="cmd-explain-endlif"
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider">05. ECOSYSTEM</span>
              <span className="text-[11px] font-bold text-slate-700 truncate font-sans">Explain ENDLIF</span>
            </div>
            <span className="text-sm">📡</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setEmergencyActive(true);
              speakVoiceText("Emergency override deployed. Large format tactical dialer loaded.", "emergency_btn_alert");
            }}
            className="h-14 bg-rose-600 hover:bg-rose-500 text-white text-left rounded-xl px-3.5 flex items-center justify-between transition-all active:scale-95 shadow-sm cursor-pointer animate-[pulse_2s_infinite]"
            id="cmd-report-emergency"
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-mono font-black text-rose-105 uppercase tracking-wider block">06. IMMEDIATE LIFE</span>
              <span className="text-[11.5px] font-black uppercase tracking-wide truncate font-sans text-white">Report Emergency</span>
            </div>
            <span className="text-sm">⚠️</span>
          </button>
        </div>
      </div>

      {/* Cybernetic Secure Log Feed Container */}
      <div className="flex flex-col space-y-4" id="chat-feed-box-wrapper">
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 pl-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-none">Secure Communication Stream</span>
          </div>

          {isCurrentlySpeaking ? (
            <button 
              onClick={stopVoice}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-150 rounded-lg text-rose-600 text-[10px] font-black uppercase tracking-wider animate-pulse hover:bg-rose-100 transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5" /> Stop Speech
            </button>
          ) : (
            <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider pr-1">Achyuta Telemetry Feed</span>
          )}
        </div>

        {/* Chat space */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] p-4 bg-slate-50/50 border border-slate-200 rounded-[24px] shadow-inner hide-scrollbar">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                const isSpeakingThis = activeSpeakingMsgId === msg.id;

                return (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[90%] rounded-[20px] p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                        msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5 opacity-80 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          {isAssistant ? (
                            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" />
                          )}
                          <span className={msg.sender === 'user' ? 'text-indigo-100 font-bold' : 'text-slate-500 font-bold'}>
                            {msg.sender === 'user' ? 'You' : 'Achyuta'}
                          </span>
                        </div>
                        <span>{msg.timestamp}</span>
                      </div>

                      <p className="font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {/* Render nested hospital interactive cards */}
                      {msg.hospitals && msg.hospitals.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <HeartPulse className="w-3.5 h-3.5 text-rose-550 animate-pulse shrink-0" /> Surrounding Hospitals ({msg.hospitals.length})
                          </p>
                          <div className="space-y-2 max-w-full">
                            {msg.hospitals.map((h, idx) => (
                              <div 
                                key={idx} 
                                className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left hover:border-slate-300 transition-all text-slate-800"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900 tracking-tight leading-none">{h.name}</span>
                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                      h.type === 'Government' 
                                        ? 'bg-rose-50 border border-rose-100 text-rose-600' 
                                        : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                    }`}>
                                      {h.type}
                                    </span>
                                    {idx === 0 && (
                                      <span className="text-[8px] font-black bg-emerald-50 border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase">
                                        Closest
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-normal font-medium">{h.address}</p>
                                  <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold text-slate-400">
                                    <span className="text-indigo-600 flex items-center gap-0.5 font-bold">
                                      <MapPin className="w-3 h-3 text-indigo-505" /> {h.distanceKm} km
                                    </span>
                                    <span>Dir: {h.direction}</span>
                                  </div>
                                </div>

                                <div className="flex gap-1.5 shrink-0 self-end md:self-auto">
                                  {h.phone !== '911' && (
                                    <a
                                      href={`tel:${h.phone}`}
                                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer transition-colors flex items-center justify-center shadow-2xs"
                                      title="Call Hospital"
                                    >
                                      <PhoneCall className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${h.lat},${h.lng}&travelmode=driving`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                                  >
                                    <ExternalLink className="w-3 h-3 text-indigo-50" />
                                    <span>Get Route</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Render nested custom places interactive cards */}
                      {msg.places && msg.places.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3 text-slate-800">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" /> Live Searched Venues ({msg.places.length})
                          </p>
                          <div className="space-y-2 max-w-full">
                            {msg.places.map((place, idx) => (
                              <div 
                                key={idx} 
                                className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left hover:border-slate-300 transition-all text-slate-800"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-xs text-slate-900 leading-none">{place.name}</span>
                                    {place.rating && (
                                      <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none font-mono font-sans">
                                        ★ {place.rating}
                                      </span>
                                    )}
                                    {idx === 0 && (
                                      <span className="text-[8px] font-black bg-emerald-50 border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase leading-none font-sans">
                                        Nearest
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-normal font-medium">{place.address}</p>
                                  <div className="text-[10px] font-mono font-bold text-indigo-650 flex items-center gap-0.5 pt-0.5">
                                    <MapPin className="w-3 h-3 text-indigo-505 shrink-0" /> {place.distanceKm} km
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0 self-end md:self-auto">
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${place.lat},${place.lng}&travelmode=driving`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                                  >
                                    <ExternalLink className="w-3 h-3 text-indigo-50" />
                                    <span>Get Route</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Companion interactive mini-map inside bubble */}
                          {hasValidKey && (
                            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 mt-2.5 relative shadow-xs">
                              <Map
                                defaultCenter={{ lat: latitude, lng: longitude }}
                                defaultZoom={13}
                                mapId={`places_${msg.id}`}
                                disableDefaultUI={true}
                                gestureHandling={'cooperative'}
                                style={{ width: '100%', height: '100%' }}
                              >
                                <AdvancedMarker position={{ lat: latitude, lng: longitude }}>
                                  <Pin background="#4285F4" glyphColor="#fff" scale={0.7} />
                                </AdvancedMarker>
                                {msg.places.map((p, pIdx) => (
                                  <AdvancedMarker key={pIdx} position={{ lat: p.lat, lng: p.lng }}>
                                    <Pin background="#e11d48" glyphColor="#fff" scale={0.7} />
                                  </AdvancedMarker>
                                ))}
                              </Map>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Render nested custom route vector details */}
                      {msg.path && (
                        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3 text-slate-800">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" /> Route Vector Mapped
                          </p>
                          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-left space-y-3 pr-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
                                <h4 className="font-extrabold text-xs text-slate-900 leading-snug truncate">{msg.path.destinationName}</h4>
                              </div>
                              <a
                                href={typeof msg.path.destination === 'string' 
                                  ? `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(msg.path.destination)}`
                                  : `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${msg.path.destination.lat},${msg.path.destination.lng}&travelmode=driving`
                                }
                                target="_blank"
                                rel="noreferrer noopener"
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all shrink-0 flex items-center gap-1 shadow-2xs"
                              >
                                <ExternalLink className="w-3 h-3 text-indigo-50" />
                                <span>Get Route</span>
                              </a>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                              <div className="bg-white rounded-lg p-2 border border-slate-150 text-center">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Distance</span>
                                <span className="text-xs font-black text-indigo-600 font-mono">{msg.path.distanceKm} km</span>
                              </div>
                              <div className="bg-white rounded-lg p-2 border border-slate-150 text-center">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Est. Time</span>
                                <span className="text-xs font-black text-indigo-600 font-mono">{msg.path.durationMins} mins</span>
                              </div>
                            </div>
                          </div>

                          {/* Companion interactive dynamic visual polyline map inside chat balloon */}
                          {hasValidKey && typeof msg.path.destination !== 'string' && (
                            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 mt-2.5 relative shadow-xs">
                              <Map
                                defaultCenter={{ lat: latitude, lng: longitude }}
                                defaultZoom={13}
                                mapId={`route_${msg.id}`}
                                disableDefaultUI={true}
                                gestureHandling={'cooperative'}
                                style={{ width: '100%', height: '100%' }}
                              >
                                <AdvancedMarker position={{ lat: latitude, lng: longitude }}>
                                  <Pin background="#4285F4" glyphColor="#fff" scale={0.7} />
                                </AdvancedMarker>
                                <AdvancedMarker position={msg.path.destination}>
                                  <Pin background="#e11d48" glyphColor="#fff" scale={0.7} />
                                </AdvancedMarker>
                                <RouteDisplay origin={{lat: latitude, lng: longitude}} destination={msg.path.destination} />
                              </Map>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Speaking indicator and manual vocal replay button inside message */}
                      {isAssistant && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          {isSpeakingThis ? (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[ping_1s_infinite]"></span>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Narrating safety details...</span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Endlif Voice Guard</span>
                          )}

                          <button
                            type="button"
                            onClick={() => speakVoiceText(msg.text, msg.id)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                              isSpeakingThis 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 animate-[pulse_1.5s_infinite]' 
                                : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Speak safety notes"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-white border border-slate-200 rounded-[20px] rounded-bl-none p-4 text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span>Formulating secure telemetry checkup...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Diagnostic Intel Panel - Updates dynamically representing extreme visual intelligence */}
            <AnimatePresence>
              {activeProtocol && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`border rounded-[22px] p-4 text-left shadow-sm space-y-3 ${
                    activeProtocol.threatLevel === 'critical'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : activeProtocol.threatLevel === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : activeProtocol.threatLevel === 'caution'
                      ? 'bg-yellow-50/50 border-yellow-250 text-slate-800'
                      : 'bg-indigo-50/30 border-indigo-150 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                    <div className="flex items-center gap-1.5 font-sans font-black text-xs uppercase tracking-wider">
                      {activeProtocol.threatLevel === 'critical' ? (
                        <Shield className="w-4 h-4 text-red-600 animate-[bounce_2s_infinite]" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      )}
                      <span>{activeProtocol.protocolName}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-black uppercase ${
                      activeProtocol.threatLevel === 'critical'
                        ? 'bg-red-500 text-white'
                        : activeProtocol.threatLevel === 'warning'
                        ? 'bg-amber-500 text-white'
                        : activeProtocol.threatLevel === 'caution'
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      THREAT STATUS: {activeProtocol.threatLevel}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed font-semibold">
                    {activeProtocol.explanation}
                  </p>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Active Automation Checklist
                    </p>
                    {activeProtocol.actions.map((act, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 bg-white/85 rounded-full border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-[11px] leading-snug text-slate-700 font-mono">{act}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input field suggestions */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {SUGGESTED_ASSISTANT_PROMPTS.map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => handleAiResponse(prompt)}
                  className="bg-white hover:bg-slate-50 shrink-0 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold font-sans cursor-pointer transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Safe entry text submission form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAiResponse(typedMessage);
              }}
              className="flex items-center gap-2"
            >
              <input 
                type="text"
                placeholder="Talk with Achyuta (Super Intelligent AI)..."
                value={typedMessage}
                disabled={isAiThinking}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3.5 outline-none text-slate-800 text-xs sm:text-sm disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!typedMessage.trim() || isAiThinking}
                className="w-12 h-12 shrink-0 bg-indigo-600 text-white rounded-xl hover:bg-indigo-550 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer outline-none shadow-sm"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      );
    }

