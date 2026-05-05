'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const isValidHex = (val: string) => /^[0-9a-fA-F]{6,}$/.test(val);

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<{ message: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !isValidHex(password)) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const err = await res.json();
        setError({ message: err.error || 'Credenciales inválidas' });
        setStatus('error');
      }
    } catch {
      setError({ message: 'No se puede conectar. Verifica tu conexión.' });
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {justRegistered && (
        <div className="border-l-4 border-cyan-400 bg-cyan-400/10 p-3 text-cyan-400 text-sm font-mono">
          ✓ Registro exitoso. Inicia sesión con tus credenciales.
        </div>
      )}

      <div>
        <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-widest">
          Email
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
          tabIndex={1}
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-widest">
          Password <span className="text-slate-600">(hexadecimal)</span>
        </label>
        <input
          type="password"
          placeholder="ej: a1b2c3d4e5f6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === 'loading'}
          className={`w-full px-4 py-2 bg-slate-900 border text-cyan-400 placeholder-slate-600 focus:outline-none font-mono ${
            password
              ? isValidHex(password)
                ? 'border-cyan-400'
                : 'border-red-500'
              : 'border-slate-700'
          }`}
          tabIndex={2}
        />
        <div className="mt-1 text-xs font-mono min-h-[1.2rem]">
          {password && (
            <span className={isValidHex(password) ? 'text-cyan-400' : 'text-red-400'}>
              {isValidHex(password)
                ? '✓ Formato hexadecimal válido'
                : '✗ Solo caracteres hex (0-9, a-f), mínimo 6'}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="border-l-4 border-red-500 bg-red-500/10 p-3 text-red-400 text-sm font-mono">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={!email || !isValidHex(password) || status === 'loading'}
        tabIndex={3}
        className="w-full py-3 bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-cyan-400 transition cursor-pointer disabled:cursor-not-allowed font-mono"
      >
        {status === 'loading' ? 'Verificando...' : 'Iniciar Sesión'}
      </button>

      <p className="text-center text-slate-500 text-sm font-mono">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="text-cyan-400 hover:text-cyan-300 underline">
          Regístrate aquí
        </a>
      </p>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="text-slate-400 font-mono">Cargando...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
