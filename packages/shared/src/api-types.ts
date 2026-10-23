// Shapes of API responses, shared by the web and mobile apps.
import type { Category, Role } from './constants.ts';

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: Role;
  isDemo: boolean;
}

export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  user: AuthUser;
}

export interface RequestCodeResponse {
  phone: string;
  expiresInSeconds: number;
  resendInSeconds: number;
}

export interface PublicCity {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
  /** Every category in display order, with its on/off state in this city */
  categories: Array<{ key: Category; enabled: boolean }>;
}

export interface PublicConfig {
  defaultCountry: { code: string; name: string; dialCode: string };
  /** The city shown on the home screen. Added in Phase 3: missing on older APIs. */
  city?: PublicCity | null;
  /** Present only when the API runs in DEMO_MODE */
  demo: { code: string; accounts: Array<{ phone: string; role: Role; name: string }> } | null;
}

/** Error body returned by the API. */
export interface ApiErrorBody {
  statusCode: number;
  code?: string;
  message?: string;
  attemptsLeft?: number;
  retryAfterSeconds?: number;
}
