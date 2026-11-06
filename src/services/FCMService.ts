/**
 * ENDLIF FCMService
 * Primary Notification Channel: Firebase Cloud Messaging (FCM)
 * Sends high-priority push notifications to registered ENDLIF client devices.
 */

import { Contact, AlertDeliveryStatus } from '../types';
import { AlertAuditLogger } from './AlertAuditLogger';
import { maskPhoneNumber } from './phoneUtils';

export interface FCMPayload {
  title: string;
  body: string;
  data: {
    alertId: string;
    userName: string;
    thresholdDays: string;
    missedDays: string;
    lastCheckIn: string;
    location: string;
    type: 'EMERGENCY_SAFETY_ALERT';
    actionUrl: string;
  };
}

export interface FCMDispatchResult {
  contactId: string;
  status: AlertDeliveryStatus;
  detail: string;
  fcmMessageId?: string;
  isSimulation: boolean;
}

export class FCMService {
  /**
   * Dispatches high-priority FCM notification to an opted-in contact.
   */
  static async sendEmergencyAlert(
    contact: Contact,
    payload: FCMPayload,
    isSimulation = false
  ): Promise<FCMDispatchResult> {
    const maskedPhone = maskPhoneNumber(contact.phone);

    // Rule 4: Only dispatch to contacts who have the app installed & opted in
    if (!contact.hasAppInstalled || !contact.fcmToken) {
      return {
        contactId: contact.id,
        status: 'User Not Reachable',
        detail: 'Recipient does not have ENDLIF app installed or active device token.',
        isSimulation
      };
    }

    if (contact.optedIntoEmergency === false) {
      return {
        contactId: contact.id,
        status: 'User Not Reachable',
        detail: 'Recipient has disabled emergency push notifications in their preferences.',
        isSimulation
      };
    }

    try {
      const response = await fetch('/api/notifications/fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          token: contact.fcmToken,
          payload,
          isSimulation
        })
      });

      const resData = await response.json();

      if (resData.success && resData.status === 'FCM Delivered') {
        AlertAuditLogger.log({
          eventType: 'FCM_DELIVERED',
          severity: 'critical',
          actor: 'FCMService',
          channel: 'fcm',
          recipientMasked: `${contact.name} (${maskedPhone})`,
          status: 'Delivered',
          detail: `FCM message ${resData.messageId || 'ack'} acknowledged by FCM gateway.`,
          isSimulation: resData.isSimulation || isSimulation
        });

        return {
          contactId: contact.id,
          status: 'FCM Delivered',
          detail: resData.isSimulation
            ? 'Simulated FCM: Device token acknowledged in Development Sandbox.'
            : `FCM push delivered to device (Message ID: ${resData.messageId || 'OK'})`,
          fcmMessageId: resData.messageId,
          isSimulation: resData.isSimulation || isSimulation
        };
      }

      if (resData.success && resData.status === 'FCM Sent') {
        AlertAuditLogger.log({
          eventType: 'FCM_DISPATCH_ATTEMPT',
          severity: 'warning',
          actor: 'FCMService',
          channel: 'fcm',
          recipientMasked: `${contact.name} (${maskedPhone})`,
          status: 'Sent (Pending Delivery)',
          detail: 'Queued to Firebase Cloud Messaging server.',
          isSimulation: resData.isSimulation || isSimulation
        });

        return {
          contactId: contact.id,
          status: 'FCM Sent',
          detail: 'Queued at FCM gateway; awaiting device receipt acknowledgement.',
          fcmMessageId: resData.messageId,
          isSimulation: resData.isSimulation || isSimulation
        };
      }

      // Unsuccessful or unreachable
      return {
        contactId: contact.id,
        status: resData.status === 'User Not Reachable' ? 'User Not Reachable' : 'Delivery Failed',
        detail: resData.message || 'FCM gateway rejected the token or upstream connection failed.',
        isSimulation: resData.isSimulation || isSimulation
      };
    } catch (err: any) {
      console.error('[FCMService] Dispatch failed:', err);
      return {
        contactId: contact.id,
        status: 'Delivery Failed',
        detail: `Network/Server error: ${err.message || 'connection failed'}`,
        isSimulation
      };
    }
  }

  /**
   * Convenience method to dispatch a notification payload to a token.
   */
  static async sendNotification(options: {
    token: string;
    title: string;
    body: string;
    data?: any;
    isSimulation?: boolean;
  }): Promise<{ success: boolean; isSimulation: boolean; error?: string }> {
    try {
      const response = await fetch('/api/notifications/fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: options.token,
          payload: {
            title: options.title,
            body: options.body,
            data: options.data || {}
          },
          isSimulation: options.isSimulation ?? true
        })
      });
      const resData = await response.json();
      return {
        success: Boolean(resData.success),
        isSimulation: Boolean(resData.isSimulation ?? true),
        error: resData.message
      };
    } catch (err: any) {
      return {
        success: false,
        isSimulation: true,
        error: err.message || 'FCM connection failed'
      };
    }
  }
}
