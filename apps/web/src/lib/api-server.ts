import 'server-only';
import type { ApiErrorBody } from 'shared';
import { API_URL, WEB_PROXY_SECRET } from './server-config';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error?: ApiErrorBody };

/**
 * Calls the API from the Next.js server. Never throws: network failures come
 * back as { ok: false } with no error body, so pages can show a friendly message.
 */
export async function callApi<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; accessToken?: string; clientIp?: string } = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  if (options.clientIp && WEB_PROXY_SECRET) {
    headers['x-orderrite-client-ip'] = options.clientIp;
    headers['x-orderrite-proxy-secret'] = WEB_PROXY_SECRET;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });
    if (response.status === 204) return { ok: true, data: undefined as T };
    const body = (await response.json().catch(() => ({}))) as unknown;
    if (!response.ok) return { ok: false, error: { statusCode: response.status, ...(body as object) } };
    return { ok: true, data: body as T };
  } catch {
    return { ok: false };
  }
}
