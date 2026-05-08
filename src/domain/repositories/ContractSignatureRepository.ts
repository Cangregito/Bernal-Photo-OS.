import { ContractSignature } from '../entities/ContractSignature';

export interface ContractSignatureRepository {
  create(data: Omit<ContractSignature, 'id' | 'createdAt'>): Promise<ContractSignature>;
  getByContractId(contractId: string): Promise<ContractSignature[]>;
  getById(id: string): Promise<ContractSignature | null>;
}
