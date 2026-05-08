import { supabase } from '../supabase/client';
import { ContractSignature } from '../../domain/entities/ContractSignature';
import { ContractSignatureRepository } from '../../domain/repositories/ContractSignatureRepository';

export class SupabaseContractSignatureRepository implements ContractSignatureRepository {
  async create(data: Omit<ContractSignature, 'id' | 'createdAt'>): Promise<ContractSignature> {
    const { data: row, error } = await supabase
      .from('contract_signatures')
      .insert({
        contract_id: data.contractId,
        signature_data: data.signatureData,
        hash_sha256: data.hashSha256,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        signed_at: data.signedAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating contract signature: ${error.message}`);
    return this.mapToDomain(row);
  }

  async getByContractId(contractId: string): Promise<ContractSignature[]> {
    const { data: rows, error } = await supabase
      .from('contract_signatures')
      .select('*')
      .eq('contract_id', contractId)
      .order('signed_at', { ascending: false });

    if (error) throw new Error(`Error fetching signatures: ${error.message}`);
    return (rows || []).map(this.mapToDomain);
  }

  async getById(id: string): Promise<ContractSignature | null> {
    const { data: row, error } = await supabase
      .from('contract_signatures')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToDomain(row);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(row: any): ContractSignature {
    return {
      id: row.id,
      contractId: row.contract_id,
      signatureData: row.signature_data,
      hashSha256: row.hash_sha256,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      signedAt: new Date(row.signed_at),
      createdAt: new Date(row.created_at),
    };
  }
}
