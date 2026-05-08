import { supabase } from '../supabase/client';
import { SigningToken } from '../../domain/entities/SigningToken';
import { SigningTokenRepository } from '../../domain/repositories/SigningTokenRepository';

export class SupabaseSigningTokenRepository implements SigningTokenRepository {
  async create(contractId: string, expiresInHours = 72): Promise<SigningToken> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const { data: row, error } = await supabase
      .from('signing_tokens')
      .insert({
        contract_id: contractId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating signing token: ${error.message}`);
    return this.mapToDomain(row);
  }

  async getByToken(token: string): Promise<SigningToken | null> {
    const { data: row, error } = await supabase
      .from('signing_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) return null;
    return this.mapToDomain(row);
  }

  async markAsUsed(token: string): Promise<void> {
    const { error } = await supabase
      .from('signing_tokens')
      .update({ is_used: true })
      .eq('token', token);

    if (error) throw new Error(`Error marking token as used: ${error.message}`);
  }

  async getByContractId(contractId: string): Promise<SigningToken[]> {
    const { data: rows, error } = await supabase
      .from('signing_tokens')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching tokens: ${error.message}`);
    return (rows || []).map(this.mapToDomain);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(row: any): SigningToken {
    return {
      id: row.id,
      contractId: row.contract_id,
      token: row.token,
      isUsed: row.is_used,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    };
  }
}
