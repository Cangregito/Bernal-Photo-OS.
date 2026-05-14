import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  sessionType?: string;
  source?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContactFormData;

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, email y mensaje' },
        { status: 400 }
      );
    }

    // Send notification email to the photographer
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'Bernal Photo <admin@bernalphoto.com>',
        to: 'admin@bernalphoto.com', // The photographer receives the lead
        subject: `🎯 Nuevo Lead: ${body.name} — ${body.sessionType || 'Sesión'}`,
        html: `
          <div style="font-family: Georgia, serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 24px; font-weight: 300; color: #111; border-bottom: 1px solid #eee; padding-bottom: 16px;">
              Nuevo Mensaje de Contacto
            </h1>
            
            <table style="width: 100%; margin-top: 24px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px; vertical-align: top;">Nombre:</td>
                <td style="padding: 8px 0;">${body.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${body.email}" style="color: #059669;">${body.email}</a></td>
              </tr>
              ${body.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Teléfono:</td><td style="padding: 8px 0;">${body.phone}</td></tr>` : ''}
              ${body.eventDate ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Fecha del evento:</td><td style="padding: 8px 0;">${body.eventDate}</td></tr>` : ''}
              ${body.sessionType ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Tipo de sesión:</td><td style="padding: 8px 0;">${body.sessionType}</td></tr>` : ''}
              ${body.source ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">¿Cómo nos encontró?:</td><td style="padding: 8px 0;">${body.source}</td></tr>` : ''}
            </table>
            
            <div style="margin-top: 24px; padding: 20px; background: #f9f9f9; border-left: 3px solid #059669;">
              <p style="font-weight: bold; margin: 0 0 8px 0;">Mensaje:</p>
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${body.message}</p>
            </div>
            
            <p style="margin-top: 32px; font-size: 12px; color: #999;">
              Enviado desde el formulario de contacto de Bernal Photo OS
            </p>
          </div>
        `,
      });
    } else {
      console.log('[CONTACT MOCK] Nuevo lead:', body);
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
    });
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
