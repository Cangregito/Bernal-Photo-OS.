import { Resend } from 'resend';

// Inicializar cliente Resend con la variable de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// El correo verificado desde donde saldrán todos los envíos
// Asegúrate de configurar este dominio en Resend
const FROM_EMAIL = 'Bernal Photo <admin@bernalphoto.com>'; // Por defecto asume bernalphoto.com configurado

export interface SessionReminderPayload {
  to: string;
  clientName: string;
  sessionType: string;
  sessionDate: string;
  location?: string;
  daysUntil: number;
}

export interface ContractSignaturePayload {
  to: string;
  clientName: string;
  tokenUrl: string;
}

export const emailService = {
  /**
   * Envía un recordatorio de sesión próxima
   */
  async sendSessionReminder(payload: SessionReminderPayload) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[EMAIL MOCK] No RESEND_API_KEY. Recordatorio:', payload);
      return { id: 'mock-id' };
    }

    const { to, clientName, sessionType, sessionDate, location, daysUntil } = payload;
    
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Recordatorio de tu sesión de ${sessionType} en ${daysUntil} días`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-w-lg mx-auto p-4">
          <h1 style="color: #111;">Bernal Photo</h1>
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>Este es un recordatorio de que tu sesión fotográfica de <strong>${sessionType}</strong> es dentro de ${daysUntil} día(s).</p>
          <ul>
            <li><strong>Fecha:</strong> ${sessionDate}</li>
            ${location ? `<li><strong>Ubicación:</strong> ${location}</li>` : ''}
          </ul>
          <p>Por favor asegúrate de llegar con 10 minutos de anticipación. Si tienes alguna duda, puedes responder a este correo.</p>
          <p>Nos vemos pronto,<br>El equipo de Bernal Photo</p>
        </div>
      `,
    });
  },

  /**
   * Envía un enlace mágico para firmar un contrato
   */
  async sendContractSignatureLink(payload: ContractSignaturePayload) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[EMAIL MOCK] No RESEND_API_KEY. Envío de contrato:', payload);
      return { id: 'mock-id' };
    }

    const { to, clientName, tokenUrl } = payload;

    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Firma Requerida: Tu Contrato Fotográfico con Bernal Photo`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-w-lg mx-auto p-4">
          <h1 style="color: #111;">Bernal Photo</h1>
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>Tu contrato de prestación de servicios fotográficos está listo para ser firmado.</p>
          <p>Hemos generado un enlace mágico, único y cifrado para que puedas leer y firmar el contrato digitalmente. Este enlace expirará en 7 días y es de un solo uso.</p>
          
          <div style="margin: 30px 0;">
            <a href="${tokenUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Revisar y Firmar Contrato
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${tokenUrl}</p>
          <p>Saludos cordiales,<br>El equipo de Bernal Photo</p>
        </div>
      `,
    });
  }
};
