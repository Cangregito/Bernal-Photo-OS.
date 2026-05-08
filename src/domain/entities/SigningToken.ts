export interface SigningToken {
  id: string;
  contractId: string;
  token: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}
