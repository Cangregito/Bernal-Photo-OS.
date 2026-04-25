import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { SessionRepository } from '../../../domain/repositories/SessionRepository';
import { QuoteRepository } from '../../../domain/repositories/QuoteRepository';
import { ContractRepository } from '../../../domain/repositories/ContractRepository';
import { Client } from '../../../domain/entities/Client';
import { Session } from '../../../domain/entities/Session';
import { Quote } from '../../../domain/entities/Quote';
import { Contract } from '../../../domain/entities/Contract';

export interface DigitalDossier {
  client: Client;
  sessions: Session[];
  quotes: Quote[];
  contracts: Contract[];
  generatedAt: Date;
}

export class GenerateDigitalDossier {
  constructor(
    private clientRepository: ClientRepository,
    private sessionRepository: SessionRepository,
    private quoteRepository: QuoteRepository,
    private contractRepository: ContractRepository
  ) {}

  /**
   * Obtiene y consolida toda la información de un cliente para su Expediente PDF.
   */
  async execute(clientId: string): Promise<DigitalDossier> {
    const client = await this.clientRepository.getById(clientId);
    if (!client) {
      throw new Error(`Client not found with id: ${clientId}`);
    }

    // Obtener información vinculada concurrentemente para mayor velocidad
    const [sessions, quotes, contracts] = await Promise.all([
      this.sessionRepository.getByClientId(clientId),
      this.quoteRepository.getByClientId(clientId),
      this.contractRepository.getByClientId(clientId)
    ]);

    return {
      client,
      sessions,
      quotes,
      contracts,
      generatedAt: new Date()
    };
  }
}
