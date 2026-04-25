export type SessionType = 'wedding' | 'engagement' | 'portrait' | 'event';
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  clientId: string;
  date: Date;
  type: SessionType;
  status: SessionStatus;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
