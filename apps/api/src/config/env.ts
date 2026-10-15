// Reads and checks environment variables once, when the API starts.
// If something required is missing, the API stops with a clear message
// instead of failing later in a confusing way.
import 'dotenv/config';
import { z } from 'zod';

const booleanFromString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const secret = (name: string) =>
  z
    .string({ error: `${name} is missing. See apps/api/.env.example` })
    .min(32, `${name} must be at least 32 characters. Generate one with: openssl rand -base64 48`);

const envSchema = z
  .object({
    // Safe default: anything that is not explicitly "development" is treated
    // as production (no codes printed in logs). `pnpm dev` sets development.
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    PORT: z.coerce.number().int().positive().default(4000),
    /** Pooled Neon connection, used by the running app */
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is missing. Copy it from Neon into apps/api/.env'),
    /** Comma-separated list of web addresses allowed to call the API from a browser */
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
    /** How many proxies sit in front of the API (0 locally; measured on Render with IP_DEBUG) */
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
    /**
     * Optional: read the visitor IP from this header instead (e.g. "cf-connecting-ip"),
     * only if the hosting edge always overwrites it. Leave empty unless IP_DEBUG showed it is safe.
     */
    CLIENT_IP_HEADER: z.string().toLowerCase().optional(),
    /** Temporarily turns on GET /health/ip to check visitor IP detection after deploy. */
    IP_DEBUG: booleanFromString,
    /** Demo deployment only. Never true in a real launch. */
    DEMO_MODE: booleanFromString,

    /** Signs access tokens */
    JWT_ACCESS_SECRET: secret('JWT_ACCESS_SECRET'),
    /** Used to hash sign-in codes before they are stored */
    OTP_HASH_SECRET: secret('OTP_HASH_SECRET'),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
    /**
     * Optional shared secret between the web server and the API. When the web
     * server sends it, the API trusts the visitor IP it forwards (for rate limiting).
     */
    WEB_PROXY_SECRET: z.string().min(32).optional(),
  })
  .refine((env) => env.JWT_ACCESS_SECRET !== env.OTP_HASH_SECRET, {
    message: 'JWT_ACCESS_SECRET and OTP_HASH_SECRET must be different',
    path: ['OTP_HASH_SECRET'],
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment settings:\n${problems}`);
  }
  return result.data;
}

/** Injection token so services can receive the checked settings. */
export const ENV = Symbol('ENV');
