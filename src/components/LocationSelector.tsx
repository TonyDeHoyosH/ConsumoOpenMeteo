"use client";

import { LOCATIONS } from "@/lib/locations";

interface LocationSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function LocationSelector({
  selectedId,
  onChange,
  disabled = false,
}: LocationSelectorProps) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}
    >
      <label
        htmlFor="location-select"
        style={{
          fontSize: "0.65rem",
          fontFamily: "IBM Plex Mono, monospace",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          whiteSpace: "nowrap",
        }}
      >
        📍 Ubicación
      </label>
      <select
        id="location-select"
        className="select-field"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {LOCATIONS.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name} · {loc.country}
          </option>
        ))}
      </select>
    </div>
  );
}
