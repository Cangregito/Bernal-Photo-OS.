import { supabase } from '../supabase/client';
import { AuditLog, AuditAction, AuditEntity } from '../../domain/entities/AuditLog';
import { AuditLogRepository } from '../../domain/repositories/AuditLogRepository';

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async log(params: {
    userId?: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const { data: row, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: params.userId,
        action: params.action,
        entity: params.entity,
        entity_id: params.entityId,
        metadata: params.metadata || {},
        ip_address: params.ipAddress,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating audit log: ${error.message}`);
    return this.mapToDomain(row);
  }

  async getByEntity(entity: AuditEntity, entityId: string): Promise<AuditLog[]> {
    const { data: rows, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity', entity)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching audit logs: ${error.message}`);
    return (rows || []).map(this.mapToDomain);
  }

  async getRecent(limit = 50): Promise<AuditLog[]> {
    const { data: rows, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Error fetching recent audit logs: ${error.message}`);
    return (rows || []).map(this.mapToDomain);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(row: any): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action as AuditAction,
      entity: row.entity as AuditEntity,
      entityId: row.entity_id,
      metadata: row.metadata,
      ipAddress: row.ip_address,
      createdAt: new Date(row.created_at),
    };
  }
}
