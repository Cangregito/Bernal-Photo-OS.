import { Session, SessionType, SessionStatus } from '../../domain/entities/Session';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { supabase } from '../supabase/client';

interface SessionRow {
  id: string;
  client_id: string;
  date: string;
  type: SessionType;
  status: SessionStatus;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseSessionRepository implements SessionRepository {
  async getAll(): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw new Error(error.message);
      return (data as unknown as SessionRow[]).map(this.mapToSession);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('SupabaseSessionRepository: Error fetch', message);
      return [];
    }
  }

  async getByClientId(clientId: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: true });

      if (error) throw new Error(error.message);
      return (data as unknown as SessionRow[]).map(this.mapToSession);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('SupabaseSessionRepository: Error fetch', message);
      return [];
    }
  }

  async getById(id: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToSession(data as unknown as SessionRow);
  }

  async create(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        client_id: sessionData.clientId,
        date: sessionData.date.toISOString(),
        type: sessionData.type,
        status: sessionData.status,
        location: sessionData.location,
        notes: sessionData.notes
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToSession(data as unknown as SessionRow);
  }

  async update(id: string, sessionData: Partial<Session>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        client_id: sessionData.clientId,
        date: sessionData.date?.toISOString(),
        type: sessionData.type,
        status: sessionData.status,
        location: sessionData.location,
        notes: sessionData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToSession(data as unknown as SessionRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToSession(row: SessionRow): Session {
    return {
      id: row.id,
      clientId: row.client_id,
      date: new Date(row.date),
      type: row.type,
      status: row.status,
      location: row.location,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
