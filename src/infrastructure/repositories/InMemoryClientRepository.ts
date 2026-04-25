import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export class InMemoryClientRepository implements ClientRepository {
  private clients: Client[] = [
    {
      id: '1',
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@example.com',
      phone: '+52 55 1234 5678',
      notes: 'Boda en jardín, estilo bohemio.',
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-01T10:00:00Z'),
    },
    {
      id: '2',
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@example.com',
      phone: '+52 81 9876 5432',
      notes: 'Sesión de compromiso en la playa.',
      createdAt: new Date('2026-04-15T15:30:00Z'),
      updatedAt: new Date('2026-04-15T15:30:00Z'),
    }
  ];

  async getAll(): Promise<Client[]> {
    return [...this.clients];
  }

  async getById(id: string): Promise<Client | null> {
    const client = this.clients.find(c => c.id === id);
    return client ? { ...client } : null;
  }

  async create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const newClient: Client = {
      ...clientData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.push(newClient);
    return { ...newClient };
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    
    this.clients[index] = {
      ...this.clients[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return { ...this.clients[index] };
  }

  async delete(id: string): Promise<void> {
    this.clients = this.clients.filter(c => c.id !== id);
  }
}
