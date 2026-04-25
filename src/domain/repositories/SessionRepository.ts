import { Session } from '../entities/Session';

export interface SessionRepository {
  getAll(): Promise<Session[]>;
  getByClientId(clientId: string): Promise<Session[]>;
  getById(id: string): Promise<Session | null>;
  create(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
  update(id: string, data: Partial<Session>): Promise<Session>;
  delete(id: string): Promise<void>;
}
