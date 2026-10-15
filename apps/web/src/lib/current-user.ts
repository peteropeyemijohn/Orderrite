import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthUser } from 'shared';
import { callApi } from './api-server';
import { ACCESS_COOKIE, STAFF_ROLES } from './session';

/**
 * The signed-in admin or vendor. Sends anyone else to the login page.
 * (proxy.ts has already refreshed the access token if it was about to expire.)
 */
export async function getCurrentStaffUser(): Promise<AuthUser> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect('/login');

  const result = await callApi<{ user: AuthUser }>('/auth/me', { accessToken });
  if (!result.ok) redirect('/login');

  const user = result.data.user;
  if (!(STAFF_ROLES as readonly string[]).includes(user.role)) redirect('/login');
  return user;
}
