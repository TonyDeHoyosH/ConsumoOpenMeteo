import { prisma } from '../src/lib/prisma';

async function checkDb() {
  try {
    console.log('Checking database connection...');
    const userCount = await prisma.user.count();
    console.log(`Database connection successful. User count: ${userCount}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    // Prisma client might not need explicit disconnect if using Proxy/Lazy pattern
    // but good practice for script completion
  }
}

checkDb();
