import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { supabase } from '../supabase/client';

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseClientRepository implements ClientRepository {
  async getAll(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as unknown as ClientRow[]).map(this.mapToClient);
    } catch (err: any) {
      console.warn('SupabaseClientRepository: Error fetch (¿.env configurado?)', err.message);
      return [];
    }
  }

  async getById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return this.mapToClient(data as unknown as ClientRow);
    } catch (err: any) {
      console.warn('SupabaseClientRepository: Error fetch', err.message);
      return null;
    }
  }

  async create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        notes: clientData.notes
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToClient(data as unknown as ClientRow);
  }

  async update(id: string, clientData: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        notes: clientData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToClient(data as unknown as ClientRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToClient(row: ClientRow): Client {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
