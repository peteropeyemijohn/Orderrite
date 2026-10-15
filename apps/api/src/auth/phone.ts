// Turns whatever a person typed into one standard international format
// (E.164, e.g. "+2348031234567"), so the same person always maps to the
// same account. Numbers without a "+" are read using the default country
// from the database (Nigeria at launch), never a hard-coded one.
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max';
import { isDemoPhone } from './demo-accounts.js';

export interface NormalizeOptions {
  /** ISO country code used when the number has no "+" prefix, e.g. "NG" */
  defaultCountry: string;
  /** Demo numbers are only accepted while DEMO_MODE is on */
  allowDemoNumbers: boolean;
}

/** Returns the number in E.164 format, or null if it is not a valid phone number. */
export function normalizePhone(input: string, options: NormalizeOptions): string | null {
  const cleaned = input.trim().replace(/[\s\-().]/g, '');
  if (cleaned.length === 0 || cleaned.length > 20) return null;

  if (isDemoPhone(cleaned)) {
    return options.allowDemoNumbers ? cleaned : null;
  }

  // "00" is the international prefix in many countries: 00234... means +234...
  const withPlus = cleaned.startsWith('00') ? `+${cleaned.slice(2)}` : cleaned;
  const parsed = parsePhoneNumberFromString(withPlus, options.defaultCountry as CountryCode);

  // People often type "234803..." without the "+". If the plain reading fails,
  // try again as an international number.
  if ((!parsed || !parsed.isValid()) && /^[1-9]\d{9,14}$/.test(withPlus)) {
    const international = parsePhoneNumberFromString(`+${withPlus}`);
    if (international?.isValid()) return international.number;
  }

  return parsed?.isValid() ? parsed.number : null;
}

/** Shows only the start and last 4 digits, for logs. */
export function maskPhone(phone: string): string {
  return phone.length > 8 ? `${phone.slice(0, 4)}…${phone.slice(-4)}` : '…';
}
