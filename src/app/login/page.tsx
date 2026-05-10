'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const router = useRouter();
  const redirectTo = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('redirect') || '/dashboard')
    : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Si Supabase no está configurado (dev), simular login
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://dummy.supabase.co') {
        await new Promise(r => setTimeout(r, 800));
        router.push(redirectTo);
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos.'
            : authError.message
        );
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [{ data: profile }, { data: assurance }] = await Promise.all([
          supabase.from('profiles').select('role, settings').eq('id', user.id).maybeSingle(),
          supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        ]);

        const role = profile?.role;

        await fetch('/api/security/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'login_success',
            metadata: {
              role: role ?? 'unknown',
              redirectTo,
            },
          }),
        }).catch(() => undefined);

        if (role === 'admin' && assurance?.currentLevel !== 'aal2') {
          router.push(`/mfa?next=${encodeURIComponent(redirectTo)}`);
          router.refresh();
          return;
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Panel Izquierdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-wider">BERNAL PHOTO</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Sistema<br />Operativo<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Fotográfico</span>
            </h1>
            <p className="text-zinc-400 mt-6 text-lg max-w-md leading-relaxed">
              Gestiona clientes, sesiones, cotizaciones y contratos con integridad documental SHA-256.
            </p>
          </div>

          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} Bernal Photo OS · v1.0.0
          </p>
        </div>
      </div>

      {/* Panel Derecho — Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Logo móvil */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wider">BERNAL PHOTO</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
            <p className="text-zinc-500 text-sm mt-2">Accede al panel de administración.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bernalphoto.com"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Acceder'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-700 mt-8">
            Protegido por Supabase Auth · SHA-256
          </p>
        </div>
      </div>
    </div>
  );
}
