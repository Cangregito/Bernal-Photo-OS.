import { Quote } from '../entities/Quote';

export interface QuoteRepository {
  getAll(): Promise<Quote[]>;
  getByClientId(clientId: string): Promise<Quote[]>;
  getById(id: string): Promise<Quote | null>;
  create(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote>;
  update(id: string, data: Partial<Quote>): Promise<Quote>;
  delete(id: string): Promise<void>;
}
