'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const isValidHex = (val: string) => /^[0-9a-fA-F]{6,}$/.test(val);

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ message: string; details?: Array<{ message: string }> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordValid = isValidHex(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = Boolean(email && username && passwordValid && passwordsMatch && !isLoading);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setErrors(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ message: 'Email o username ya están registrados' });
          return;
        }
        if (response.status === 400) {
          const data = await response.json();
          setErrors({ message: 'Validación fallida', details: data.details });
          return;
        }
        throw new Error(`Error ${response.status}`);
      }

      router.push('/login?registered=true');

    } catch {
      setErrors({ message: 'Error en registro. Intenta de nuevo' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-widest">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
          placeholder="tu@email.com"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-widest">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
          placeholder="usuario123"
        />
        <p className="text-xs text-slate-600 mt-1 font-mono">3-20 caracteres, alfanuméricos y _</p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-widest">
          Password <span className="text-slate-600">(hexadecimal)</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-slate-950 border text-cyan-400 placeholder-slate-600 focus:outline-none font-mono ${
              password
                ? passwordValid
                  ? 'border-cyan-400'
                  : 'border-red-500'
                : 'border-slate-700'
            }`}
            placeholder="ej: a1b2c3d4e5f6"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-slate-500 hover:text-cyan-400 text-xs font-mono"
          >
            {showPassword ? 'ocultar' : 'ver'}
          </button>
        </div>
        <div className="mt-1 text-xs font-mono min-h-[1.2rem]">
          {password && (
            <span className={passwordValid ? 'text-cyan-400' : 'text-red-400'}>
              {passwordValid
                ? '✓ Formato hexadecimal válido'
                : '✗ Solo caracteres hex (0-9, a-f), mínimo 6'}
            </span>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-widest">
          Confirmar Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-slate-950 border text-cyan-400 placeholder-slate-600 focus:outline-none font-mono ${
            confirmPassword
              ? passwordsMatch
                ? 'border-cyan-400'
                : 'border-red-500'
              : 'border-slate-700'
          }`}
          placeholder="Repite tu password hex"
        />
        <div className="mt-1 text-xs font-mono min-h-[1.2rem]">
          {confirmPassword && (
            <span className={passwordsMatch ? 'text-cyan-400' : 'text-red-400'}>
              {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ No coinciden'}
            </span>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors && (
        <div className="border-l-4 border-red-500 bg-red-500/10 p-3 text-red-400 text-sm font-mono">
          <p className="font-bold">{errors.message}</p>
          {errors.details && (
            <ul className="mt-1 text-xs space-y-0.5">
              {errors.details.map((err, idx) => (
                <li key={idx}>• {err.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full py-3 bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-cyan-400 transition cursor-pointer disabled:cursor-not-allowed font-mono"
      >
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>

      <p className="text-center text-slate-500 text-sm font-mono">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-cyan-400 hover:text-cyan-300 underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
