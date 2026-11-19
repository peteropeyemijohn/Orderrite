import { useEffect } from 'react';

/**
 * "Is the first real screen ready?" The violet start-up screen stays until it is.
 * Ready means: the login screen has its settings from the server, or a signed-in
 * person's session is restored, or the server wait has ended with an error
 * (then the existing error screen shows).
 */
let ready = false;
const listeners = new Set<() => void>();

/** When the app started (this file loads with the root layout). The 3 s hold counts from here. */
export const appStartedAt = Date.now();

export function markStartupReady(): void {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
}

/** Screens call this with "my content is ready to show". Later calls (after start-up) do nothing. */
export function useStartupReady(isReady: boolean): void {
  useEffect(() => {
    if (isReady) markStartupReady();
  }, [isReady]);
}

export function isStartupReady(): boolean {
  return ready;
}

/** Calls the listener once when the app becomes ready. Returns "unsubscribe". */
export function onStartupReady(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
