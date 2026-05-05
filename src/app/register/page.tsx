import RegisterForm from '@/components/RegisterForm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Registro | Weather Security',
  description: 'Crea una nueva cuenta'
};

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (token) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            WEATHER SECURITY
          </h1>
          <p className="text-slate-400">Crear cuenta</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8">
          <RegisterForm />
        </div>

        <p className="text-center mt-4 text-slate-500 text-xs">
          🔒 Cookies HttpOnly · SameSite=Strict · bcrypt salt=10
        </p>
      </div>
    </main>
  );
}
