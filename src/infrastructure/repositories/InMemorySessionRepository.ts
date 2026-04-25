import { Session } from '../../domain/entities/Session';
import { SessionRepository } from '../../domain/repositories/SessionRepository';

export class InMemorySessionRepository implements SessionRepository {
  private sessions: Session[] = [
    {
      id: '1',
      clientId: '1', // Ana García
      date: new Date('2026-10-15T16:00:00Z'),
      type: 'wedding',
      status: 'confirmed',
      location: 'Hacienda San José, CDMX',
      notes: 'Boda civil y recepción.',
      createdAt: new Date('2026-04-10T10:00:00Z'),
      updatedAt: new Date('2026-04-10T10:00:00Z'),
    },
    {
      id: '2',
      clientId: '2', // Carlos López
      date: new Date('2026-06-20T17:00:00Z'),
      type: 'engagement',
      status: 'pending',
      location: 'Playa del Carmen',
      notes: 'Sesión al atardecer, llevar luces portátiles.',
      createdAt: new Date('2026-04-18T15:30:00Z'),
      updatedAt: new Date('2026-04-18T15:30:00Z'),
    }
  ];

  async getAll(): Promise<Session[]> {
    return [...this.sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getByClientId(clientId: string): Promise<Session[]> {
    return this.sessions.filter(s => s.clientId === clientId).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getById(id: string): Promise<Session | null> {
    const session = this.sessions.find(s => s.id === id);
    return session ? { ...session } : null;
  }

  async create(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const newSession: Session = {
      ...sessionData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.push(newSession);
    return { ...newSession };
  }

  async update(id: string, data: Partial<Session>): Promise<Session> {
    const index = this.sessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Session not found');
    
    this.sessions[index] = {
      ...this.sessions[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return { ...this.sessions[index] };
  }

  async delete(id: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.id !== id);
  }
}
