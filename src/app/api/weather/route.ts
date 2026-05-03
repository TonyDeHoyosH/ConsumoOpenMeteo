import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, extractTokenFromCookies, isValidToken } from "@/lib/auth";
import {
  buildOpenMeteoUrl,
  transformWeatherData,
  OpenMeteoResponseSchema,
} from "@/lib/weather";
import { getLocationById, LOCATIONS } from "@/lib/locations";

const TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_MS ?? "3000", 10);

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ── Auth validation ───────────────────────────────────────────────────────
  const cookieHeader = request.headers.get("cookie");
  const token = extractTokenFromCookies(cookieHeader);

  if (!isValidToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  // ── Location resolution ───────────────────────────────────────────────────
  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId") ?? LOCATIONS[0].id;
  const location = getLocationById(locationId);

  if (!location) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: `Unknown locationId: ${locationId}. Valid: ${LOCATIONS.map((l) => l.id).join(", ")}`,
      },
      { status: 400 }
    );
  }

  // ── Fetch Open-Meteo with AbortController timeout ─────────────────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = buildOpenMeteoUrl(location.lat, location.lon);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "weather_upstream_error",
          status: response.status,
          location: location.id,
          duration_ms: Date.now() - startTime,
        })
      );
      return NextResponse.json(
        {
          error: "Service unavailable",
          message:
            "El servicio meteorológico no está disponible en este momento. Intenta más tarde.",
        },
        { status: 502 }
      );
    }

    const raw = await response.json();

    // ── Schema validation ─────────────────────────────────────────────────
    const parsed = OpenMeteoResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "weather_schema_error",
          location: location.id,
          duration_ms: Date.now() - startTime,
        })
      );
      return NextResponse.json(
        {
          error: "Service unavailable",
          message:
            "Los datos meteorológicos tienen un formato inesperado. Intenta más tarde.",
        },
        { status: 502 }
      );
    }

    const weatherData = transformWeatherData(parsed.data);

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "weather_api_request",
        status: 200,
        location: location.id,
        duration_ms: Date.now() - startTime,
        data_points: weatherData.length,
      })
    );

    return NextResponse.json(weatherData, { status: 200 });
  } catch (err) {
    clearTimeout(timeoutId);

    const isTimeout =
      err instanceof Error && err.name === "AbortError";

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: isTimeout ? "weather_timeout" : "weather_fetch_error",
        location: locationId,
        duration_ms: Date.now() - startTime,
      })
    );

    return NextResponse.json(
      {
        error: isTimeout ? "Gateway Timeout" : "Service unavailable",
        message: isTimeout
          ? `El servicio meteorológico tardó más de ${TIMEOUT_MS}ms. Intenta más tarde.`
          : "No se pudo conectar al servicio meteorológico. Intenta más tarde.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
