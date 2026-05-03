import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, extractTokenFromCookies, isValidToken } from "@/lib/auth";
import {
  buildOpenMeteoUrl,
  transformWeatherData,
  OpenMeteoResponseSchema,
} from "@/lib/weather";
import { getLocationById, LOCATIONS } from "@/lib/locations";
import { validateEnvVars } from "@/lib/env";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    validateEnvVars();
  } catch (e: any) {
    return NextResponse.json(
      { error: "Configuration Error", message: e.message },
      { status: 500 }
    );
  }

  const TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_MS ?? "3000", 10);

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
    
    const apiStartTime = Date.now();
    const response = await fetch(url, { signal: controller.signal });
    const externalApiDurationMs = Date.now() - apiStartTime;
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event_type: "weather_api_request",
          endpoint: "/api/weather",
          method: "GET",
          status: response.status,
          success: false,
          error_type: "network_error",
          duration_ms: Date.now() - startTime,
          external_api_duration_ms: externalApiDurationMs
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
          event_type: "error",
          endpoint: "/api/weather",
          method: "GET",
          status: 502,
          success: false,
          error_type: "invalid_schema",
          detail: "missing_daily_arrays",
          duration_ms: Date.now() - startTime,
          external_api_duration_ms: externalApiDurationMs
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
        event_type: "weather_api_request",
        endpoint: "/api/weather",
        method: "GET",
        status: 200,
        success: true,
        duration_ms: Date.now() - startTime,
        external_api_duration_ms: externalApiDurationMs,
        data_points_received: weatherData.length,
      })
    );

    return NextResponse.json(weatherData, { status: 200 });
  } catch (err) {
    clearTimeout(timeoutId);

    const isTimeout = err instanceof Error && err.name === "AbortError";

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event_type: "weather_api_request",
        endpoint: "/api/weather",
        method: "GET",
        status: isTimeout ? 504 : 502,
        success: false,
        error_type: isTimeout ? "timeout" : "network_error",
        duration_ms: Date.now() - startTime,
        external_api_duration_ms: TIMEOUT_MS // Aprox para timeout
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
