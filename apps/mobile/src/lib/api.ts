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

/** Longest wait for one request once the server is known to be awake. */
const API_TIMEOUT_MS = 70_000;

/**
 * Waking the free server (Render sleeps when idle). While it starts, it may not
 * answer at all or answer 502/503/504, sometimes for more than a minute. So we
 * keep asking /health/live (a cheap endpoint that doesn't touch the database)
 * until it answers, and only give up after WAKE_TOTAL_MS.
 */
const WAKE_TOTAL_MS = 120_000;
/** One wake check may hang while the server boots; stop it after this long and ask again. */
const WAKE_TRY_TIMEOUT_MS = 20_000;
/** Pause between wake checks. */
const WAKE_RETRY_DELAY_MS = 3_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Set once the server has answered; later requests then skip the wake wait. */
let apiAwake = false;
/** The wake wait in progress, shared by every request that starts meanwhile. */
let waking: Promise<void> | null = null;

/** Waits until the server answers (any answer except 502/503/504), or rejects after WAKE_TOTAL_MS. */
function waitUntilAwake(): Promise<void> {
  if (apiAwake) return Promise.resolve();
  waking ??= (async () => {
    const deadline = Date.now() + WAKE_TOTAL_MS;
    while (Date.now() < deadline) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(WAKE_TRY_TIMEOUT_MS, deadline - Date.now()));
      try {
        const response = await fetch(`${API_URL}/health/live`, { signal: controller.signal });
        if (![502, 503, 504].includes(response.status)) {
          apiAwake = true;
          return;
        }
      } catch {
        // No answer yet (still booting, or the try timed out): ask again.
      } finally {
        clearTimeout(timer);
      }
      await sleep(Math.min(WAKE_RETRY_DELAY_MS, Math.max(0, deadline - Date.now())));
    }
    throw new Error('The server did not wake up in time');
  })().finally(() => {
    waking = null; // a later "Try again" starts a fresh wait
  });
  return waking;
}

export async function apiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; accessToken?: string } = {},
): Promise<T> {
  // Never send the real request (e.g. "send me a code") before the server is up,
  // so a slow start can't make anything happen twice.
  await waitUntilAwake();
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
  // Skip while the web preview is pre-rendered on the computer (no window there).
  if (typeof window === 'undefined') return;
  waitUntilAwake().catch(() => undefined); // the first real request shows any error
}
