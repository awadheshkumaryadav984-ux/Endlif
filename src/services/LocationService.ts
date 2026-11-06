/**
 * ENDLIF LocationService
 * Tracks, caches, and securely formats GPS coordinates for emergency alerts.
 * Implements strict offline/unavailable location messaging requirements.
 */

import { SecureStorage } from '../utils/security';

export interface LocationSnapshot {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  timestamp: string;
  addressLabel?: string;
  mapsUrl: string;
}

const LOCATION_CACHE_KEY = 'endlif_last_known_location_snapshot';

class LocationServiceClass {
  private lastSnapshot: LocationSnapshot | null = null;

  constructor() {
    this.loadCachedLocation();
  }

  private loadCachedLocation() {
    const cached = SecureStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      try {
        this.lastSnapshot = JSON.parse(cached);
      } catch {
        this.lastSnapshot = null;
      }
    }
  }

  /**
   * Refreshes device GPS position if browser permissions and hardware permit.
   */
  async updateCurrentLocation(): Promise<LocationSnapshot | null> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return this.lastSnapshot;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const mapsUrl = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
          
          const snapshot: LocationSnapshot = {
            lat: latitude,
            lng: longitude,
            accuracyMeters: Math.round(accuracy || 0),
            timestamp: new Date().toISOString(),
            addressLabel: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (±${Math.round(accuracy || 10)}m)`,
            mapsUrl
          };

          this.lastSnapshot = snapshot;
          SecureStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(snapshot));
          resolve(snapshot);
        },
        (error) => {
          console.warn('[LocationService] Geolocation unavailable or denied:', error.message);
          resolve(this.lastSnapshot);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Retrieves the last known location snapshot if recorded within a valid timeframe.
   */
  getLastKnownLocation(): LocationSnapshot | null {
    if (!this.lastSnapshot) {
      this.loadCachedLocation();
    }
    return this.lastSnapshot;
  }

  /**
   * Formats location string according to strict safety specification.
   */
  formatLocationText(snapshot?: LocationSnapshot | null): { text: string; isAvailable: boolean; mapsUrl?: string } {
    const loc = snapshot || this.getLastKnownLocation();
    if (!loc || !loc.lat || !loc.lng) {
      return {
        text: 'Last known location unavailable.',
        isAvailable: false
      };
    }

    const timeAgo = this.formatTimeAgo(loc.timestamp);
    const mapsLink = `https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
    const locationStr = `${loc.addressLabel || `${loc.lat.toFixed(4)}°, ${loc.lng.toFixed(4)}°`} (${timeAgo}) - ${mapsLink}`;

    return {
      text: locationStr,
      isAvailable: true,
      mapsUrl: mapsLink
    };
  }

  /**
   * Generates the canonical ENDLIF Safety Alert message according to Section 8 of requirements:
   * "ENDLIF Safety Alert:
   * No safety check-in has been received from [USER NAME] for [X] days.
   * Last check-in: [DATE/TIME].
   * Please contact them immediately.
   * Location: [LAST KNOWN LOCATION]"
   */
  generateSafetyAlertMessage(params: {
    userName: string;
    thresholdDays: number;
    lastCheckInFormatted: string;
    locationSnapshot?: LocationSnapshot | null;
  }): { message: string; isLocationAvailable: boolean } {
    const locResult = this.formatLocationText(params.locationSnapshot);

    const message = [
      'ENDLIF Safety Alert:',
      `No safety check-in has been received from ${params.userName || 'User'} for ${params.thresholdDays} days.`,
      `Last check-in: ${params.lastCheckInFormatted}.`,
      'Please contact them immediately.',
      `Location: ${locResult.text}`
    ].join('\n');

    return {
      message,
      isLocationAvailable: locResult.isAvailable
    };
  }

  private formatTimeAgo(isoDateStr: string): string {
    const diffMs = Date.now() - new Date(isoDateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }
}

export const LocationService = new LocationServiceClass();
