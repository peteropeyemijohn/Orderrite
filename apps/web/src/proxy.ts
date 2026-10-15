import { NextResponse, type NextRequest } from 'next/server';
import type { SessionResponse } from 'shared';
import { ACCESS_COOKIE, REFRESH_COOKIE, accessTokenNeedsRefresh, clearSessionCookies, writeSessionCookies } from './lib/session';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

/**
 * Runs before every dashboard page.
 * - No session cookie: go to /login.
 * - Access token (15 min) about to expire: swap the refresh token for a new
 *   pair here, because cookies can only be changed in proxy, server actions
 *   or route handlers (not while a page renders).
 */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return redirectToLogin(request);

  if (!accessTokenNeedsRefresh(request.cookies.get(ACCESS_COOKIE)?.value)) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (response.status === 401 || response.status === 400) return redirectToLogin(request);
    if (!response.ok) return NextResponse.next(); // API trouble: let the page show its error state
    const session = (await response.json()) as SessionResponse;

    // Give the new tokens to this request (so the page sees them) and to the browser.
    request.cookies.set(ACCESS_COOKIE, session.accessToken);
    request.cookies.set(REFRESH_COOKIE, session.refreshToken);
    const next = NextResponse.next({ request: { headers: request.headers } });
    writeSessionCookies(next.cookies, session);
    return next;
  } catch {
    return NextResponse.next();
  }
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  clearSessionCookies(response.cookies);
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
