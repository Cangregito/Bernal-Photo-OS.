import { AuditLog, AuditAction, AuditEntity } from '../entities/AuditLog';

export interface AuditLogRepository {
  log(params: {
    userId?: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<AuditLog>;

  getByEntity(entity: AuditEntity, entityId: string): Promise<AuditLog[]>;
  getRecent(limit?: number): Promise<AuditLog[]>;
}
