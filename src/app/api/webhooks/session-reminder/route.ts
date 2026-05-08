import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
/**
 * MAESTER §7: Webhook endpoint para n8n
 * 
 * n8n invoca este endpoint cuando detecta sesiones próximas.
 * El payload esperado contiene datos de la sesión y del cliente
 * para enviar recordatorios por email/WhatsApp.
 * 
 * Configuración en n8n:
 * 1. Trigger: Cron (diario a las 9:00 AM)
 * 2. Node: Supabase → SELECT sessions WHERE date BETWEEN NOW() AND NOW() + 2 days
 * 3. Node: HTTP Request → POST a este endpoint
 * 4. Node: Email/WhatsApp → Enviar recordatorio al cliente
 */

interface ReminderPayload {
  sessionId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  sessionDate: string;
  sessionType: string;
  location?: string;
}

// Clave secreta para validar que el request viene de n8n
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Validar autenticación del webhook
    const authHeader = request.headers.get('authorization');
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as ReminderPayload;

    // Validar payload
    if (!body.sessionId || !body.clientName || !body.sessionDate) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, clientName, sessionDate' },
        { status: 400 }
      );
    }

    const sessionDate = new Date(body.sessionDate);
    const now = new Date();
    const daysUntil = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Log del recordatorio
    console.log(`[n8n Reminder] Sesión "${body.sessionType}" para ${body.clientName} en ${daysUntil} día(s)`);

    // Enviar correo real usando Resend
    await emailService.sendSessionReminder({
      to: body.clientEmail,
      clientName: body.clientName,
      sessionType: body.sessionType,
      sessionDate: sessionDate.toLocaleDateString('es-MX'),
      location: body.location,
      daysUntil
    });

    return NextResponse.json({
      success: true,
      message: `Recordatorio procesado para ${body.clientName}`,
      daysUntilSession: daysUntil,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[n8n Webhook Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check para n8n
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Bernal Photo OS — Session Reminder Webhook',
    version: '1.0.0',
  });
}
