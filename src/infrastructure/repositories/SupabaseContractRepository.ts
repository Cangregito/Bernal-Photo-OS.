import { Contract, ContractStatus } from '../../domain/entities/Contract';
import { ContractRepository } from '../../domain/repositories/ContractRepository';
import { supabase } from '../supabase/client';

interface ContractRow {
  id: string;
  client_id: string;
  quote_id?: string;
  content: string;
  status: ContractStatus;
  signed_at?: string;
  ip_address?: string;
  hash_signature?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseContractRepository implements ContractRepository {
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as ContractRow[]).map(this.mapToContract);
  }

  async getByClientId(clientId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as ContractRow[]).map(this.mapToContract);
  }

  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToContract(data as unknown as ContractRow);
  }

  async create(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        client_id: contractData.clientId,
        quote_id: contractData.quoteId,
        content: contractData.content,
        status: contractData.status,
        signed_at: contractData.signedAt?.toISOString(),
        ip_address: contractData.ipAddress,
        hash_signature: contractData.hashSignature
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToContract(data as unknown as ContractRow);
  }

  async update(id: string, contractData: Partial<Contract>): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        client_id: contractData.clientId,
        quote_id: contractData.quoteId,
        content: contractData.content,
        status: contractData.status,
        signed_at: contractData.signedAt?.toISOString(),
        ip_address: contractData.ipAddress,
        hash_signature: contractData.hashSignature,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToContract(data as unknown as ContractRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToContract(row: ContractRow): Contract {
    return {
      id: row.id,
      clientId: row.client_id,
      quoteId: row.quote_id,
      content: row.content,
      status: row.status,
      signedAt: row.signed_at ? new Date(row.signed_at) : undefined,
      ipAddress: row.ip_address,
      hashSignature: row.hash_signature,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
