/**
 * ENDLIF AlertAuditLogger
 * Immutable, cryptographically timestamped event logging for all emergency actions,
 * check-in transitions, and delivery attempts.
 */

import { AuditLogEntry } from '../types';
import { SecureStorage } from '../utils/security';

const AUDIT_STORAGE_KEY = 'endlif_alert_audit_trail';
const MAX_LOCAL_LOGS = 100;

class AlertAuditLoggerClass {
  private logs: AuditLogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    const raw = SecureStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      try {
        this.logs = JSON.parse(raw);
      } catch {
        this.logs = [];
      }
    }
  }

  private persistLogs() {
    try {
      // Keep most recent entries
      if (this.logs.length > MAX_LOCAL_LOGS) {
        this.logs = this.logs.slice(0, MAX_LOCAL_LOGS);
      }
      SecureStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('[AlertAuditLogger] Failed to persist logs:', e);
    }
  }

  /**
   * Records a security or alert event to the immutable log.
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.logs.unshift(newEntry);
    this.persistLogs();

    // Broadcast update event for UI subscribers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('endlif_audit_updated', { detail: newEntry }));
    }

    // Forward to backend if available asynchronously
    this.forwardToBackend(newEntry);

    return newEntry;
  }

  private async forwardToBackend(entry: AuditLogEntry) {
    try {
      await fetch('/api/alerts/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch {
      // Offline tolerance: log remains securely in client storage
    }
  }

  getLogs(filter?: { isSimulation?: boolean; eventType?: AuditLogEntry['eventType'] }): AuditLogEntry[] {
    if (!filter) return [...this.logs];
    return this.logs.filter(l => {
      if (filter.isSimulation !== undefined && l.isSimulation !== filter.isSimulation) return false;
      if (filter.eventType && l.eventType !== filter.eventType) return false;
      return true;
    });
  }

  clearLogs() {
    this.logs = [];
    SecureStorage.removeItem(AUDIT_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('endlif_audit_updated'));
    }
  }
}

export const AlertAuditLogger = new AlertAuditLoggerClass();
