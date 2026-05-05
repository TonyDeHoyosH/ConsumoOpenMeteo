import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession, COOKIE_NAME, getCookieMaxAge } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string()
    .min(3, 'Username mínimo 3 caracteres')
    .max(20, 'Username máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username solo alfanuméricos y _'),
  password: z.string()
    .min(6, 'Password mínimo 6 caracteres')
    .regex(/^[0-9a-fA-F]+$/, 'Password debe ser hexadecimal (0-9, a-f)')
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const { email, username, password } = parsed;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email o username ya existen' },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash
      }
    });

    const token = await createSession(user.id);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Registro exitoso',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      },
      { status: 201 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: getCookieMaxAge(),
      path: '/'
    });

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'user_registered',
      username,
      status: 'success'
    }));

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validación fallida', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error en registro' },
      { status: 500 }
    );
  }
}
