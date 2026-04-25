import { Contract } from '../entities/Contract';

export interface ContractRepository {
  getAll(): Promise<Contract[]>;
  getByClientId(clientId: string): Promise<Contract[]>;
  getById(id: string): Promise<Contract | null>;
  create(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract>;
  update(id: string, data: Partial<Contract>): Promise<Contract>;
  delete(id: string): Promise<void>;
}
