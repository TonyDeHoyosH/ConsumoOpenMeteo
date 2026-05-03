import { WeatherDay } from '@/lib/weather';

interface WeatherTableProps {
  data: WeatherDay[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function WeatherTable({ data, currentPage, itemsPerPage, onPageChange }: WeatherTableProps) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIdx = currentPage * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedData = data.slice(startIdx, endIdx);
  const maxPage = totalPages > 0 ? totalPages - 1 : 0;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table">
          <thead>
            <tr className="border-b-2 border-cyan-400">
              <th className="px-4 py-3 text-cyan-400 font-mono whitespace-nowrap">Fecha</th>
              <th className="px-4 py-3 text-cyan-400 font-mono text-right whitespace-nowrap">Temp Máx</th>
              <th className="px-4 py-3 text-cyan-400 font-mono text-right whitespace-nowrap">Temp Mín</th>
              <th className="px-4 py-3 text-cyan-400 font-mono whitespace-nowrap">Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((day, idx) => (
              <tr key={idx} className="border-b border-slate-800 table-row hover:bg-slate-850 transition">
                <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">{day.date}</td>
                <td className="px-4 py-3 text-slate-300 font-mono text-right whitespace-nowrap">{day.tempMax.toFixed(1)}°C</td>
                <td className="px-4 py-3 text-slate-300 font-mono text-right whitespace-nowrap">{day.tempMin.toFixed(1)}°C</td>
                <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">{day.weatherDescription}</td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-mono">
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data.length > 0 && (
        <>
          <div className="text-center py-4 border-t border-slate-800 text-slate-400 text-sm font-mono">
            Página {currentPage + 1} de {totalPages} ({data.length} días disponibles)
          </div>
          
          <div className="flex justify-between items-center p-6 border-t border-slate-800">
            <button
              aria-label="Cargar página anterior"
              aria-disabled={currentPage === 0}
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-6 py-2 border border-cyan-400 text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-400 hover:text-slate-950 transition font-mono button"
            >
              ← Anterior
            </button>

            <button
              aria-label="Cargar página siguiente"
              aria-disabled={currentPage === maxPage}
              onClick={() => onPageChange(Math.min(maxPage, currentPage + 1))}
              disabled={currentPage === maxPage}
              className="px-6 py-2 border border-cyan-400 text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-400 hover:text-slate-950 transition font-mono button"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
