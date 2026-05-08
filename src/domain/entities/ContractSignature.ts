export interface ContractSignature {
  id: string;
  contractId: string;
  signatureData?: string;  // Base64 del trazo de firma
  hashSha256: string;      // SHA-256
  ipAddress?: string;
  userAgent?: string;
  signedAt: Date;
  createdAt: Date;
}
