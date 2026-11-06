/**
 * ENDLIF Phone Utilities
 * Standards-compliant E.164 phone number formatting, validation, and privacy masking.
 * Supports national (+91 India, +1 US/Canada, +44 UK, etc.) and global phone numbers.
 */

// Strict E.164 regex: Starts with +, followed by 7 to 15 digits (country code + subscriber number)
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export interface PhoneValidationResult {
  isValid: boolean;
  e164: string;
  countryCode: string | null;
  formatted: string;
  error?: string;
}

/**
 * Normalizes an arbitrary phone string into clean E.164 format.
 * If no leading +, defaults to international prefix or preserves input.
 */
export function normalizeToE164(raw: string, defaultCountryCode = '+91'): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  
  // If already starts with '+', strip non-digits except the leading '+'
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return `+${digits}`;
  }
  
  // If starts with '00', replace with '+'
  if (trimmed.startsWith('00')) {
    const digits = trimmed.slice(2).replace(/\D/g, '');
    return `+${digits}`;
  }
  
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits and default is +91 (India), prepend +91
  if (digits.length === 10 && defaultCountryCode) {
    const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    return `${prefix}${digits}`;
  }

  // If 11 digits starting with 0 in UK or India, strip leading 0 and prepend country code
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }

  return `+${digits}`;
}

export const toE164 = normalizeToE164;
export const isValidE164 = (raw: string): boolean => validatePhoneNumber(raw).isValid;

/**
 * Validates whether a phone number strictly matches international E.164 format.
 */
export function validatePhoneNumber(raw: string): PhoneValidationResult {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      e164: '',
      countryCode: null,
      formatted: '',
      error: 'Phone number is required.'
    };
  }

  const e164 = normalizeToE164(raw);

  if (!E164_REGEX.test(e164)) {
    return {
      isValid: false,
      e164,
      countryCode: null,
      formatted: raw,
      error: 'Must be a valid international number in E.164 format (e.g. +919876543210 or +14155552671).'
    };
  }

  // Detect Country Code
  let countryCode: string | null = null;
  if (e164.startsWith('+91')) countryCode = 'IN (+91)';
  else if (e164.startsWith('+1')) countryCode = 'US/CA (+1)';
  else if (e164.startsWith('+44')) countryCode = 'UK (+44)';
  else if (e164.startsWith('+61')) countryCode = 'AU (+61)';
  else if (e164.startsWith('+971')) countryCode = 'AE (+971)';
  else if (e164.startsWith('+65')) countryCode = 'SG (+65)';
  else if (e164.startsWith('+49')) countryCode = 'DE (+49)';
  else countryCode = `INTL (${e164.slice(0, 4)})`;

  return {
    isValid: true,
    e164,
    countryCode,
    formatted: formatForDisplay(e164)
  };
}

/**
 * Pretty-formats an E.164 phone number for readable UI display.
 */
export function formatForDisplay(e164: string): string {
  if (!e164) return '';
  if (e164.startsWith('+91') && e164.length === 13) {
    // +91 98765 43210
    return `+91 ${e164.slice(3, 8)} ${e164.slice(8)}`;
  }
  if (e164.startsWith('+1') && e164.length === 12) {
    // +1 (415) 555-2671
    return `+1 (${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8)}`;
  }
  if (e164.startsWith('+44') && e164.length >= 12) {
    return `+44 ${e164.slice(3, 7)} ${e164.slice(7)}`;
  }
  return e164;
}

/**
 * Privacy Shield: Masks phone numbers in logs and public UI views.
 * Example: +91 98765 43210 -> +91 98*** **210
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'Confidential';
  const clean = normalizeToE164(phone);
  if (clean.length < 8) return '••••••••';
  
  const prefix = clean.slice(0, clean.startsWith('+91') ? 5 : 4);
  const suffix = clean.slice(-3);
  return `${prefix}••••${suffix}`;
}
