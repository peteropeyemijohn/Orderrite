// The one place where money is turned into text for the screen.
// Amounts are always whole numbers in the currency's minor unit
// (kobo for NGN), stored together with an ISO 4217 currency code.

/** How many minor units make one major unit (e.g. 100 kobo = 1 naira). */
export function minorUnitsPerMajor(currencyCode: string): number {
  const digits =
    new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode })
      .resolvedOptions().maximumFractionDigits ?? 2;
  return 10 ** digits;
}

/**
 * Formats an amount for display, e.g. formatMoney(50000, 'NGN') -> "₦500.00".
 * The currency symbol comes from the currency code, never from hard-coded text.
 */
export function formatMoney(amountMinor: number, currencyCode: string, locale = 'en'): string {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`Money amounts must be whole minor units, got ${amountMinor}`);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
  }).format(amountMinor / minorUnitsPerMajor(currencyCode));
}
