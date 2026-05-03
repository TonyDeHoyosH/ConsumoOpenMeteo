import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión — MeteoProxy",
  description: "Accede al panel meteorológico seguro",
};

export default function LoginPage() {
  return (
    <main
      className="dot-grid"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "var(--accent)",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a0e27"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <h1
              className="glow-text"
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--accent)",
                margin: 0,
              }}
            >
              MeteoProxy
            </h1>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Sistema de Monitoreo Meteorológico
          </p>
        </div>

        {/* Login card */}
        <div
          className="card"
          style={{
            padding: "2rem",
            boxShadow:
              "0 0 40px rgba(34,211,238,0.08), 0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <LoginForm />
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.7rem",
            letterSpacing: "0.06em",
          }}
        >
          🔒 Conexión segura · Cookies HttpOnly · SameSite=Strict
        </p>
      </div>
    </main>
  );
}
