"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PASSWORD_REGEX = /^[0-9a-fA-F]{6,}$/;

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Frontend validation
  const passwordError =
    password.length > 0 && !PASSWORD_REGEX.test(password)
      ? "La contraseña debe ser hexadecimal (a-f, 0-9) y mínimo 6 caracteres"
      : null;

  const canSubmit =
    username.trim().length > 0 &&
    PASSWORD_REGEX.test(password) &&
    !isLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message ?? "Error de autenticación");
      }
    } catch {
      setError("No se pudo conectar. Revisa tu conexión.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: "0.375rem" }}>
        <label
          htmlFor="username"
          style={{
            display: "block",
            fontSize: "0.7rem",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          Usuario
        </label>
        <input
          id="username"
          type="text"
          className="input-field"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: "1.5rem", marginTop: "1rem" }}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            fontSize: "0.7rem",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          Contraseña{" "}
          <span style={{ color: "var(--accent)", opacity: 0.7 }}>
            (hexadecimal)
          </span>
        </label>
        <input
          id="password"
          type="password"
          className="input-field"
          placeholder="a1b2c3d4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={isLoading}
          style={
            passwordError
              ? { borderColor: "var(--error)" }
              : {}
          }
        />
        {passwordError && (
          <p
            style={{
              marginTop: "0.375rem",
              fontSize: "0.72rem",
              color: "var(--error)",
            }}
          >
            {passwordError}
          </p>
        )}
      </div>

      {error && (
        <div className="error-box fade-in" style={{ marginBottom: "1.25rem" }}>
          <span style={{ marginRight: "0.5rem" }}>⚠</span>
          {error}
        </div>
      )}

      <button
        id="login-submit"
        type="submit"
        className="btn-primary"
        disabled={!canSubmit}
      >
        {isLoading ? (
          <span className="loading-pulse">Autenticando...</span>
        ) : (
          "→ Iniciar Sesión"
        )}
      </button>

      <div
        style={{
          marginTop: "1.25rem",
          padding: "0.75rem",
          background: "rgba(34,211,238,0.04)",
          border: "1px solid rgba(34,211,238,0.1)",
          borderRadius: "2px",
          fontSize: "0.72rem",
          color: "var(--text-secondary)",
          textAlign: "center",
        }}
      >
        <span style={{ color: "var(--accent)" }}>admin</span>
        {" / "}
        <span style={{ color: "var(--accent)", letterSpacing: "0.05em" }}>
          a1b2c3d4
        </span>
      </div>
    </form>
  );
}
