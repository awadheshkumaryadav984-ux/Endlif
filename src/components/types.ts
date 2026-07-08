export interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Offline' | 'Alert';
  avatar: string;
  online: boolean;
  phone?: string;
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

export interface AssistantMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  hospitals?: Hospital[];
  places?: MapPlace[];
  path?: MapPath;
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
