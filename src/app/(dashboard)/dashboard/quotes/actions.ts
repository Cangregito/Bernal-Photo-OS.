'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseQuoteRepository } from '../../../../infrastructure/repositories/SupabaseQuoteRepository';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';

const quoteRepository = new SupabaseQuoteRepository();
const clientRepository = new SupabaseClientRepository();

interface QuoteItemInput {
  name: string;
  price: number;
  quantity: number;
}

export async function createQuoteAction(formData: {
  clientId: string;
  items: QuoteItemInput[];
}) {
  try {
    const validItems = formData.items.filter(i => i.name && i.price > 0);
    if (validItems.length === 0) return { success: false, error: 'No hay servicios válidos' };

    const total = validItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newQuote = await quoteRepository.create({
      clientId: formData.clientId,
      items: validItems,
      totalAmount: total,
      status: 'draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days, stored in app only
    });

    // Log the event for notifications
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const client = await clientRepository.getById(formData.clientId);
      
      await supabase.from('audit_logs').insert({
        action: 'created',
        entity: 'quote',
        entity_id: newQuote.id,
        metadata: { 
          clientName: client ? `${client.firstName} ${client.lastName}` : 'Cliente',
          totalAmount: total
        }
      });
    } catch (logErr) {
      console.error('[AuditLog] Error logging quote:', logErr);
    }

    revalidatePath('/dashboard/quotes');
    revalidatePath('/dashboard/clients');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating quote:', error);
    return { success: false, error: message };
  }
}

export async function sendQuoteEmailAction(quoteId: string) {
  try {
    // Fetch quote and client data
    const quote = await quoteRepository.getById(quoteId);
    if (!quote) return { success: false, error: 'Cotización no encontrada' };

    const client = await clientRepository.getById(quote.clientId);
    if (!client) return { success: false, error: 'Cliente no encontrado' };

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

    // Build items HTML table
    const itemsHtml = quote.items.map(item => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #374151;">${item.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #374151; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #374151; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #111827; font-weight: 600; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 32px 40px;">
              <p style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 3px;">BERNAL PHOTO</p>
              <p style="margin: 6px 0 0; font-size: 10px; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase;">Fotografía Profesional · Estudio Creativo</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Cotización Personalizada</p>
              <h1 style="margin: 0 0 24px; font-size: 26px; color: #111827; font-weight: 700;">Hola, ${client.firstName} 👋</h1>
              <p style="margin: 0 0 28px; font-size: 15px; color: #4b5563; line-height: 1.6;">
                Con mucho gusto hemos preparado la siguiente cotización para ti. Aquí encontrarás el desglose completo de los servicios fotográficos seleccionados.
              </p>

              <!-- Quote Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Cant.</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Precio</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background-color: #111827;">
                    <td colspan="3" style="padding: 14px 12px; font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Total</td>
                    <td style="padding: 14px 12px; font-size: 16px; font-weight: 800; color: #ffffff; text-align: right;">${formatCurrency(quote.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">
                📅 Esta cotización es válida hasta: <strong style="color: #111827;">${new Date(quote.validUntil).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
              <p style="margin: 0 0 32px; font-size: 13px; color: #6b7280;">
                ¿Tienes preguntas? Responde a este correo o escríbenos directamente.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #111827; border-radius: 8px;">
                    <a href="mailto:admin@bernalphoto.com?subject=Aceptar%20cotización" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.5px;">
                      ✉ Contactar para confirmar
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
                Con cariño,<br>
                <strong>Equipo Bernal Photo</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                © ${new Date().getFullYear()} Bernal Photo · Fotografía Profesional<br>
                Este correo contiene una cotización oficial preparada exclusivamente para ti.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return { success: false, error: 'RESEND_API_KEY no configurado' };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bernal Photo <admin@bernalphoto.com>',
        to: [client.email],
        subject: `Tu Cotización de Bernal Photo — ${formatCurrency(quote.totalAmount)}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al enviar el correo');
    }

    // Mark quote as 'sent'
    await quoteRepository.update(quoteId, { status: 'sent' });
    revalidatePath('/dashboard/quotes');

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error sending quote email:', error);
    return { success: false, error: message };
  }
}
