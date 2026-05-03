import type { WeatherDay } from "@/lib/weather";

const ITEMS_PER_PAGE = 3;

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

interface WeatherTableProps {
  data: WeatherDay[];
  currentPage: number;
}

export default function WeatherTable({ data, currentPage }: WeatherTableProps) {
  if (!data || data.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "var(--text-secondary)",
          padding: "2rem",
        }}
      >
        No hay datos disponibles
      </p>
    );
  }

  const startIdx = currentPage * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const pageData = data.slice(startIdx, endIdx);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="weather-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Condición</th>
            <th>Temp. Máx.</th>
            <th>Temp. Mín.</th>
            <th>Código WMO</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((day, i) => {
            const globalIndex = startIdx + i + 1;
            const [year, month, dayNum] = day.date.split("-");
            const formattedDate = `${dayNum}/${month}/${year}`;
            const tempDelta = day.tempMax - day.tempMin;

            return (
              <tr key={day.date} className="fade-in">
                <td>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      opacity: 0.6,
                    }}
                  >
                    {String(globalIndex).padStart(2, "0")}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formattedDate}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>
                      {getWeatherIcon(day.weatherCode)}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {day.weatherDescription}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontWeight: 700,
                      color: day.tempMax > 30 ? "#ff6b6b" : day.tempMax > 20 ? "#22d3ee" : "#a0aec0",
                    }}
                  >
                    {day.tempMax.toFixed(1)}°C
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {day.tempMin.toFixed(1)}°C
                  </span>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      color: "var(--accent)",
                      borderColor: "var(--border-accent)",
                      background: "var(--accent-glow)",
                    }}
                  >
                    WMO-{day.weatherCode}
                  </span>
                  {tempDelta > 10 && (
                    <span
                      className="badge"
                      style={{
                        marginLeft: "0.4rem",
                        color: "#f59e0b",
                        borderColor: "rgba(245,158,11,0.3)",
                        background: "rgba(245,158,11,0.08)",
                      }}
                    >
                      ΔT {tempDelta.toFixed(1)}°
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { ITEMS_PER_PAGE };
