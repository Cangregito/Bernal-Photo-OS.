import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { createServerSupabaseClient, getServerAuthContext } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { contractId, clientId, clientName, clientEmail } = await request.json();

    if (!contractId || !clientId || !clientEmail) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const auth = await getServerAuthContext();

    if (auth.isConfigured && !auth.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (auth.isConfigured && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 });
    }

    if (auth.isConfigured && auth.twoFactorAuthEnabled && auth.currentAal !== 'aal2') {
      return NextResponse.json({ error: 'Se requiere MFA para completar esta acción' }, { status: 403 });
    }

    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 503 });
    }

    // Generar un token único y seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // Insertar en signing_tokens
    const { error: tokenError } = await supabase
      .from('signing_tokens')
      .insert({
        token,
        contract_id: contractId,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });

    if (tokenError) {
      console.error('Error insertando token:', tokenError);
      return NextResponse.json({ error: 'Error generando enlace de firma' }, { status: 500 });
    }

    // Actualizar estado del contrato a 'sent'
    await supabase
      .from('contracts')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', contractId);

    // Crear la URL absoluta
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const tokenUrl = `${baseUrl}/sign/${token}`;

    // Enviar correo de firma al cliente
    await emailService.sendContractSignatureLink({
      to: clientEmail,
      clientName: clientName || 'Cliente',
      tokenUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Enlace generado y enviado por correo',
      tokenUrl
    });
  } catch (error) {
    console.error('Error enviando contrato:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
