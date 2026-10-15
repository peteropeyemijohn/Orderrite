import type { Role } from '../generated/prisma/enums.js';

/** The published sign-in code for the public demo. Only works when DEMO_MODE=true. */
export const DEMO_OTP_CODE = '123456';

/**
 * Demo accounts, created by the seed only when DEMO_MODE=true.
 * The numbers use an all-zero pattern that no real phone line can have,
 * so a demo account can never belong to a real person.
 */
export const DEMO_ACCOUNTS: ReadonlyArray<{ phone: string; role: Role; name: string }> = [
  { phone: '+2340000000001', role: 'CUSTOMER', name: 'Demo Customer' },
  { phone: '+2340000000002', role: 'RIDER', name: 'Demo Rider' },
  { phone: '+2340000000003', role: 'VENDOR', name: 'Demo Vendor' },
  { phone: '+2340000000004', role: 'ADMIN', name: 'Demo Admin' },
];

export function isDemoPhone(phone: string): boolean {
  return DEMO_ACCOUNTS.some((account) => account.phone === phone);
}
