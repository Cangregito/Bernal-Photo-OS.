export type ContractStatus = 'draft' | 'sent' | 'signed';

export interface Contract {
  id: string;
  clientId: string;
  quoteId?: string;
  content: string; // The text content or terms of the contract
  status: ContractStatus;
  signedAt?: Date;
  ipAddress?: string;
  hashSignature?: string; // The SHA-256 hash
  createdAt: Date;
  updatedAt: Date;
}
