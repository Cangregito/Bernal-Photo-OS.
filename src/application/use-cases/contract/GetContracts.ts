import { Contract } from '../../../domain/entities/Contract';
import { ContractRepository } from '../../../domain/repositories/ContractRepository';

export class GetContracts {
  constructor(private contractRepository: ContractRepository) {}

  async execute(clientId?: string): Promise<Contract[]> {
    if (clientId) {
      return this.contractRepository.getByClientId(clientId);
    }
    return this.contractRepository.getAll();
  }
}
