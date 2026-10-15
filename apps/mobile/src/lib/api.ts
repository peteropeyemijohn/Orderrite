// Talks to the Orderrite API. Set EXPO_PUBLIC_API_URL in apps/mobile/.env.
// On a real phone "localhost" means the phone itself, so during local
// development use your Mac's Wi-Fi address instead (e.g. http://192.168.1.20:4000).
// Anything starting with EXPO_PUBLIC_ is built into the app: never put secrets here.
import type { ApiErrorBody } from 'shared';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

/** An error answer from the API (status + body). Network failures are plain Errors. */
export class ApiRequestError extends Error {
  constructor(readonly status: number, readonly body: ApiErrorBody) {
    super(body.message ?? `Request failed (${status})`);
  }
}

/**
 * The free API server sleeps when idle and can take up to about a minute to
 * wake, so allow 70 seconds before giving up.
 */
const API_TIMEOUT_MS = 70_000;

export async function apiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; accessToken?: string } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const response = await fetch(`${API_URL}${path}`, {
    signal: controller.signal,
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  }).finally(() => clearTimeout(timer));

  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => ({}))) as unknown;
  if (!response.ok) {
    throw new ApiRequestError(response.status, { statusCode: response.status, ...(body as object) });
  }
  return body as T;
}

/** The API's error body, or undefined for network failures (no answer at all). */
export function errorBody(error: unknown): ApiErrorBody | undefined {
  return error instanceof ApiRequestError ? error.body : undefined;
}

/**
 * Wakes the free API server as early as possible (when the app opens), so it is
 * more likely to be ready by the time the person taps a button.
 */
export function wakeApi(): void {
  fetch(`${API_URL}/health/live`).catch(() => undefined);
}
