import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-popover/80 p-8 shadow-2xl shadow-black/20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Acceso denegado</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Esta cuenta no tiene permisos de administrador.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Iniciaste sesión correctamente, pero tu perfil no tiene acceso al panel administrativo.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:text-foreground"
          >
            Cambiar de cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}