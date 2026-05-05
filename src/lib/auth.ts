import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const COOKIE_NAME = 'auth_token';

export function getCookieMaxAge(): number {
  return parseInt(process.env.COOKIE_MAX_AGE ?? '604800', 10);
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true }
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return session.userId;
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + getCookieMaxAge() * 1000);

  await prisma.session.create({
    data: { token, userId, expiresAt }
  });

  return token;
}

export async function invalidateSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token }
  }).catch(() => {});
}
