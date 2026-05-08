import { GetSessions } from '../../../../application/use-cases/session/GetSessions';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { SupabaseSessionRepository } from '../../../../infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';
import { SessionTable } from '../../../../presentation/components/dashboard/SessionTable';

const sessionRepository = new SupabaseSessionRepository();
const clientRepository = new SupabaseClientRepository();
const getSessionsUseCase = new GetSessions(sessionRepository);
const getClientsUseCase = new GetClients(clientRepository);

export default async function SessionsPage() {
  const sessions = await getSessionsUseCase.execute();
  const clients = await getClientsUseCase.execute();

  const serializedSessions = sessions.map(s => ({
    id: s.id,
    clientId: s.clientId,
    date: s.date.toISOString(),
    type: s.type,
    status: s.status,
    location: s.location,
    notes: s.notes,
  }));

  const serializedClients = clients.map(c => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SessionTable sessions={serializedSessions} clients={serializedClients} />
    </div>
  );
}
