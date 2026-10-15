// Reads and checks environment variables once, when the API starts.
// If something required is missing, the API stops with a clear message
// instead of failing later in a confusing way.
import 'dotenv/config';
import { z } from 'zod';

const booleanFromString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Pooled Neon connection, used by the running app */
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is missing. Copy it from Neon into apps/api/.env'),
  /** Comma-separated list of web addresses allowed to call the API from a browser */
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  /** Demo deployment only. Never true in a real launch. */
  DEMO_MODE: booleanFromString,
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
