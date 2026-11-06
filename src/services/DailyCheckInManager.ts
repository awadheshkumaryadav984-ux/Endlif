/**
 * ENDLIF DailyCheckInManager
 * Manages daily safety verification timestamps, warning thresholds (2, 3, 7 days),
 * safe development simulation mode, and backend state synchronization.
 */

import { SecureStorage } from '../utils/security';
import { AlertAuditLogger } from './AlertAuditLogger';

export type CheckInThreshold = 2 | 3 | 7;

export interface CheckInState {
  lastCheckInTimestamp: string;
  thresholdDays: CheckInThreshold;
  isSafeConfirmedToday: boolean;
  missedDays: number;
  isThresholdExceeded: boolean;
  isSimulation: boolean;
  simulatedMissedDays?: number;
  lastSyncTimestamp: string;
}

const STORAGE_KEYS = {
  LAST_TIMESTAMP: 'endlif_last_safe_confirm_timestamp',
  LAST_DATE_STR: 'endlif_last_safe_confirm_date',
  THRESHOLD: 'endlif_checkin_threshold',
  SIMULATION_ACTIVE: 'endlif_simulation_mode_active',
  SIMULATION_DAYS: 'endlif_simulation_days_missed'
};

class DailyCheckInManagerClass {
  private thresholdDays: CheckInThreshold = 2;
  private lastCheckInTimestamp: string;
  private isSimulationActive = false;
  private simulatedDaysMissed = 0;

  constructor() {
    this.lastCheckInTimestamp = this.loadInitialTimestamp();
    this.thresholdDays = this.loadInitialThreshold();
    this.loadSimulationState();
  }

  private loadInitialTimestamp(): string {
    let ts = SecureStorage.getItem(STORAGE_KEYS.LAST_TIMESTAMP);
    if (!ts) {
      ts = new Date().toISOString();
      SecureStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, ts);
      localStorage.setItem(STORAGE_KEYS.LAST_DATE_STR, new Date().toDateString());
    }
    return ts;
  }

  private loadInitialThreshold(): CheckInThreshold {
    const saved = SecureStorage.getItem(STORAGE_KEYS.THRESHOLD);
    if (saved === '3') return 3;
    if (saved === '7') return 7;
    return 2;
  }

  private loadSimulationState() {
    this.isSimulationActive = localStorage.getItem(STORAGE_KEYS.SIMULATION_ACTIVE) === 'true';
    const days = parseInt(localStorage.getItem(STORAGE_KEYS.SIMULATION_DAYS) || '0', 10);
    this.simulatedDaysMissed = isNaN(days) ? 0 : days;
  }

  /**
   * Calculates current state, accounting for development simulation if active.
   */
  getState(): CheckInState {
    const todayStr = new Date().toDateString();
    const savedDateStr = localStorage.getItem(STORAGE_KEYS.LAST_DATE_STR);
    const isSafeToday = savedDateStr === todayStr && !this.isSimulationActive;

    let missedDays = 0;
    if (this.isSimulationActive) {
      missedDays = this.simulatedDaysMissed;
    } else {
      const last = new Date(this.lastCheckInTimestamp).getTime();
      const now = Date.now();
      const diffMs = now - last;
      missedDays = diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
    }

    const isThresholdExceeded = missedDays >= this.thresholdDays;

    return {
      lastCheckInTimestamp: this.lastCheckInTimestamp,
      thresholdDays: this.thresholdDays,
      isSafeConfirmedToday: isSafeToday,
      missedDays,
      isThresholdExceeded,
      isSimulation: this.isSimulationActive,
      simulatedMissedDays: this.isSimulationActive ? this.simulatedDaysMissed : undefined,
      lastSyncTimestamp: new Date().toISOString()
    };
  }

  /**
   * Checks current threshold status and returns calculated state.
   */
  checkThreshold(): CheckInState {
    return this.getState();
  }

  /**
   * Records a user's successful daily safety check-in.
   */
  recordCheckIn(): CheckInState {
    const now = new Date();
    this.lastCheckInTimestamp = now.toISOString();
    this.isSimulationActive = false;
    this.simulatedDaysMissed = 0;

    SecureStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, this.lastCheckInTimestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_DATE_STR, now.toDateString());
    localStorage.removeItem(STORAGE_KEYS.SIMULATION_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.SIMULATION_DAYS);

    AlertAuditLogger.log({
      eventType: 'CHECK_IN_RECORDED',
      severity: 'info',
      actor: 'User',
      channel: 'system',
      status: 'Verified',
      detail: `Daily safety check-in verified at ${now.toLocaleTimeString()}. Warning threshold reset.`,
      isSimulation: false
    });

    this.notifyStateChange();
    this.syncWithBackend();

    return this.getState();
  }

  /**
   * Updates warning threshold (2, 3, or 7 days).
   */
  setThreshold(days: CheckInThreshold): CheckInState {
    this.thresholdDays = days;
    SecureStorage.setItem(STORAGE_KEYS.THRESHOLD, days.toString());

    AlertAuditLogger.log({
      eventType: 'THRESHOLD_CHANGED',
      severity: 'info',
      actor: 'User',
      channel: 'system',
      status: 'Updated',
      detail: `Safety alert threshold configured to ${days} days.`,
      isSimulation: false
    });

    this.notifyStateChange();
    this.syncWithBackend();

    return this.getState();
  }

  /**
   * Safe Development Simulation: Simulates 2, 3, or 7 days missed.
   * Explicitly labeled as DEVELOPMENT SIMULATION in UI and audit logs.
   */
  simulateMissedDays(days: 2 | 3 | 7): CheckInState {
    this.isSimulationActive = true;
    this.simulatedDaysMissed = days;

    const simulatedDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000) - (60 * 60 * 1000));
    this.lastCheckInTimestamp = simulatedDate.toISOString();

    localStorage.setItem(STORAGE_KEYS.SIMULATION_ACTIVE, 'true');
    localStorage.setItem(STORAGE_KEYS.SIMULATION_DAYS, days.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_DATE_STR, simulatedDate.toDateString());
    SecureStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, this.lastCheckInTimestamp);

    AlertAuditLogger.log({
      eventType: 'SIMULATION_EXECUTED',
      severity: 'warning',
      actor: 'DevSimulator',
      channel: 'system',
      status: 'DEVELOPMENT SIMULATION',
      detail: `Simulated ${days} days missed. Threshold: ${this.thresholdDays} days.`,
      isSimulation: true
    });

    this.notifyStateChange();
    return this.getState();
  }

  /**
   * Clears development simulation and resets to actual status.
   */
  resetSimulation(): CheckInState {
    this.isSimulationActive = false;
    this.simulatedDaysMissed = 0;
    localStorage.removeItem(STORAGE_KEYS.SIMULATION_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.SIMULATION_DAYS);

    const now = new Date();
    this.lastCheckInTimestamp = now.toISOString();
    SecureStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, this.lastCheckInTimestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_DATE_STR, now.toDateString());

    this.notifyStateChange();
    return this.getState();
  }

  private notifyStateChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('endlif_checkin_updated', { detail: this.getState() }));
      window.dispatchEvent(new Event('endlif_profile_updated'));
    }
  }

  private async syncWithBackend() {
    try {
      await fetch('/api/checkin/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastCheckInTimestamp: this.lastCheckInTimestamp,
          thresholdDays: this.thresholdDays,
          isSimulation: this.isSimulationActive
        })
      });
    } catch {
      // Background worker handles persistent fallback
    }
  }
}

export const DailyCheckInManager = new DailyCheckInManagerClass();
