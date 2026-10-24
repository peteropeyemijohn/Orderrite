// The one place where money is turned into text for the screen.
// Amounts are always whole numbers in the currency's minor unit (kobo for
// NGN), stored together with an ISO 4217 currency code. The symbol (e.g. "₦")
// comes from the country data. Formatting is done here by hand, so Android
// shows exactly the same as iPhone (Android's built-in formatter is limited
// and can show "NGN 500.00").

/** Currencies with no minor unit or with 3 decimals; everything else has 2. */
const ZERO_DECIMALS = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
const THREE_DECIMALS = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

/** How many decimal places a currency uses (NGN: 2, JPY: 0, KWD: 3). */
export function currencyDecimals(currencyCode: string): number {
  const code = currencyCode.toUpperCase();
  if (ZERO_DECIMALS.has(code)) return 0;
  if (THREE_DECIMALS.has(code)) return 3;
  return 2;
}

/** How many minor units make one major unit (e.g. 100 kobo = 1 naira). */
export function minorUnitsPerMajor(currencyCode: string): number {
  return 10 ** currencyDecimals(currencyCode);
}

export interface MoneyCurrency {
  /** ISO 4217 code, e.g. "NGN" */
  code: string;
  /** From the country data, e.g. "₦". Missing: the code is shown instead ("NGN 500"). */
  symbol?: string | null;
}

/**
 * Formats an amount for display:
 *   formatMoney(50000, { code: 'NGN', symbol: '₦' })   -> "₦500"
 *   formatMoney(125050, { code: 'NGN', symbol: '₦' })  -> "₦1,250.50"
 *   formatMoney(50000, { code: 'NGN' })                -> "NGN 500"
 * Whole amounts drop the ".00". Thousands are separated with commas.
 */
export function formatMoney(amountMinor: number, currency: MoneyCurrency): string {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`Money amounts must be whole minor units, got ${amountMinor}`);
  }
  const decimals = currencyDecimals(currency.code);
  const factor = 10 ** decimals;
  const negative = amountMinor < 0;
  const absolute = Math.abs(amountMinor);
  const major = Math.floor(absolute / factor);
  const minor = absolute % factor;

  const grouped = String(major).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const number = minor === 0 ? grouped : `${grouped}.${String(minor).padStart(decimals, '0')}`;
  const prefix = currency.symbol ? currency.symbol : `${currency.code.toUpperCase()} `;
  return `${negative ? '-' : ''}${prefix}${number}`;
}
