/**
 * ENDLIF EmergencyAlertManager
 * Creates, evaluates, dispatches, and tracks Emergency Safety Alerts.
 * Syncs multi-channel outcomes with the backend scheduled evaluation daemon.
 */

import { EmergencySafetyAlert, RecipientDeliveryRecord, Contact } from '../types';
import { DailyCheckInManager } from './DailyCheckInManager';
import { SafetyCircleManager } from './SafetyCircleManager';
import { LocationService } from './LocationService';
import { NotificationManager } from './NotificationManager';
import { AlertAuditLogger } from './AlertAuditLogger';
import { SecureStorage } from '../utils/security';

const ACTIVE_ALERT_KEY = 'endlif_current_emergency_alert';

class EmergencyAlertManagerClass {
  private currentAlert: EmergencySafetyAlert | null = null;
  private isBroadcasting = false;

  constructor() {
    this.loadActiveAlert();
  }

  private loadActiveAlert() {
    const raw = SecureStorage.getItem(ACTIVE_ALERT_KEY);
    if (raw) {
      try {
        this.currentAlert = JSON.parse(raw);
      } catch {
        this.currentAlert = null;
      }
    }
  }

  private persistActiveAlert() {
    if (this.currentAlert) {
      SecureStorage.setItem(ACTIVE_ALERT_KEY, JSON.stringify(this.currentAlert));
    } else {
      SecureStorage.removeItem(ACTIVE_ALERT_KEY);
    }
  }

  getCurrentAlert(): EmergencySafetyAlert | null {
    return this.currentAlert;
  }

  isDispatching(): boolean {
    return this.isBroadcasting;
  }

  /**
   * Evaluates check-in state and dispatches Emergency Safety Alert if threshold is exceeded.
   */
  async evaluateAndTriggerAlert(options?: {
    forceRebroadcast?: boolean;
    customContacts?: Contact[];
    profileName?: string;
  }): Promise<{ alert: EmergencySafetyAlert | null; triggered: boolean }> {
    const checkInState = DailyCheckInManager.getState();

    // If threshold not exceeded, resolve any active alert
    if (!checkInState.isThresholdExceeded) {
      if (this.currentAlert && this.currentAlert.status === 'active') {
        this.currentAlert.status = 'resolved';
        this.persistActiveAlert();
        this.notifyAlertUpdate();
      }
      return { alert: null, triggered: false };
    }

    // Prevent duplicate broadcasts unless explicitly requested
    if (this.isBroadcasting) {
      return { alert: this.currentAlert, triggered: false };
    }

    if (this.currentAlert && this.currentAlert.status === 'active' && !options?.forceRebroadcast) {
      return { alert: this.currentAlert, triggered: false };
    }

    this.isBroadcasting = true;

    try {
      const contacts = options?.customContacts || SafetyCircleManager.getContacts();
      const eligibleGuardians = SafetyCircleManager.getEligibleEmergencyRecipients(contacts);
      const userName = options?.profileName || 'Adele Vance';

      // 1. Resolve Location
      const locationSnapshot = await LocationService.updateCurrentLocation();
      const lastCheckInFormatted = new Date(checkInState.lastCheckInTimestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // 2. Generate canonical alert message according to Section 8 requirement
      const { message, isLocationAvailable } = LocationService.generateSafetyAlertMessage({
        userName,
        thresholdDays: checkInState.thresholdDays,
        lastCheckInFormatted,
        locationSnapshot
      });

      const alertId = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const alertCreationTime = new Date().toISOString();

      // Initialize recipient records as "Alert Created"
      const initialRecipients: RecipientDeliveryRecord[] = eligibleGuardians.map(c => ({
        contactId: c.id,
        contactName: c.name,
        contactPhone: c.phone,
        contactEmail: c.email,
        hasAppInstalled: Boolean(c.hasAppInstalled && c.fcmToken),
        channel: c.hasAppInstalled ? 'fcm' : (c.phone ? 'sms' : 'email'),
        status: 'Alert Created',
        timestamp: alertCreationTime,
        detail: 'Emergency alert record created. Preparing automated dispatch queue.',
        isSimulation: checkInState.isSimulation
      }));

      const newAlert: EmergencySafetyAlert = {
        id: alertId,
        userId: 'user_main',
        userName,
        thresholdDays: checkInState.thresholdDays,
        missedDays: checkInState.missedDays,
        lastCheckInTimestamp: checkInState.lastCheckInTimestamp,
        alertCreationTime,
        location: LocationService.formatLocationText(locationSnapshot).text,
        isLocationAvailable,
        message,
        status: 'active',
        isSimulation: checkInState.isSimulation,
        recipients: initialRecipients
      };

      this.currentAlert = newAlert;
      this.persistActiveAlert();
      this.notifyAlertUpdate();

      AlertAuditLogger.log({
        eventType: 'ALERT_CREATED',
        severity: 'critical',
        actor: 'EmergencyAlertManager',
        channel: 'system',
        status: checkInState.isSimulation ? 'DEVELOPMENT SIMULATION' : 'Alert Created',
        detail: `Safety Alert initialized for ${userName} (${checkInState.missedDays} days missed). Queueing ${eligibleGuardians.length} guardians.`,
        isSimulation: checkInState.isSimulation
      });

      // 3. Dispatch across Primary (FCM) and Fallbacks (SMS/Email)
      const updatedRecipients: RecipientDeliveryRecord[] = [];

      for (const guardian of eligibleGuardians) {
        const deliveryOutcome = await NotificationManager.dispatchToRecipient({
          contact: guardian,
          alertId,
          userName,
          thresholdDays: checkInState.thresholdDays,
          missedDays: checkInState.missedDays,
          lastCheckInFormatted,
          locationText: newAlert.location,
          messageText: message,
          isSimulation: checkInState.isSimulation
        });
        updatedRecipients.push(deliveryOutcome);
      }

      newAlert.recipients = updatedRecipients;
      this.currentAlert = newAlert;
      this.persistActiveAlert();
      this.notifyAlertUpdate();

      // Sync alert dispatch with backend
      await this.syncAlertWithBackend(newAlert);

      return { alert: newAlert, triggered: true };
    } finally {
      this.isBroadcasting = false;
      this.notifyAlertUpdate();
    }
  }

  /**
   * Resets active alert (e.g. after user checks in or manually verifies).
   */
  resolveAlert() {
    if (this.currentAlert) {
      this.currentAlert.status = 'resolved';
      this.persistActiveAlert();
      this.notifyAlertUpdate();
    }
  }

  private notifyAlertUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('endlif_alert_updated', { detail: this.currentAlert }));
    }
  }

  private async syncAlertWithBackend(alert: EmergencySafetyAlert) {
    try {
      await fetch('/api/alerts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch {
      // Offline tolerance
    }
  }
}

export const EmergencyAlertManager = new EmergencyAlertManagerClass();
