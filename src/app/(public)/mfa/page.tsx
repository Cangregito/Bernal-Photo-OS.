'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, Shield, Smartphone } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

type MfaMode = 'loading' | 'setup' | 'verify' | 'active';

type TotpFactor = {
  id: string;
  factor_type: 'totp';
  status: 'verified' | 'unverified';
  friendly_name?: string;
  created_at: string;
  updated_at: string;
};

export default function MfaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  const [mode, setMode] = useState<MfaMode>('loading');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://dummy.supabase.co';

  async function refreshState() {
    if (!hasSupabase) {
      router.replace(nextPath);
      return;
    }

    const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(nextPath)}`);
      return;
    }

    const [{ data: profile }, { data: factors }, { data: assurance }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

    if (profile?.role !== 'admin') {
      router.replace(nextPath);
      return;
    }

    const verifiedFactorId = Array.isArray(factors?.totp) && factors.totp.length > 0
      ? String((factors.totp[0] as { id: string }).id)
      : null;

    if (assurance?.currentLevel === 'aal2') {
      setMode('active');
      setFactorId(verifiedFactorId);
      setQrCode(null);
      setSecret(null);
      setLoading(false);
      return;
    }

    if (verifiedFactorId) {
      setMode('verify');
      setFactorId(verifiedFactorId);
      setQrCode(null);
      setSecret(null);
      setLoading(false);
      return;
    }

    setMode('setup');
    setFactorId(verifiedFactorId);
    setLoading(false);
  }

  useEffect(() => {
    void refreshState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSupabase, nextPath]);

  const startEnrollment = async () => {
    if (!hasSupabase) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        throw factorsError;
      }

      const staleUnverifiedFactors = (factorsData?.all ?? []).filter(
        (factor) => factor.factor_type === 'totp' && factor.status === 'unverified'
      );

      for (const factor of staleUnverifiedFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Bernal Photo Admin',
        issuer: 'Bernal Photo',
      });

      if (enrollError || data?.type !== 'totp') {
        throw enrollError ?? new Error('No se pudo crear el factor TOTP.');
      }

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setMessage('Escanea el QR en Google Authenticator, 1Password o Authy y confirma el código de 6 dígitos.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'No fue posible iniciar la configuración MFA.');
    } finally {
      setSubmitting(false);
    }
  };

  const enableOrVerifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!factorId || !hasSupabase) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) {
        throw challengeError;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        throw verifyError;
      }

      await fetch('/api/security/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'mfa_verified',
          metadata: {
            nextPath,
            factorType: 'totp',
          },
        }),
      }).catch(() => undefined);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileReadError } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (profileReadError) {
          throw profileReadError;
        }

        const nextSettings = {
          ...(profile?.settings ?? {}),
          twoFactorAuth: true,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            settings: nextSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          throw profileError;
        }
      }

      setMode('active');
      setCode('');
      setQrCode(null);
      setSecret(null);
      setMessage('MFA activado correctamente. Redirigiendo al panel...');

      setTimeout(() => {
        router.push(nextPath);
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'No fue posible verificar el código MFA.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/20">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Administrador seguro</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Autenticación multifactor</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Refuerza el acceso al panel administrativo con un código temporal generado por tu app autenticadora.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {mode === 'setup' && (
          <section className="mt-8 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <div className="flex items-center gap-3 text-zinc-200">
                <Smartphone className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold">Paso 1: crear el factor TOTP</h2>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                Usa Google Authenticator, Authy, 1Password o cualquier app compatible con TOTP.
              </p>

              {!qrCode ? (
                <button
                  onClick={startEnrollment}
                  disabled={submitting}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
                >
                  {submitting ? 'Preparando QR...' : 'Comenzar configuración'}
                </button>
              ) : (
                <div className="mt-6 grid gap-6 md:grid-cols-[220px,1fr]">
                  <div className="rounded-2xl border border-zinc-800 bg-white p-4">
                    <img src={qrCode} alt="Código QR para MFA" className="h-full w-full" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Clave manual</p>
                      <p className="mt-2 break-all rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-200">
                        {secret}
                      </p>
                    </div>
                    <form onSubmit={enableOrVerifyMfa} className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-300">Paso 2: ingresa el código de 6 dígitos</label>
                      <input
                        value={code}
                        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-lg tracking-[0.3em] text-white outline-none transition-colors focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={submitting || code.length !== 6}
                        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
                      >
                        {submitting ? 'Verificando...' : 'Activar MFA'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {mode === 'verify' && (
          <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h2 className="text-sm font-semibold text-zinc-200">Verifica tu código MFA para continuar</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Tu cuenta de administrador ya tiene MFA activo. Ingresa el código actual de tu app autenticadora para elevar la sesión a AAL2.
            </p>
            <form onSubmit={enableOrVerifyMfa} className="mt-5 space-y-3">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-lg tracking-[0.3em] text-white outline-none transition-colors focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
              >
                {submitting ? 'Verificando...' : 'Validar y entrar'}
              </button>
            </form>
          </section>
        )}

        {mode === 'active' && (
          <section className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h2 className="text-sm font-semibold text-emerald-300">MFA activo</h2>
            <p className="mt-3 text-sm text-zinc-300">
              Tu sesión actual ya fue verificada con un segundo factor. El MFA es obligatorio para cuentas admin.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  router.push(nextPath);
                  router.refresh();
                }}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Volver al panel
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}