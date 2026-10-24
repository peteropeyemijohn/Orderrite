/**
 * The flag emoji for a country code ("NG" -> 🇳🇬), built from the two
 * "regional indicator" letters. No image files needed.
 */
export function flagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '🏳️';
  return String.fromCodePoint(...[...code].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
}
