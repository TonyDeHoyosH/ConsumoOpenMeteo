import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  buildOpenMeteoUrl,
  transformWeatherData,
  OpenMeteoResponseSchema,
} from '@/lib/weather';
import { getLocationById, LOCATIONS } from '@/lib/locations';
import { validateEnvVars } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    validateEnvVars();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json(
      { error: 'Configuration Error', message: msg },
      { status: 500 }
    );
  }

  const TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_MS ?? '3000', 10);

  // Auth validation
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Location resolution
  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get('locationId') ?? LOCATIONS[0].id;
  const location = getLocationById(locationId);

  if (!location) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: `Unknown locationId: ${locationId}. Valid: ${LOCATIONS.map((l) => l.id).join(', ')}`,
      },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = buildOpenMeteoUrl(location.lat, location.lon);
    const apiStartTime = Date.now();
    const response = await fetch(url, { signal: controller.signal });
    const durationMs = Date.now() - apiStartTime;
    clearTimeout(timeoutId);

    if (!response.ok) {
      await prisma.weatherLog.create({
        data: {
          userId,
          locationId: location.id,
          locationName: location.name,
          latitude: location.lat,
          longitude: location.lon,
          durationMs: Date.now() - startTime,
          status: 'error',
          errorMessage: `Network error: ${response.status}`
        }
      });
      return NextResponse.json(
        {
          error: 'Service unavailable',
          message: 'El servicio meteorológico no está disponible en este momento. Intenta más tarde.',
        },
        { status: 502 }
      );
    }

    const raw = await response.json();
    const parsed = OpenMeteoResponseSchema.safeParse(raw);

    if (!parsed.success) {
      await prisma.weatherLog.create({
        data: {
          userId,
          locationId: location.id,
          locationName: location.name,
          latitude: location.lat,
          longitude: location.lon,
          durationMs: Date.now() - startTime,
          status: 'error',
          errorMessage: 'Invalid schema: missing_daily_arrays'
        }
      });
      return NextResponse.json(
        {
          error: 'Service unavailable',
          message: 'Los datos meteorológicos tienen un formato inesperado. Intenta más tarde.',
        },
        { status: 502 }
      );
    }

    const weatherData = transformWeatherData(parsed.data);

    await prisma.weatherLog.create({
      data: {
        userId,
        locationId: location.id,
        locationName: location.name,
        latitude: location.lat,
        longitude: location.lon,
        durationMs: durationMs,
        status: 'success'
      }
    });

    return NextResponse.json(weatherData, { status: 200 });

  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const errorMessage = isTimeout ? 'timeout' : 'network_error';

    await prisma.weatherLog.create({
      data: {
        userId,
        locationId: location.id,
        locationName: location.name,
        latitude: location.lat,
        longitude: location.lon,
        durationMs: Date.now() - startTime,
        status: 'error',
        errorMessage
      }
    });

    return NextResponse.json(
      {
        error: isTimeout ? 'Gateway Timeout' : 'Service unavailable',
        message: isTimeout
          ? `El servicio meteorológico tardó más de ${TIMEOUT_MS}ms. Intenta más tarde.`
          : 'No se pudo conectar al servicio meteorológico. Intenta más tarde.',
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
