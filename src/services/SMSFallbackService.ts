/**
 * ENDLIF SMSFallbackService
 * Secondary Fallback Channel: Device-based and Gateway-backed SMS.
 * Prepares compliant SMS text and invokes native Android/iOS SMS intents or isolated server gateway.
 */

import { Contact, AlertDeliveryStatus } from '../types';
import { AlertAuditLogger } from './AlertAuditLogger';
import { normalizeToE164, maskPhoneNumber } from './phoneUtils';

export interface SMSDispatchResult {
  contactId: string;
  status: AlertDeliveryStatus;
  detail: string;
  smsUrl?: string;
  isSimulation: boolean;
}

export class SMSFallbackService {
  /**
   * Constructs native OS SMS URI for Android/iOS with body payload.
   * e.g., "sms:+919876543210?body=..."
   */
  static buildSmsUri(phone: string, message: string): string {
    const e164 = normalizeToE164(phone);
    const encodedBody = encodeURIComponent(message);
    // On some older Androids, separator is '?body=', on iOS sometimes '&body='. Standard modern RFC 5724 is '?body='
    return e164 ? `sms:${e164}?body=${encodedBody}` : `sms:?body=${encodedBody}`;
  }

  /**
   * Initiates device-based SMS by opening the operating system's SMS composer.
   * Marked strictly as "SMS Attempted" because the app cannot verify carrier delivery without Telephony permissions.
   */
  static triggerDeviceSms(contact: Contact, message: string, isSimulation = false): SMSDispatchResult {
    const phone = contact.phone || '';
    const e164 = normalizeToE164(phone);
    const smsUri = this.buildSmsUri(e164, message);

    if (typeof window !== 'undefined') {
      try {
        window.location.href = smsUri;
      } catch (err) {
        console.warn('[SMSFallbackService] Failed to launch SMS URI intent:', err);
      }
    }

    AlertAuditLogger.log({
      eventType: 'SMS_INTENT_TRIGGERED',
      severity: 'warning',
      actor: 'SMSFallbackService',
      channel: 'sms',
      recipientMasked: `${contact.name} (${maskPhoneNumber(e164)})`,
      status: 'SMS Attempted',
      detail: isSimulation
        ? 'SIMULATION: Generated SMS intent URI for testing.'
        : `Launched device messaging app targeting ${e164}. Waiting for user send confirmation.`,
      isSimulation
    });

    return {
      contactId: contact.id,
      status: 'SMS Attempted',
      detail: isSimulation
        ? 'Simulation: Device SMS composer triggered.'
        : 'Device SMS intent opened. Delivery depends on cellular carrier transmission.',
      smsUrl: smsUri,
      isSimulation
    };
  }

  /**
   * Dispatches SMS via backend isolated provider (e.g. AWS SNS, Sinch, Plivo, MessageBird).
   */
  static async sendGatewaySms(contact: Contact, message: string, isSimulation = false): Promise<SMSDispatchResult> {
    const phone = contact.phone || '';
    const e164 = normalizeToE164(phone);

    if (!e164) {
      return {
        contactId: contact.id,
        status: 'Delivery Failed',
        detail: 'No valid phone number provided for contact.',
        isSimulation
      };
    }

    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          phone: e164,
          message,
          isSimulation
        })
      });

      const resData = await response.json();

      if (resData.success) {
        AlertAuditLogger.log({
          eventType: 'SMS_INTENT_TRIGGERED',
          severity: 'warning',
          actor: 'SMSFallbackService',
          channel: 'sms',
          recipientMasked: `${contact.name} (${maskPhoneNumber(e164)})`,
          status: 'SMS Attempted',
          detail: resData.detail || 'SMS dispatched through upstream gateway.',
          isSimulation: resData.isSimulation || isSimulation
        });

        return {
          contactId: contact.id,
          status: 'SMS Attempted',
          detail: resData.detail || 'SMS submitted to cellular gateway queue.',
          isSimulation: resData.isSimulation || isSimulation
        };
      }

      return {
        contactId: contact.id,
        status: 'Delivery Failed',
        detail: resData.message || 'SMS Gateway rejected the request.',
        isSimulation: resData.isSimulation || isSimulation
      };
    } catch (err: any) {
      return {
        contactId: contact.id,
        status: 'Delivery Failed',
        detail: `Gateway connection failed: ${err.message || 'unknown error'}`,
        isSimulation
      };
    }
  }
}
