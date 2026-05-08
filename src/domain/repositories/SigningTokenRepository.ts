import { SigningToken } from '../entities/SigningToken';

export interface SigningTokenRepository {
  create(contractId: string, expiresInHours?: number): Promise<SigningToken>;
  getByToken(token: string): Promise<SigningToken | null>;
  markAsUsed(token: string): Promise<void>;
  getByContractId(contractId: string): Promise<SigningToken[]>;
}
