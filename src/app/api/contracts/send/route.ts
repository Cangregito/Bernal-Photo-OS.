import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { emailService } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { contractId, clientId, clientName, clientEmail } = await request.json();

    if (!contractId || !clientId || !clientEmail) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
              // The `set` method was called from a Server Component.
            }
          },
        },
      }
    );

    // Verificar permisos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
