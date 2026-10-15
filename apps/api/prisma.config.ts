// Prisma settings. Real connection strings come from apps/api/.env (never committed).
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma's migration tool gives up after 5 seconds by default. Slow or
 * far-away connections (and Neon waking up from sleep) can take longer,
 * so allow 30 seconds unless the URL already sets its own limit.
 */
function withConnectTimeout(url: string | undefined): string {
  if (!url) return '';
  if (url.includes('connect_timeout=')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}connect_timeout=30`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations use the DIRECT (non-pooled) Neon connection.
    // The running app uses the pooled DATABASE_URL instead (see PrismaService).
    url: withConnectTimeout(process.env.DIRECT_URL),
  },
});
