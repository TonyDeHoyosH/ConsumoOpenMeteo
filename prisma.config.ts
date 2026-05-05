import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// CLI config for migrations
// Production uses DATABASE_URL (set in Vercel env vars)
// Development uses local SQLite
const isDev = !process.env.DATABASE_URL?.startsWith('postgresql') &&
              !process.env.DATABASE_URL?.startsWith('postgres');

const devDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: isDev ? `file:${devDbPath}` : process.env.DATABASE_URL!,
  },
});
