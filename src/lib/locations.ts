export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
}

export const LOCATIONS: Location[] = [
  {
    id: "tuxtla",
    name: "Tuxtla Gutiérrez",
    lat: 16.7569,
    lon: -93.1292,
    country: "México",
  },
  {
    id: "cdmx",
    name: "Ciudad de México",
    lat: 19.4326,
    lon: -99.1332,
    country: "México",
  },
  {
    id: "nueva-york",
    name: "Nueva York",
    lat: 40.7128,
    lon: -74.006,
    country: "EE.UU.",
  },
];

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((loc) => loc.id === id);
}
