/**
 * ENDLIF NotificationManager
 * Orchestrates Primary (FCM) and Secondary Fallbacks (SMS, Email, Phone Call).
 * Tracks delivery progression across recipients with strict status definitions.
 */

import { Contact, AlertDeliveryStatus, RecipientDeliveryRecord } from '../types';
import { FCMService, FCMPayload } from './FCMService';
import { SMSFallbackService } from './SMSFallbackService';
import { EmailFallbackService } from './EmailFallbackService';
import { maskPhoneNumber, normalizeToE164 } from './phoneUtils';

export interface MultiChannelDispatchPlan {
  contact: Contact;
  primaryChannel: 'fcm';
  fallbackChannels: Array<'sms' | 'email' | 'call'>;
}

export class NotificationManager {
  /**
   * Plans the dispatch routing for each Safety Circle member based on their capabilities.
   */
  static planRouting(contact: Contact): MultiChannelDispatchPlan {
    const fallbackChannels: Array<'sms' | 'email' | 'call'> = [];
    if (contact.phone) fallbackChannels.push('sms', 'call');
    if (contact.email) fallbackChannels.push('email');

    return {
      contact,
      primaryChannel: 'fcm',
      fallbackChannels
    };
  }

  /**
   * Dispatches emergency notification across primary and fallback channels.
   * If FCM succeeds with 'FCM Delivered', fallbacks are placed on standby.
   * If member does not have app or FCM is unconfirmed, fallbacks are activated.
   */
  static async dispatchToRecipient(params: {
    contact: Contact;
    alertId: string;
    userName: string;
    thresholdDays: number;
    missedDays: number;
    lastCheckInFormatted: string;
    locationText: string;
    messageText: string;
    isSimulation?: boolean;
  }): Promise<RecipientDeliveryRecord> {
    const {
      contact,
      alertId,
      userName,
      thresholdDays,
      missedDays,
      lastCheckInFormatted,
      locationText,
      messageText,
      isSimulation = false
    } = params;

    const baseRecord: Omit<RecipientDeliveryRecord, 'channel' | 'status' | 'detail'> = {
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      hasAppInstalled: Boolean(contact.hasAppInstalled && contact.fcmToken),
      timestamp: new Date().toISOString(),
      isSimulation
    };

    // 1. PRIMARY CHANNEL: FCM (Only if contact has app installed and token)
    if (contact.hasAppInstalled && contact.fcmToken && contact.optedIntoEmergency !== false) {
      const fcmPayload: FCMPayload = {
        title: '🚨 ENDLIF Emergency Safety Alert',
        body: `No safety check-in from ${userName} for ${thresholdDays} days. Please verify immediately.`,
        data: {
          alertId,
          userName,
          thresholdDays: String(thresholdDays),
          missedDays: String(missedDays),
          lastCheckIn: lastCheckInFormatted,
          location: locationText,
          type: 'EMERGENCY_SAFETY_ALERT',
          actionUrl: `https://endlif.app/alert/${alertId}`
        }
      };

      const fcmResult = await FCMService.sendEmergencyAlert(contact, fcmPayload, isSimulation);

      if (fcmResult.status === 'FCM Delivered' || fcmResult.status === 'FCM Sent') {
        return {
          ...baseRecord,
          channel: 'fcm',
          status: fcmResult.status,
          detail: fcmResult.detail
        };
      }
      // If FCM failed or unreachable, proceed to fallbacks below!
    }

    // 2. SECONDARY FALLBACK A: Gateway SMS / Device SMS
    if (contact.phone) {
      const smsResult = await SMSFallbackService.sendGatewaySms(contact, messageText, isSimulation);
      if (smsResult.status === 'SMS Attempted') {
        return {
          ...baseRecord,
          channel: 'sms',
          status: 'SMS Attempted',
          detail: smsResult.detail
        };
      }
    }

    // 3. SECONDARY FALLBACK B: Email Notification
    if (contact.email) {
      const emailResult = await EmailFallbackService.sendEmergencyEmail({
        contact,
        userName,
        thresholdDays,
        lastCheckInFormatted,
        locationText,
        isSimulation
      });

      if (emailResult.status === 'Email Sent') {
        return {
          ...baseRecord,
          channel: 'email',
          status: 'Email Sent',
          detail: emailResult.detail
        };
      }
    }

    // 4. If all automated attempts failed or no channels configured
    return {
      ...baseRecord,
      channel: contact.phone ? 'sms' : (contact.email ? 'email' : 'fcm'),
      status: contact.phone || contact.email ? 'Delivery Failed' : 'User Not Reachable',
      detail: isSimulation
        ? 'Simulation: Recipient has no active FCM token, valid phone, or email configured.'
        : 'All automated dispatch channels exhausted without confirmation.',
    };
  }

  /**
   * Generates direct emergency phone dialer intent for a guardian.
   */
  static initiateEmergencyCall(phoneOrContact: string | Contact): { success: boolean; dialUrl: string } {
    const rawPhone = typeof phoneOrContact === 'string' ? phoneOrContact : (phoneOrContact?.phone || '');
    const e164 = normalizeToE164(rawPhone);
    const dialUrl = e164 ? `tel:${e164}` : `tel:112`;
    if (typeof window !== 'undefined') {
      try {
        window.location.href = dialUrl;
        return { success: true, dialUrl };
      } catch (err) {
        console.warn('[NotificationManager] Dial intent failed:', err);
      }
    }
    return { success: false, dialUrl };
  }
}
