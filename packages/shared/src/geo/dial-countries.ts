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
