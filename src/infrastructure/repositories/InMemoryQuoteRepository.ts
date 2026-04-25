import { Quote } from '../../domain/entities/Quote';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository';

export class InMemoryQuoteRepository implements QuoteRepository {
  private quotes: Quote[] = [
    {
      id: '1',
      clientId: '1', // Ana García
      sessionId: '1',
      items: [
        { id: 'i1', name: 'Paquete Boda Premium', description: 'Cobertura de 10 horas, 2 fotógrafos, dron.', price: 35000, quantity: 1 },
        { id: 'i2', name: 'Álbum Fino', description: 'Álbum de cuero 30x30cm, 50 páginas.', price: 5000, quantity: 1 }
      ],
      totalAmount: 40000,
      status: 'accepted',
      validUntil: new Date('2026-05-10T23:59:59Z'),
      createdAt: new Date('2026-04-10T11:00:00Z'),
      updatedAt: new Date('2026-04-12T10:00:00Z'),
    },
    {
      id: '2',
      clientId: '2', // Carlos López
      sessionId: '2',
      items: [
        { id: 'i3', name: 'Sesión Compromiso Básico', description: 'Cobertura de 2 horas en locación.', price: 6000, quantity: 1 },
        { id: 'i4', name: 'Hora Extra', description: 'Hora adicional de cobertura en la playa.', price: 1500, quantity: 1 }
      ],
      totalAmount: 7500,
      status: 'sent',
      validUntil: new Date('2026-05-01T23:59:59Z'),
      createdAt: new Date('2026-04-18T16:00:00Z'),
      updatedAt: new Date('2026-04-18T16:00:00Z'),
    }
  ];

  async getAll(): Promise<Quote[]> {
    return [...this.quotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getByClientId(clientId: string): Promise<Quote[]> {
    return this.quotes.filter(q => q.clientId === clientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getById(id: string): Promise<Quote | null> {
    const quote = this.quotes.find(q => q.id === id);
    return quote ? { ...quote } : null;
  }

  async create(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    const newQuote: Quote = {
      ...quoteData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quotes.push(newQuote);
    return { ...newQuote };
  }

  async update(id: string, data: Partial<Quote>): Promise<Quote> {
    const index = this.quotes.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Quote not found');
    
    this.quotes[index] = {
      ...this.quotes[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return { ...this.quotes[index] };
  }

  async delete(id: string): Promise<void> {
    this.quotes = this.quotes.filter(q => q.id !== id);
  }
}
