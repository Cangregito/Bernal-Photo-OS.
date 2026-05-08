import { Quote, QuoteItem, QuoteStatus } from '../../domain/entities/Quote';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository';
import { supabase } from '../supabase/client';

interface QuoteRow {
  id: string;
  client_id: string;
  session_id?: string;
  items: QuoteItem[];
  total_amount: number;
  status: QuoteStatus;
  valid_until: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseQuoteRepository implements QuoteRepository {
  async getAll(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as unknown as QuoteRow[]).map(this.mapToQuote);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('SupabaseQuoteRepository: Error fetch', message);
      return [];
    }
  }

  async getByClientId(clientId: string): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as unknown as QuoteRow[]).map(this.mapToQuote);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('SupabaseQuoteRepository: Error fetch', message);
      return [];
    }
  }

  async getById(id: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToQuote(data as unknown as QuoteRow);
  }

  async create(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        client_id: quoteData.clientId,
        session_id: quoteData.sessionId,
        items: quoteData.items,
        total_amount: quoteData.totalAmount,
        status: quoteData.status,
        notes: quoteData.notes
        // valid_until omitted — column not yet in DB schema
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    // Inject the validUntil from the domain (not persisted yet)
    const mapped = this.mapToQuote(data as unknown as QuoteRow);
    return { ...mapped, validUntil: quoteData.validUntil };
  }

  async update(id: string, quoteData: Partial<Quote>): Promise<Quote> {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (!data) throw new Error('Quote not found');

    const { data: updated, error: updateError } = await supabase
      .from('quotes')
      .update({
        client_id: quoteData.clientId,
        session_id: quoteData.sessionId,
        items: quoteData.items,
        total_amount: quoteData.totalAmount,
        status: quoteData.status,
        valid_until: quoteData.validUntil?.toISOString(),
        notes: quoteData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    return this.mapToQuote(updated as unknown as QuoteRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToQuote(row: QuoteRow): Quote {
    return {
      id: row.id,
      clientId: row.client_id,
      sessionId: row.session_id,
      items: row.items || [],
      totalAmount: row.total_amount,
      status: row.status,
      validUntil: row.valid_until ? new Date(row.valid_until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
