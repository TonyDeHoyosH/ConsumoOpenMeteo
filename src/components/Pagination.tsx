interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--border)",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      {/* Info */}
      <div
        style={{
          fontSize: "0.72rem",
          fontFamily: "IBM Plex Mono, monospace",
          color: "var(--text-secondary)",
          letterSpacing: "0.05em",
        }}
      >
        Mostrando{" "}
        <span style={{ color: "var(--accent)" }}>
          {startItem}–{endItem}
        </span>{" "}
        de{" "}
        <span style={{ color: "var(--accent)" }}>{totalItems}</span> días
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          id="pagination-prev"
          className="btn-ghost"
          onClick={onPrev}
          disabled={currentPage === 0}
          aria-label="Página anterior"
        >
          ← Anterior
        </button>

        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          <span style={{ color: "var(--accent)" }}>{currentPage + 1}</span>
          {" / "}
          {totalPages}
        </span>

        <button
          id="pagination-next"
          className="btn-ghost"
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
          aria-label="Página siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
