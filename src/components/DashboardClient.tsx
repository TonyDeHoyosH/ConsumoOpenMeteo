'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WeatherDay } from '@/lib/weather';
import { LOCATIONS } from '@/lib/locations';
import WeatherTable from './WeatherTable';
import LocationSelector from './LocationSelector';

interface DashboardState {
  data: WeatherDay[];
  currentPage: number;
  itemsPerPage: number;
  status: 'idle' | 'loading' | 'error' | 'success';
  error: { message: string } | null;
}

export default function DashboardClient() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].id);
  const [state, setState] = useState<DashboardState>({
    data: [],
    currentPage: 0,
    itemsPerPage: 3,
    status: 'idle',
    error: null,
  });

  const fetchData = async () => {
    setState(s => ({ ...s, status: 'loading', error: null }));
    try {
      const location = LOCATIONS.find(l => l.id === selectedLocation)!;
      const res = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Error al obtener datos');
      }
      const data = await res.json();
      setState(s => ({ ...s, data, currentPage: 0, status: 'success' }));
    } catch (e: any) {
      setState(s => ({ ...s, status: 'error', error: { message: e.message || 'Error desconocido' } }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const activeLocation = LOCATIONS.find(l => l.id === selectedLocation)!;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 dashboard">
      <header className="border-b border-slate-800 p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 font-display">
              WEATHER DASHBOARD
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-mono">
              {activeLocation.name} ({activeLocation.lat}°N, {activeLocation.lon}°W)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <LocationSelector 
              selected={selectedLocation} 
              onChange={setSelectedLocation} 
            />
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-950 transition font-mono"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {state.status === 'loading' && (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4 text-cyan-400 text-4xl font-mono">
              ⟳
            </div>
            <p className="text-slate-400 font-mono">Cargando datos meteorológicos...</p>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="bg-slate-900 border-l-4 border-red-500 p-6 m-6">
          <h3 className="text-red-400 font-bold mb-2 font-mono">Error</h3>
          <p className="text-red-300 mb-4 font-mono">{state.error?.message || 'El servicio está lento...'}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 border border-red-500 text-red-400 hover:bg-red-500 hover:text-slate-950 transition font-mono"
          >
            Reintentar
          </button>
        </div>
      )}

      {state.status === 'success' && (
        <div className="data-table">
          <WeatherTable 
            data={state.data} 
            currentPage={state.currentPage} 
            itemsPerPage={state.itemsPerPage} 
            onPageChange={(page) => setState(s => ({ ...s, currentPage: page }))}
          />
        </div>
      )}
    </div>
  );
}
