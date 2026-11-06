/**
 * ENDLIF EmailFallbackService
 * Universal Fallback Channel: Direct and Gateway Email.
 * Sends structured emergency notifications when mobile push/SMS channels fail or for contacts without app.
 */

import { Contact, AlertDeliveryStatus } from '../types';
import { AlertAuditLogger } from './AlertAuditLogger';

export interface EmailDispatchResult {
  contactId: string;
  status: AlertDeliveryStatus;
  detail: string;
  isSimulation: boolean;
}

export class EmailFallbackService {
  /**
   * Dispatches emergency alert email via backend gateway (SMTP/Postmark/SendGrid/SES).
   */
  static async sendEmergencyEmail(params: {
    contact: Contact;
    userName: string;
    thresholdDays: number;
    lastCheckInFormatted: string;
    locationText: string;
    isSimulation?: boolean;
  }): Promise<EmailDispatchResult> {
    const { contact, userName, thresholdDays, lastCheckInFormatted, locationText, isSimulation = false } = params;

    if (!contact.email) {
      return {
        contactId: contact.id,
        status: 'User Not Reachable',
        detail: 'No email address registered for this guardian contact.',
        isSimulation
      };
    }

    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.email,
          contactName: contact.name,
          userName,
          thresholdDays,
          lastCheckIn: lastCheckInFormatted,
          location: locationText,
          isSimulation
        })
      });

      const resData = await response.json();

      if (resData.success) {
        AlertAuditLogger.log({
          eventType: 'EMAIL_DISPATCHED',
          severity: 'warning',
          actor: 'EmailFallbackService',
          channel: 'email',
          recipientMasked: `${contact.name} (${this.maskEmail(contact.email)})`,
          status: 'Email Sent',
          detail: resData.detail || 'Email accepted by outbound mail server.',
          isSimulation: resData.isSimulation || isSimulation
        });

        return {
          contactId: contact.id,
          status: 'Email Sent',
          detail: resData.detail || `Email alert transmitted to ${this.maskEmail(contact.email)}.`,
          isSimulation: resData.isSimulation || isSimulation
        };
      }

      return {
        contactId: contact.id,
        status: 'Delivery Failed',
        detail: resData.message || 'Outbound mail server rejected the message.',
        isSimulation: resData.isSimulation || isSimulation
      };
    } catch (err: any) {
      return {
        contactId: contact.id,
        status: 'Delivery Failed',
        detail: `Email gateway failure: ${err.message || 'offline'}`,
        isSimulation
      };
    }
  }

  /**
   * Generates a direct mailto URI for instant manual client-side backup.
   */
  static generateMailtoUri(params: {
    toEmail: string;
    userName: string;
    thresholdDays: number;
    lastCheckInFormatted: string;
    locationText: string;
  }): string {
    const subject = encodeURIComponent(`🚨 URGENT: ENDLIF Safety Alert for ${params.userName}`);
    const body = encodeURIComponent(
      `ENDLIF Safety Alert:\n\n` +
      `No safety check-in has been received from ${params.userName} for ${params.thresholdDays} days.\n` +
      `Last check-in: ${params.lastCheckInFormatted}\n\n` +
      `Please contact them immediately.\n` +
      `Location: ${params.locationText}\n\n` +
      `Sent via ENDLIF Personal Safety Ecosystem.`
    );
    return `mailto:${params.toEmail}?subject=${subject}&body=${body}`;
  }

  /**
   * Dispatches a direct or simulated email alert to a contact.
   */
  static async sendEmail(
    contact: Contact,
    subject: string,
    body: string,
    isSimulation = true
  ): Promise<{ success: boolean; isSimulation: boolean; error?: string }> {
    if (!contact.email) {
      return { success: false, isSimulation, error: 'No email address specified' };
    }
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.email,
          contactName: contact.name,
          subject,
          body,
          isSimulation
        })
      });
      const resData = await response.json();
      return {
        success: Boolean(resData.success),
        isSimulation: Boolean(resData.isSimulation ?? isSimulation),
        error: resData.message
      };
    } catch (err: any) {
      return {
        success: false,
        isSimulation: true,
        error: err.message || 'Email connection failed'
      };
    }
  }

  private static maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!domain) return '••••@••••';
    const visibleChars = Math.min(2, name.length);
    return `${name.slice(0, visibleChars)}•••@${domain}`;
  }
}
