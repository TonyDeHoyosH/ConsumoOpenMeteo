'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'error'>('idle');
  const [error, setError] = useState<{message: string} | null>(null);
  const router = useRouter();

  const isValidHex = (hex: string) => /^[0-9a-fA-F]{6,}$/.test(hex);

  const handleLogin = async () => {
    if (!username || !password || !isValidHex(password)) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const err = await res.json();
        setError({ message: err.message || 'Credenciales inválidas' });
        setStatus('error');
      }
    } catch {
      setError({ message: 'No se puede conectar. Verifica tu conexión.' });
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800">
      <div className="text-center mb-8">
        <h1 className="text-[2.5rem] font-bold text-cyan-400 font-display tracking-tight mb-2 uppercase">
          Weather Security
        </h1>
        <p className="text-slate-400 text-[0.875rem] font-mono">
          Authentication Portal
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            tabIndex={1}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password (hexadecimal: a1b2c3d4)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 bg-slate-900 border text-cyan-400 placeholder-slate-600 focus:outline-none font-mono ${
              isValidHex(password)
                ? 'border-cyan-400'
                : password
                ? 'border-red-500'
                : 'border-slate-700'
            }`}
            tabIndex={2}
          />
          <div className="mt-2 text-[0.75rem] font-mono min-h-[1.25rem]">
            {password && (
              <div className={isValidHex(password) ? 'text-cyan-400' : 'text-red-500'}>
                {isValidHex(password)
                  ? '✓ Formato hexadecimal válido'
                  : '✗ Debe ser hexadecimal (a-f, 0-9)'}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-slate-900 border-l-4 border-red-500 p-4 text-red-400 text-[0.875rem] font-mono">
            {error.message}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={!username || !password || !isValidHex(password) || status === 'loading'}
          tabIndex={3}
          className="w-full py-3 bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-cyan-400 transition cursor-pointer disabled:cursor-not-allowed font-mono button"
        >
          {status === 'loading' ? 'Cargando...' : 'Login'}
        </button>
      </div>
    </div>
  );
}
