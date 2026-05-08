export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SIGN' | 'LOGIN' | 'LOGOUT' | 'GENERATE_PDF' | 'VERIFY_HASH';
export type AuditEntity = 'clients' | 'sessions' | 'contracts' | 'quotes' | 'contract_signatures' | 'profiles';

export interface AuditLog {
  id: string;
  userId?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}
