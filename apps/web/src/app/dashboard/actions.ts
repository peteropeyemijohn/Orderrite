'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { callApi } from '@/lib/api-server';
import { REFRESH_COOKIE, clearSessionCookies } from '@/lib/session';

/** Ends the session in the API, removes the cookies, and goes back to login. */
export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (refreshToken) await callApi('/auth/logout', { method: 'POST', body: { refreshToken } });
  clearSessionCookies(cookieStore);
  redirect('/login');
}
