export function validateEnvVars() {
  const required = [
    'LATITUDE',
    'LONGITUDE',
    'OPEN_METEO_BASE_URL',
    'API_TIMEOUT_MS',
    'MOCK_USERNAME',
    'MOCK_PASSWORD_HEX',
    'COOKIE_SECRET'
  ];

  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
