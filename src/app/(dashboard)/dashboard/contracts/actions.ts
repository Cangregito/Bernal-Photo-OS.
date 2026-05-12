'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseContractRepository } from '../../../../infrastructure/repositories/SupabaseContractRepository';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';
import { SupabaseSessionRepository } from '../../../../infrastructure/repositories/SupabaseSessionRepository';
import crypto from 'crypto';

const contractRepository = new SupabaseContractRepository();
const clientRepository = new SupabaseClientRepository();
const sessionRepository = new SupabaseSessionRepository();

export async function createContractAction(formData: {
  clientId: string;
  quoteId?: string;
  content: string;
  sessionDate?: string;
  sessionType?: string;
  sessionLocation?: string;
}) {
  try {
    // Embed session metadata as a header line the signing API can parse
    const sessionMeta = formData.sessionDate
      ? `[SESSION_DATE:${formData.sessionDate}][SESSION_TYPE:${formData.sessionType || 'event'}][SESSION_LOCATION:${formData.sessionLocation || ''}]\n`
      : '';
    const fullContent = sessionMeta + formData.content;

    await contractRepository.create({
      clientId: formData.clientId,
      quoteId: formData.quoteId,
      content: fullContent,
      status: 'draft',
    });
    revalidatePath('/dashboard/contracts');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating contract:', error);
    return { success: false, error: message };
  }
}

export async function updateContractAction(
  contractId: string,
  formData: {
    content?: string;
    sessionDate?: string;
    sessionType?: string;
    sessionLocation?: string;
  }
) {
  try {
    let newContent = formData.content;
    if (formData.content && formData.sessionDate) {
      const sessionMeta = `[SESSION_DATE:${formData.sessionDate}][SESSION_TYPE:${formData.sessionType || 'event'}][SESSION_LOCATION:${formData.sessionLocation || ''}]\n`;
      newContent = sessionMeta + formData.content;
    }

    await contractRepository.update(contractId, {
      ...(newContent && { content: newContent }),
    });
    revalidatePath('/dashboard/contracts');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating contract:', error);
    return { success: false, error: message };
  }
}

export async function deleteContractAction(contractId: string) {
  try {
    await contractRepository.delete(contractId);
    revalidatePath('/dashboard/contracts');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error deleting contract:', error);
    return { success: false, error: message };
  }
}

export async function createSessionFromContractAction(contractId: string, overrides?: {
  date?: string;
  type?: string;
  location?: string;
}) {
  try {
    const contract = await contractRepository.getById(contractId);
    if (!contract) return { success: false, error: 'Contrato no encontrado' };

    // Parse metadata from content
    const firstLine = contract.content.split('\n')[0];
    const dateMatch = firstLine.match(/\[SESSION_DATE:([^\]]+)\]/);
    const typeMatch = firstLine.match(/\[SESSION_TYPE:([^\]]+)\]/);
    const locationMatch = firstLine.match(/\[SESSION_LOCATION:([^\]]*)\]/);

    const dateStr = overrides?.date || dateMatch?.[1];
    const typeStr = overrides?.type || typeMatch?.[1] || 'event';
    const locationStr = overrides?.location ?? (locationMatch?.[1] || undefined);

    if (!dateStr) {
      return { success: false, error: 'El contrato no tiene fecha de sesión. Edita la sesión manualmente.' };
    }

    try {
      await sessionRepository.create({
        clientId: contract.clientId,
        date: new Date(dateStr),
        type: typeStr as 'wedding' | 'engagement' | 'portrait' | 'event',
        status: 'confirmed',
        location: locationStr || undefined,
        notes: `Sesión creada desde contrato firmado (ID: ${contractId})`,
      });
    } catch (locErr: unknown) {
      const locMessage = locErr instanceof Error ? locErr.message : String(locErr);
      if (locMessage.includes('location')) {
        // Retry without location (column not yet migrated)
        await sessionRepository.create({
          clientId: contract.clientId,
          date: new Date(dateStr),
          type: typeStr as 'wedding' | 'engagement' | 'portrait' | 'event',
          status: 'confirmed',
          notes: `Sesión creada desde contrato firmado (ID: ${contractId})`,
        });
      } else {
        throw locErr;
      }
    }

    revalidatePath('/dashboard/sessions');
    revalidatePath('/dashboard/contracts');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating session from contract:', error);
    return { success: false, error: message };
  }
}

export async function sendContractLinkAction(contractId: string) {
  try {
    const contract = await contractRepository.getById(contractId);
    if (!contract) return { success: false, error: 'Contrato no encontrado' };

    const client = await clientRepository.getById(contract.clientId);
    if (!client) return { success: false, error: 'Cliente no encontrado' };

    const supabaseModule = await import('../../../../infrastructure/supabase/client');
    const { supabase } = supabaseModule;

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: tokenError } = await supabase
      .from('signing_tokens')
      .insert({
        token,
        contract_id: contractId,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (tokenError) throw new Error('Error creando token de firma: ' + tokenError.message);

    await contractRepository.update(contractId, { status: 'sent' });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const signingUrl = `${baseUrl}/sign/${token}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return { success: false, error: 'RESEND_API_KEY no configurado' };

    // Enviar directamente al cliente
    const recipientEmail = client.email;
    const subjectPrefix = '';

    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr>
          <td style="background:#111827;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:3px;">BERNAL PHOTO</p>
            <p style="margin:6px 0 0;font-size:10px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Fotografía Profesional · Estudio Creativo</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 20px;font-size:24px;color:#111827;font-weight:700;">Hola, ${client.firstName} 👋</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
              Tu contrato de prestación de servicios fotográficos con <strong>Bernal Photo</strong> está listo para ser revisado y firmado digitalmente.
            </p>
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:28px;">
              <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">⚠️ Enlace de un solo uso</p>
              <p style="margin:6px 0 0;font-size:12px;color:#b45309;">Expira en <strong>7 días</strong> y solo puede usarse una vez.</p>
            </div>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#059669;border-radius:8px;">
                  <a href="${signingUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">
                    ✍ Revisar y Firmar Contrato
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Si el botón no funciona:</p>
            <p style="margin:0 0 28px;font-size:11px;color:#6b7280;word-break:break-all;">${signingUrl}</p>
            <p style="margin:0;font-size:14px;color:#374151;">Con cariño,<br><strong>Equipo Bernal Photo</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} Bernal Photo · SHA-256</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Bernal Photo <admin@bernalphoto.com>',
        to: [recipientEmail],
        subject: `${subjectPrefix}Firma tu contrato con Bernal Photo`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al enviar el correo');
    }

    revalidatePath('/dashboard/contracts');
    return { success: true, signingUrl };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error sending contract link:', error);
    return { success: false, error: message };
  }
}
