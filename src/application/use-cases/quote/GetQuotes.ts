import { Quote } from '../../../domain/entities/Quote';
import { QuoteRepository } from '../../../domain/repositories/QuoteRepository';

export class GetQuotes {
  constructor(private quoteRepository: QuoteRepository) {}

  async execute(clientId?: string): Promise<Quote[]> {
    if (clientId) {
      return this.quoteRepository.getByClientId(clientId);
    }
    return this.quoteRepository.getAll();
  }
}
