import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerAuthContext } from '@/lib/auth';

type SecurityAuditEvent = 'login_success' | 'mfa_verified';

type SecurityAuditRequest = {
  event?: SecurityAuditEvent | 'logout';
  metadata?: Record<string, unknown>;
};

const eventMap: Record<SecurityAuditEvent | 'logout', { action: string; entity: string }> = {
  login_success: { action: 'login', entity: 'profile' },
  mfa_verified: { action: 'mfa_verified', entity: 'profile' },
  logout: { action: 'logout', entity: 'profile' },
};

export async function POST(request: NextRequest) {
  try {
    const auth = await getServerAuthContext();

    if (auth.isConfigured && !auth.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 503 });
    }

    const body = (await request.json()) as SecurityAuditRequest;

    if (!body.event || !(body.event in eventMap)) {
      return NextResponse.json({ error: 'Evento inválido' }, { status: 400 });
    }

    const mapping = eventMap[body.event];
    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;

    const { error } = await supabase.from('audit_logs').insert({
      user_id: auth.userId,
      action: mapping.action,
      entity: mapping.entity,
      entity_id: auth.userId,
      metadata: {
        ...(body.metadata ?? {}),
        userAgent,
      },
      ip_address: ipAddress,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating security audit log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}