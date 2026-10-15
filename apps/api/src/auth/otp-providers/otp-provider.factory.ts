import type { Env } from '../../config/env.js';
import { DisabledOtpProvider } from './disabled-otp.provider.js';
import { LogOtpProvider } from './log-otp.provider.js';
import type { OtpProvider } from './otp-provider.js';

/**
 * Chooses how sign-in codes are delivered. Codes are printed in the log ONLY
 * in development or DEMO_MODE. In every other situation, and until a real SMS
 * provider is added here, sending is refused.
 */
export function createOtpProvider(env: Pick<Env, 'NODE_ENV' | 'DEMO_MODE'>): OtpProvider {
  if (env.DEMO_MODE) return new LogOtpProvider('demo');
  if (env.NODE_ENV === 'development') return new LogOtpProvider('console');
  return new DisabledOtpProvider();
}
