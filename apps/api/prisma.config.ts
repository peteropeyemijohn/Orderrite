// Prisma settings. Real connection strings come from apps/api/.env (never committed).
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations use the DIRECT (non-pooled) Neon connection.
    // The running app uses the pooled DATABASE_URL instead (see PrismaService).
    url: process.env.DIRECT_URL ?? '',
  },
});
