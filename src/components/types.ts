export interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Offline' | 'Alert';
  avatar: string;
  online: boolean;
  phone?: string;
  email?: string;
  fcmToken?: string;
  hasAppInstalled?: boolean;
  optedIntoEmergency?: boolean;
  consentGiven?: boolean;
  consentTimestamp?: string;
  preferredChannel?: 'fcm' | 'sms' | 'email' | 'call';
}

export type AlertDeliveryStatus =
  | 'Alert Created'
  | 'FCM Sent'
  | 'FCM Delivered'
  | 'SMS Attempted'
  | 'Email Sent'
  | 'Delivery Failed'
  | 'User Not Reachable';

export interface RecipientDeliveryRecord {
  contactId: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  hasAppInstalled: boolean;
  channel: 'fcm' | 'sms' | 'email' | 'call';
  status: AlertDeliveryStatus;
  timestamp: string;
  detail: string;
  isSimulation: boolean;
}

export interface EmergencySafetyAlert {
  id: string;
  userId: string;
  userName: string;
  thresholdDays: 2 | 3 | 7;
  missedDays: number;
  lastCheckInTimestamp: string;
  alertCreationTime: string;
  location: string;
  isLocationAvailable: boolean;
  message: string;
  status: 'active' | 'resolved' | 'acknowledged';
  isSimulation: boolean;
  recipients: RecipientDeliveryRecord[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'ALERT_CREATED'
    | 'FCM_DISPATCH_ATTEMPT'
    | 'FCM_DELIVERED'
    | 'SMS_INTENT_TRIGGERED'
    | 'EMAIL_DISPATCHED'
    | 'PHONE_CALL_INITIATED'
    | 'CHECK_IN_RECORDED'
    | 'SIMULATION_EXECUTED'
    | 'THRESHOLD_CHANGED'
    | 'SAFETY_CIRCLE_UPDATED';
  severity: 'info' | 'warning' | 'critical';
  actor: string;
  channel?: 'fcm' | 'sms' | 'email' | 'call' | 'system';
  recipientMasked?: string;
  status: string;
  detail: string;
  isSimulation: boolean;
}

export type Screen = 'home' | 'circle' | 'resources' | 'assistant' | 'sos' | 'account' | 'creator_hub';

export interface EmergencyService {
  id: string;
  name: string;
  dialCode: string;
  category: string;
  iconName: string;
  colorClass: string;
}

export interface Hospital {
  name: string;
  type: 'Government' | 'Private' | 'Emergency' | 'General';
  distanceKm: number;
  direction: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface EndlifActionChip {
  id: string;
  label: string;
  type: 'timer' | 'sos' | 'call' | 'navigate' | 'search' | 'covert' | 'info';
  minutes?: number;
  phone?: string;
  screen?: Screen | string;
  query?: string;
  description?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AssistantMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  safetyLevel?: 'normal' | 'caution' | 'warning' | 'critical';
  tacticalSummary?: string;
  actions?: EndlifActionChip[];
  hospitals?: Hospital[];
  places?: MapPlace[];
  path?: MapPath;
  source?: 'gemini' | 'resilient_fallback' | 'local_guardian_engine' | 'fallback';
  model?: string;
  groundingSources?: GroundingSource[];
  groundingQueries?: string[];
  isSearchGrounded?: boolean;
}

export interface MapPlace {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  distanceKm?: number;
}

export interface MapPath {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number } | string;
  destinationName: string;
  distanceKm?: number;
  durationMins?: number;
}
