import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? '';
  const isPg = url.startsWith('postgresql') || url.startsWith('postgres');

  if (isPg) {
    // Production: Neon serverless Postgres
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  // Development: local SQLite via better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodePath = require('node:path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const dbPath = nodePath.join(process.cwd(), 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

// Lazy singleton — only created when first accessed
let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma;
    }
  }
  return _prisma;
}

// Named export for convenience (still lazy via getter)
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
