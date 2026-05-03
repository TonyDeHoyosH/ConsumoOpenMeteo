import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeteoProxy — Datos Meteorológicos en Tiempo Real",
  description:
    "Panel de control meteorológico seguro con proxy inverso a Open-Meteo API. Consulta temperatura y condiciones climáticas para múltiples ubicaciones.",
  keywords: ["meteorología", "weather", "API", "proxy", "clima", "temperatura"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
