import { NextRequest, NextResponse } from 'next/server';
import { SignContract } from '@/application/use-cases/contract/SignContract';
import { SupabaseContractRepository } from '@/infrastructure/repositories/SupabaseContractRepository';
import { SupabaseSessionRepository } from '@/infrastructure/repositories/SupabaseSessionRepository';
import { supabase } from '@/infrastructure/supabase/client';

const contractRepo = new SupabaseContractRepository();
const sessionRepo = new SupabaseSessionRepository();

export async function POST(request: NextRequest) {
  try {
    const { token, signatureBase64 } = await request.json();

    if (!token || !signatureBase64) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // 1. Validate the signing token
    const { data: tokenData, error: tokenError } = await supabase
      .from('signing_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Enlace inválido o no encontrado' }, { status: 404 });
    }

    if (tokenData.is_used) {
      return NextResponse.json({ error: 'El enlace ya ha sido utilizado' }, { status: 400 });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El enlace ha expirado' }, { status: 400 });
    }

    // 2. Get IP for legal record
    const ipAddress = request.headers.get('x-forwarded-for') || '0.0.0.0';

    // 3. Sign the contract (SHA-256 seal)
    const signUseCase = new SignContract(contractRepo);
    await signUseCase.execute({
      contractId: tokenData.contract_id,
      signatureBase64,
      ipAddress,
    });

    // 4. Mark token as used (one-time link)
    await supabase
      .from('signing_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // 5. Auto-create session from contract metadata
    try {
      const contract = await contractRepo.getById(tokenData.contract_id);
      if (contract) {
        const firstLine = contract.content.split('\n')[0];
        const dateMatch = firstLine.match(/\[SESSION_DATE:([^\]]+)\]/);
        const typeMatch = firstLine.match(/\[SESSION_TYPE:([^\]]+)\]/);
        const locationMatch = firstLine.match(/\[SESSION_LOCATION:([^\]]*)\]/);

        console.log('[Auto-session] First line:', firstLine);
        console.log('[Auto-session] Parsed date:', dateMatch?.[1]);
        console.log('[Auto-session] Parsed type:', typeMatch?.[1]);
        console.log('[Auto-session] Parsed location:', locationMatch?.[1]);

        if (dateMatch?.[1]) {
          const sessionDate = new Date(dateMatch[1]);
          const sessionType = (typeMatch?.[1] || 'event') as 'wedding' | 'engagement' | 'portrait' | 'event';
          const location = locationMatch?.[1] || undefined;

          try {
            // Try with location first
            await sessionRepo.create({
              clientId: contract.clientId,
              date: sessionDate,
              type: sessionType,
              status: 'confirmed',
              location,
              notes: `Sesión creada automáticamente al firmar el contrato (ID: ${contract.id})`,
            });
            console.log('[Auto-session] Session created successfully');
          } catch (locErr: unknown) {
            const locMessage = locErr instanceof Error ? locErr.message : String(locErr);
            // If location column doesn't exist yet, retry without it
            if (locMessage.includes('location')) {
              console.warn('[Auto-session] Location column missing, retrying without it...');
              await sessionRepo.create({
                clientId: contract.clientId,
                date: sessionDate,
                type: sessionType,
                status: 'confirmed',
                notes: `Sesión creada automáticamente al firmar el contrato (ID: ${contract.id})`,
              });
              console.log('[Auto-session] Session created without location');
            } else {
              throw locErr;
            }
          }
        } else {
          console.warn('[Auto-session] No SESSION_DATE found in contract content. Did the contract include a session date?');
        }
      }
    } catch (sessionErr: unknown) {
      const sessionMessage = sessionErr instanceof Error ? sessionErr.message : String(sessionErr);
      console.error('[Auto-session] Error creating session:', sessionMessage);
    }

    // 6. Log the event
    try {
      const contract = await contractRepo.getById(tokenData.contract_id);
      const client = contract ? await (new (await import('@/infrastructure/repositories/SupabaseClientRepository')).SupabaseClientRepository()).getById(contract.clientId) : null;
      
      await supabase.from('audit_logs').insert({
        action: 'signed',
        entity: 'contract',
        entity_id: tokenData.contract_id,
        metadata: { 
          clientName: client ? `${client.firstName} ${client.lastName}` : 'Cliente',
          contractId: tokenData.contract_id
        },
        ip_address: ipAddress
      });
    } catch (logErr) {
      console.error('[AuditLog] Error logging signature:', logErr);
    }

    // 7. Alert admin via email if enabled
    try {
      const { data: profiles } = await supabase.from('profiles').select('email, settings');
      const adminsToAlert = profiles?.filter(p => p.settings?.contractAlerts && p.email) || [];
      
      if (adminsToAlert.length > 0) {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const contract = await contractRepo.getById(tokenData.contract_id);
          const client = contract ? await (new (await import('@/infrastructure/repositories/SupabaseClientRepository')).SupabaseClientRepository()).getById(contract.clientId) : null;
          
          const alertHtml = `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #059669;">✍️ ¡Contrato Firmado!</h2>
              <p>El cliente <strong>${client ? `${client.firstName} ${client.lastName}` : 'Desconocido'}</strong> ha firmado el contrato.</p>
              <p>Se ha generado automáticamente una sesión en el panel.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/contracts" style="background: #111827; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">Ver en Dashboard</a>
            </div>
          `;

          for (const admin of adminsToAlert) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Bernal Photo <onboarding@resend.dev>',
                to: [admin.email],
                subject: `📢 Contrato Firmado: ${client ? `${client.firstName} ${client.lastName}` : 'Nuevo Cliente'}`,
                html: alertHtml,
              }),
            });
          }
        }
      }
    } catch (alertErr: unknown) {
      const alertMessage = alertErr instanceof Error ? alertErr.message : String(alertErr);
      console.error('[Admin-Alert] Error sending signature alert:', alertMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'Contrato firmado legalmente con SHA-256',
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error sellando contrato:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
