import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, invalidateSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (token) {
      await invalidateSession(token);
    }

    const response = NextResponse.json(
      { success: true, message: 'Logout exitoso' },
      { status: 200 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error en logout' },
      { status: 500 }
    );
  }
}
