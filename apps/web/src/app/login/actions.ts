'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authErrorMessage, en, type PublicConfig, type RequestCodeResponse, type SessionResponse } from 'shared';
import { callApi } from '@/lib/api-server';
import { getVisitorIp } from '@/lib/client-ip';
import { STAFF_ROLES, writeSessionCookies } from '@/lib/session';

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; message: string; retryAfterSeconds?: number };

export async function loadPublicConfig(): Promise<ActionResult<PublicConfig>> {
  const result = await callApi<PublicConfig>('/config/public');
  return result.ok ? { ok: true, data: result.data } : { ok: false, message: en.common.cantReachServer };
}

export async function requestCode(phone: string): Promise<ActionResult<RequestCodeResponse>> {
  if (typeof phone !== 'string' || phone.length > 30) return { ok: false, message: en.auth.errors.INVALID_PHONE };
  const result = await callApi<RequestCodeResponse>('/auth/otp/request', {
    method: 'POST',
    body: { phone },
    clientIp: await getVisitorIp(),
  });
  if (result.ok) return { ok: true, data: result.data };
  return { ok: false, message: authErrorMessage(result.error), retryAfterSeconds: result.error?.retryAfterSeconds };
}

/** Checks the code. Only admins and vendors get a web session. */
export async function verifyCode(phone: string, code: string): Promise<ActionResult> {
  if (typeof phone !== 'string' || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return { ok: false, message: en.auth.errors.INVALID_INPUT };
  }
  const result = await callApi<SessionResponse>('/auth/otp/verify', {
    method: 'POST',
    body: { phone, code },
    clientIp: await getVisitorIp(),
  });
  if (!result.ok) return { ok: false, message: authErrorMessage(result.error) };

  const session = result.data;
  if (!(STAFF_ROLES as readonly string[]).includes(session.user.role)) {
    // Not allowed here: end the session we just created instead of keeping it.
    await callApi('/auth/logout', { method: 'POST', body: { refreshToken: session.refreshToken } });
    return { ok: false, message: en.auth.webOnlyStaff };
  }

  writeSessionCookies(await cookies(), session);
  redirect('/dashboard');
}
