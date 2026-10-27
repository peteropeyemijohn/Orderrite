import { DIAL_COUNTRIES, type DialCountry } from './countries.ts';

/**
 * The list for the phone country picker: countries Orderrite operates in first
 * (in the order the API gives, default first), then every other country A–Z.
 */
export function pickerCountries(active: ReadonlyArray<{ code: string; name: string; dialCode: string }>): {
  active: DialCountry[];
  others: DialCountry[];
} {
  const activeCodes = new Set(active.map((c) => c.code));
  return {
    active: active.map(({ code, name, dialCode }) => ({ code, name, dialCode })),
    others: DIAL_COUNTRIES.filter((c) => !activeCodes.has(c.code)),
  };
}

/**
 * Turns what the person typed into a number for the API. With the default
 * country the API converts local numbers itself ("0803…"). For another
 * country, the dialling code is added and a leading 0 (trunk prefix) dropped.
 */
export function internationalNumber(typed: string, country: DialCountry, defaultCountryCode: string): string {
  const cleaned = typed.trim();
  if (cleaned.startsWith('+') || country.code === defaultCountryCode) return cleaned;
  const digits = cleaned.replace(/\D/g, '').replace(/^0+/, '');
  return `${country.dialCode}${digits}`;
}

/**
 * Makes a stored international number easy to read, e.g.
 * "+2340000000001" → "+234 000 000 0001". The dialling code comes from the
 * reference list (longest match). The rest is grouped simply: the last 4
 * digits together, the digits before them in threes. Anything that doesn't
 * look like an international number is returned unchanged.
 */
export function formatPhone(international: string): string {
  if (!/^\+\d{6,15}$/.test(international)) return international;
  const dialCode = DIAL_COUNTRIES.map((c) => c.dialCode)
    .filter((code) => international.startsWith(code))
    .sort((a, b) => b.length - a.length)[0];
  if (!dialCode) return international;
  const national = international.slice(dialCode.length);
  const head = national.slice(0, -4).match(/\d{1,3}/g) ?? [];
  return [dialCode, ...head, national.slice(-4)].join(' ');
}
