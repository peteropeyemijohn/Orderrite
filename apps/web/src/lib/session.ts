import 'server-only';
import type { SessionResponse } from 'shared';
import { IS_PRODUCTION } from './server-config';

// The web session lives in two httpOnly cookies. httpOnly means JavaScript in
// the page cannot read them, so even a malicious script can't steal the tokens.
// Secure (HTTPS only, when deployed) and SameSite=Lax (other sites can't use them).
export const ACCESS_COOKIE = 'orderrite_access';
export const REFRESH_COOKIE = 'orderrite_refresh';
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Roles allowed into the web dashboard. */
export const STAFF_ROLES = ['ADMIN', 'VENDOR'] as const;

interface CookieWriter {
  set(name: string, value: string, options: Record<string, unknown>): unknown;
  delete(name: string): unknown;
}

const baseOptions = { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'lax', path: '/' } as const;

export function writeSessionCookies(cookies: CookieWriter, session: Pick<SessionResponse, 'accessToken' | 'refreshToken' | 'accessTokenExpiresIn'>) {
  cookies.set(ACCESS_COOKIE, session.accessToken, { ...baseOptions, maxAge: session.accessTokenExpiresIn });
  cookies.set(REFRESH_COOKIE, session.refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE_SECONDS });
}

export function clearSessionCookies(cookies: CookieWriter) {
  cookies.delete(ACCESS_COOKIE);
  cookies.delete(REFRESH_COOKIE);
}

/**
 * True if the access token is missing or expires within 30 seconds.
 * Only reads the expiry time; the API is what actually verifies the token.
 */
export function accessTokenNeedsRefresh(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return !payload.exp || payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}
