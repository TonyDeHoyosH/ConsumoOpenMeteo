import { z } from "zod";

// ── WMO weather code → description map ─────────────────────────────────────
const WMO_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  80: "Aguaceros",
  81: "Aguaceros moderados",
  82: "Aguaceros violentos",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo intenso",
};

export function getWeatherDescription(code: number): string {
  return WMO_CODES[code] ?? "Desconocido";
}

// ── Zod schema for Open-Meteo response ─────────────────────────────────────
export const OpenMeteoResponseSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
});

export type OpenMeteoResponse = z.infer<typeof OpenMeteoResponseSchema>;

// ── Output type ─────────────────────────────────────────────────────────────
export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherDescription: string;
}

// ── Columnar → objects transformation ──────────────────────────────────────
export function transformWeatherData(raw: OpenMeteoResponse): WeatherDay[] {
  const { time, temperature_2m_max, temperature_2m_min, weather_code } =
    raw.daily;

  // Validate parallel arrays have equal length
  const len = time.length;
  if (
    temperature_2m_max.length !== len ||
    temperature_2m_min.length !== len ||
    weather_code.length !== len
  ) {
    throw new Error("Mismatched array lengths in Open-Meteo response");
  }

  return time.map((date, i) => ({
    date,
    tempMax: Math.round(temperature_2m_max[i] * 10) / 10,
    tempMin: Math.round(temperature_2m_min[i] * 10) / 10,
    weatherCode: weather_code[i],
    weatherDescription: getWeatherDescription(weather_code[i]),
  }));
}

// ── Open-Meteo URL builder ──────────────────────────────────────────────────
export function buildOpenMeteoUrl(lat: number, lon: number): string {
  const base =
    process.env.OPEN_METEO_BASE_URL ?? "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    forecast_days: "7",
    timezone: "auto",
  });
  return `${base}?${params.toString()}`;
}
