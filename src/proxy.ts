import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no hay Supabase configurado (dev sin conexión), permitir acceso
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://dummy.supabase.co') {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Proteger rutas del dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validar tokens de firma efímeros
  if (request.nextUrl.pathname.startsWith('/sign/') && request.nextUrl.pathname !== '/sign/expired') {
    const token = request.nextUrl.pathname.split('/sign/')[1];
    if (token) {
      const { data: tokenData } = await supabase
        .from('signing_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (!tokenData || tokenData.is_used || new Date(tokenData.expires_at) < new Date()) {
        return NextResponse.redirect(new URL('/sign/expired', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sign/:path*',
  ],
};
