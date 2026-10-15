import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AuthUser, SessionResponse } from 'shared';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { tokenStorage } from './tokenStorage';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** Call after a successful code check. */
  signIn: (session: SessionResponse) => Promise<void>;
  signOut: () => Promise<void>;
  /** Try restoring the session again (after a network error at start-up). */
  retry: () => void;
  /** Calls a signed-in API endpoint, refreshing the session once if needed. */
  authRequest: <T>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown }) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const accessToken = useRef<string | null>(null);
  // While a refresh is running, other requests wait for the same one.
  const refreshing = useRef<Promise<boolean> | null>(null);
  const [attempt, setAttempt] = useState(0);

  const applySession = useCallback(async (session: SessionResponse) => {
    accessToken.current = session.accessToken;
    await tokenStorage.setRefreshToken(session.refreshToken);
    setUser(session.user);
    setStatus('signedIn');
  }, []);

  const clearSession = useCallback(async () => {
    accessToken.current = null;
    await tokenStorage.clear();
    setUser(null);
    setStatus('signedOut');
  }, []);

  /** Swaps the stored refresh token for a new session. Returns false if signed out. */
  const refresh = useCallback((): Promise<boolean> => {
    refreshing.current ??= (async () => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          await clearSession();
          return false;
        }
        const session = await apiRequest<SessionResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } });
        await applySession(session);
        return true;
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          await clearSession();
          return false;
        }
        throw error; // network problem: keep the stored token and let the caller show an error
      } finally {
        refreshing.current = null;
      }
    })();
    return refreshing.current;
  }, [applySession, clearSession]);

  // On app start: restore the session from secure storage.
  useEffect(() => {
    let active = true;
    refresh().catch(() => {
      if (active) setStatus('error');
    });
    return () => {
      active = false;
    };
  }, [refresh, attempt]);

  const signOut = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    await clearSession();
    if (refreshToken) {
      // Tell the API to end this session. If offline, the local sign-out still stands.
      await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined);
    }
  }, [clearSession]);

  const authRequest = useCallback(
    async <T,>(path: string, options: { method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<T> => {
      try {
        return await apiRequest<T>(path, { ...options, accessToken: accessToken.current ?? undefined });
      } catch (error) {
        if (!(error instanceof ApiRequestError && error.status === 401)) throw error;
        if (!(await refresh())) throw error;
        return apiRequest<T>(path, { ...options, accessToken: accessToken.current ?? undefined });
      }
    },
    [refresh],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn: applySession,
      signOut,
      retry: () => {
        setStatus('loading');
        setAttempt((n) => n + 1);
      },
      authRequest,
    }),
    [status, user, applySession, signOut, authRequest],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
