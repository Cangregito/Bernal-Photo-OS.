import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type AppRole = 'admin' | 'staff';

type ProfileSettings = {
  twoFactorAuth?: boolean;
};

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://dummy.supabase.co') {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore writes when running in a read-only server context.
        }
      },
    },
  });
}

export async function logServerSecurityEvent(params: {
  userId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const supabase = await createServerSupabaseClient();

  if (!supabase || !params.userId) {
    return;
  }

  const { error } = await supabase.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    entity: 'profile',
    entity_id: params.userId,
    metadata: params.metadata ?? {},
    ip_address: params.ipAddress,
  });

  if (error) {
    console.error('Error creating server security audit log:', error);
  }
}

export async function getServerAuthContext() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      isConfigured: false,
      userId: null,
      role: 'admin' as const,
      twoFactorAuthEnabled: false,
      currentAal: null,
      nextAal: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      userId: null,
      role: null,
      twoFactorAuthEnabled: false,
      currentAal: null,
      nextAal: null,
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(
    session?.access_token
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, settings')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role === 'admin' || profile?.role === 'staff' ? profile.role : null;
  const settings = (profile?.settings ?? {}) as ProfileSettings;

  return {
    isConfigured: true,
    userId: user.id,
    role,
    twoFactorAuthEnabled: settings.twoFactorAuth === true,
    currentAal: assurance?.currentLevel ?? null,
    nextAal: assurance?.nextLevel ?? null,
  };
}