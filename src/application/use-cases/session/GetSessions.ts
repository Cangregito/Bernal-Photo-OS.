import { Session } from '../../../domain/entities/Session';
import { SessionRepository } from '../../../domain/repositories/SessionRepository';

export class GetSessions {
  constructor(private sessionRepository: SessionRepository) {}

  async execute(clientId?: string): Promise<Session[]> {
    if (clientId) {
      return this.sessionRepository.getByClientId(clientId);
    }
    return this.sessionRepository.getAll();
  }
}
