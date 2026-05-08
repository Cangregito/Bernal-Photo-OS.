import { NextRequest, NextResponse } from 'next/server';
import { SupabaseContractRepository } from '@/infrastructure/repositories/SupabaseContractRepository';
import { SupabaseClientRepository } from '@/infrastructure/repositories/SupabaseClientRepository';
import { supabase } from '@/infrastructure/supabase/client';

const contractRepo = new SupabaseContractRepository();
const clientRepo = new SupabaseClientRepository();

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    // Validate the signing token
    const { data: tokenData, error: tokenError } = await supabase
      .from('signing_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Enlace inválido o no encontrado' }, { status: 404 });
    }

    if (tokenData.is_used) {
      return NextResponse.json({ error: 'Este enlace ya ha sido utilizado y el contrato está firmado' }, { status: 400 });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este enlace ha expirado. Solicita uno nuevo a Bernal Photo' }, { status: 400 });
    }

    // Get the contract
    const contract = await contractRepo.getById(tokenData.contract_id);
    if (!contract) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    // Get client name
    const client = await clientRepo.getById(contract.clientId);

    return NextResponse.json({
      content: contract.content,
      clientName: client ? `${client.firstName} ${client.lastName}` : undefined,
    });
  } catch (error: any) {
    console.error('Error loading contract preview:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
