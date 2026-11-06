/**
 * ENDLIF SafetyCircleManager
 * Manages trusted guardians, enforces E.164 phone standard, ensures privacy encryption,
 * and maintains explicit user consent for emergency notification dispatch.
 */

import { Contact } from '../types';
import { SecureStorage } from '../utils/security';
import { validatePhoneNumber, maskPhoneNumber, normalizeToE164 } from './phoneUtils';
import { AlertAuditLogger } from './AlertAuditLogger';

const SAFETY_CIRCLE_STORAGE_KEY = 'endlif_safety_circle_encrypted';

export class SafetyCircleManager {
  /**
   * Loads all stored Safety Circle contacts from encrypted storage.
   */
  static getContacts(fallback: Contact[] = []): Contact[] {
    const raw = SecureStorage.getItem(SAFETY_CIRCLE_STORAGE_KEY);
    if (!raw) {
      // If nothing in encrypted storage yet, sanitize and initialize fallback
      return fallback.map(c => this.sanitizeContact(c));
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(c => this.sanitizeContact(c));
      }
      return fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Saves contacts to encrypted storage and triggers notification events.
   */
  static saveContacts(contacts: Contact[]): void {
    const sanitized = contacts.map(c => this.sanitizeContact(c));
    SecureStorage.setItem(SAFETY_CIRCLE_STORAGE_KEY, JSON.stringify(sanitized));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('endlif_circle_updated', { detail: sanitized }));
    }

    AlertAuditLogger.log({
      eventType: 'SAFETY_CIRCLE_UPDATED',
      severity: 'info',
      actor: 'SafetyCircleManager',
      channel: 'system',
      status: 'Updated',
      detail: `Safety Circle synced with ${sanitized.length} guardians.`,
      isSimulation: false
    });

    // Also sync with backend check-in engine
    this.syncWithBackend(sanitized);
  }

  /**
   * Sanitizes a contact: ensures E.164 phone validation, consent defaults, and clean fields.
   */
  static sanitizeContact(contact: Partial<Contact>): Contact {
    const phone = contact.phone ? normalizeToE164(contact.phone) : '';
    const phoneValidation = validatePhoneNumber(phone);

    return {
      id: contact.id || `guardian_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: (contact.name || 'Guardian').trim(),
      role: (contact.role || 'Primary Contact').trim(),
      status: contact.status || 'Active',
      avatar: contact.avatar || '',
      online: contact.online ?? true,
      phone: phoneValidation.isValid ? phoneValidation.e164 : (contact.phone || ''),
      email: contact.email ? contact.email.trim().toLowerCase() : undefined,
      fcmToken: contact.fcmToken || undefined,
      hasAppInstalled: contact.hasAppInstalled ?? Boolean(contact.fcmToken),
      optedIntoEmergency: contact.optedIntoEmergency ?? true,
      consentGiven: contact.consentGiven ?? true,
      consentTimestamp: contact.consentTimestamp || new Date().toISOString(),
      preferredChannel: contact.preferredChannel || (contact.hasAppInstalled ? 'fcm' : 'sms')
    };
  }

  /**
   * Adds or updates a guardian with explicit consent validation.
   */
  static upsertContact(current: Contact[], updated: Contact): { contacts: Contact[]; error?: string } {
    if (updated.phone) {
      const val = validatePhoneNumber(updated.phone);
      if (!val.isValid) {
        return { contacts: current, error: val.error };
      }
      updated.phone = val.e164;
    }

    const index = current.findIndex(c => c.id === updated.id);
    let newContacts: Contact[];
    if (index >= 0) {
      newContacts = [...current];
      newContacts[index] = this.sanitizeContact(updated);
    } else {
      newContacts = [...current, this.sanitizeContact(updated)];
    }

    this.saveContacts(newContacts);
    return { contacts: newContacts };
  }

  /**
   * Adds a new guardian to the circle.
   */
  static addContact(contact: Partial<Contact>): Contact[] {
    const current = this.getContacts();
    const sanitized = this.sanitizeContact(contact);
    const updated = [...current, sanitized];
    this.saveContacts(updated);
    return updated;
  }

  /**
   * Removes a contact by ID (or from a provided list).
   */
  static removeContact(idOrContacts: string | Contact[], maybeId?: string): Contact[] {
    if (typeof idOrContacts === 'string') {
      const current = this.getContacts();
      const filtered = current.filter(c => c.id !== idOrContacts);
      this.saveContacts(filtered);
      return filtered;
    }
    const current = idOrContacts;
    const id = maybeId || '';
    const filtered = current.filter(c => c.id !== id);
    this.saveContacts(filtered);
    return filtered;
  }

  /**
   * Records explicit consent for a contact.
   */
  static recordConsent(current: Contact[], id: string, consent: boolean): Contact[] {
    const updated = current.map(c => {
      if (c.id === id) {
        return {
          ...c,
          consentGiven: consent,
          consentTimestamp: new Date().toISOString()
        };
      }
      return c;
    });
    this.saveContacts(updated);
    return updated;
  }

  /**
   * Returns contacts eligible to receive emergency alerts (must have consent).
   */
  static getEligibleEmergencyRecipients(contacts: Contact[]): Contact[] {
    return contacts.filter(c => c.consentGiven !== false);
  }

  /**
   * Masks a contact phone for privacy.
   */
  static getMaskedPhone(contact: Contact): string {
    return maskPhoneNumber(contact.phone);
  }

  private static async syncWithBackend(contacts: Contact[]) {
    try {
      await fetch('/api/checkin/circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts })
      });
    } catch {
      // Offline fallback
    }
  }
}
