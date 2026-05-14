import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* read-only context */ }
        },
      },
    }
  );
}

export async function requireAuth() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return supabase;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof Error && err.message === 'Unauthorized';
}

export function handleError(err: unknown) {
  const message = getErrorMessage(err);
  const status = isUnauthorized(err) ? 401 : 500;
  return NextResponse.json({ error: message }, { status });
}
