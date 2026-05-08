import { GetClients } from '../../../application/use-cases/client/GetClients';
import { GetSessions } from '../../../application/use-cases/session/GetSessions';
import { GetQuotes } from '../../../application/use-cases/quote/GetQuotes';
import { GetContracts } from '../../../application/use-cases/contract/GetContracts';
import { SupabaseClientRepository } from '../../../infrastructure/repositories/SupabaseClientRepository';
import { SupabaseSessionRepository } from '../../../infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseQuoteRepository } from '../../../infrastructure/repositories/SupabaseQuoteRepository';
import { SupabaseContractRepository } from '../../../infrastructure/repositories/SupabaseContractRepository';
import { DashboardPanel, DashboardData } from '../../../presentation/components/dashboard/DashboardPanel';

// Inyección de dependencias
const clientRepo = new SupabaseClientRepository();
const sessionRepo = new SupabaseSessionRepository();
const quoteRepo = new SupabaseQuoteRepository();
const contractRepo = new SupabaseContractRepository();

export default async function Dashboard() {
  const clients = await new GetClients(clientRepo).execute();
  const sessions = await new GetSessions(sessionRepo).execute();
  const quotes = await new GetQuotes(quoteRepo).execute();
  const contracts = await new GetContracts(contractRepo).execute();

  // Helper para buscar nombre de cliente
  const clientName = (id: string) => {
    const c = clients.find(cl => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Desconocido';
  };

  // Serializar todo para el Client Component
  const data: DashboardData = {
    stats: {
      totalClients: clients.length,
      totalSessions: sessions.length,
      pendingSessions: sessions.filter(s => s.status === 'pending').length,
      totalRevenue: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0),
      pendingContracts: contracts.filter(c => c.status === 'draft' || c.status === 'sent').length,
    },
    sessions: sessions.map(s => ({
      id: s.id,
      clientName: clientName(s.clientId),
      date: s.date.toISOString(),
      type: s.type,
      status: s.status,
      location: s.location,
    })),
    quotes: quotes.map(q => ({
      id: q.id,
      clientName: clientName(q.clientId),
      totalAmount: q.totalAmount,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    })),
    contracts: contracts.map(c => ({
      id: c.id,
      clientName: clientName(c.clientId),
      status: c.status,
      hashSignature: c.hashSignature,
      signedAt: c.signedAt?.toISOString(),
    })),
  };

  return (
    <DashboardPanel data={data} />
  );
}
