export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface QuoteItem {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface Quote {
  id: string;
  clientId: string;
  sessionId?: string; // Opcional, puede cotizarse sin tener la fecha apartada
  items: QuoteItem[];
  totalAmount: number;
  status: QuoteStatus;
  validUntil: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
