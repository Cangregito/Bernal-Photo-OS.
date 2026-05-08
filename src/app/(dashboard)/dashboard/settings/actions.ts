'use server';



export async function sendTestEmailAction(type: 'summary' | 'reminder' | 'alert') {
  const resendApiKey = process.env.RESEND_API_KEY;
  const testEmail = process.env.RESEND_TEST_EMAIL || 'jassiel.rr1502@gmail.com';

  if (!resendApiKey) return { success: false, error: 'RESEND_API_KEY no configurado' };

  let subject = '';
  let content = '';

  if (type === 'summary') {
    subject = '📊 Resumen Diario — Bernal Photo OS';
    content = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #111;">Resumen de Actividad</h2>
        <p>Aquí tienes lo que pasó hoy en tu estudio:</p>
        <ul>
          <li><strong>2</strong> Nuevos contratos firmados</li>
          <li><strong>1</strong> Cotización enviada</li>
          <li><strong>3</strong> Sesiones programadas para esta semana</li>
        </ul>
        <p style="color: #666; font-size: 12px;">Este es un correo de prueba de tus ajustes de notificación.</p>
      </div>
    `;
  } else if (type === 'reminder') {
    subject = '⏰ Recordatorio: Sesión en 24 horas';
    content = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #111;">¡Mañana tienes una sesión!</h2>
        <p><strong>Evento:</strong> Boda - Familia García</p>
        <p><strong>Hora:</strong> 16:00 hrs</p>
        <p><strong>Lugar:</strong> Hacienda Los Pinos</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Este es un recordatorio automático de prueba.</p>
      </div>
    `;
  } else {
    subject = '✍️ Contrato Firmado: Ana López';
    content = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #059669;">¡Nuevo Contrato Sellado!</h2>
        <p>El cliente <strong>Ana López</strong> acaba de firmar su contrato legalmente con el sello SHA-256.</p>
        <p>La sesión ha sido confirmada automáticamente en tu calendario.</p>
        <p style="color: #666; font-size: 12px;">Esta es una alerta de prueba de firma de contrato.</p>
      </div>
    `;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bernal Photo <onboarding@resend.dev>',
        to: [testEmail],
        subject: `[PRUEBA] ${subject}`,
        html: `
          <div style="background: #f9fafb; padding: 40px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: #111827; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 18px; letter-spacing: 2px;">BERNAL PHOTO OS</h1>
              </div>
              ${content}
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) throw new Error('Error al enviar con Resend');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
