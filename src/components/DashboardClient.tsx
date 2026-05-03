"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationSelector from "./LocationSelector";
import WeatherTable, { ITEMS_PER_PAGE } from "./WeatherTable";
import Pagination from "./Pagination";
import { WeatherDay } from "@/lib/weather";
import { LOCATIONS } from "@/lib/locations";

export default function DashboardClient() {
  const router = useRouter();
  const [locationId, setLocationId] = useState(LOCATIONS[0].id);
  const [data, setData] = useState<WeatherDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      // Reset pagination when location changes
      setCurrentPage(0);

      try {
        const res = await fetch(`/api/weather?locationId=${locationId}`);
        
        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Error al cargar datos");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [locationId, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false);
    }
  }

  // Calculate pagination
  const totalItems = data ? data.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "var(--accent)",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0e27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h1
            className="glow-text"
            style={{ fontSize: "1.25rem", margin: 0, color: "var(--accent)" }}
          >
            MeteoProxy
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost"
          disabled={isLoggingOut}
          style={{ padding: "0.4rem 0.75rem", fontSize: "0.7rem" }}
        >
          {isLoggingOut ? "Saliendo..." : "Cerrar Sesión ⏏"}
        </button>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.75rem", margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              Reporte de 7 Días
            </h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Datos extraídos de Open-Meteo vía proxy inverso
            </p>
          </div>

          <LocationSelector
            selectedId={locationId}
            onChange={setLocationId}
            disabled={isLoading}
          />
        </div>

        {/* Data Card */}
        <div className="card" style={{ overflow: "hidden" }}>
          
          {error ? (
            <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
               <div className="error-box" style={{ display: "inline-block", maxWidth: "400px" }}>
                  <span style={{ display: "block", fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</span>
                  {error}
               </div>
            </div>
          ) : isLoading ? (
             <div style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="skeleton" style={{ height: "40px", width: "100%" }} />
                <div className="skeleton" style={{ height: "60px", width: "100%" }} />
                <div className="skeleton" style={{ height: "60px", width: "100%" }} />
                <div className="skeleton" style={{ height: "60px", width: "100%" }} />
             </div>
          ) : data ? (
            <>
              <WeatherTable data={data} currentPage={currentPage} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage(p => Math.max(0, p - 1))}
                onNext={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          ) : null}
          
        </div>
      </main>
    </div>
  );
}
