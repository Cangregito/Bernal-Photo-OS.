import { CalendarPlus } from 'lucide-react';
import { GetSessions } from '../../../../application/use-cases/session/GetSessions';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { InMemorySessionRepository } from '../../../../infrastructure/repositories/InMemorySessionRepository';
import { InMemoryClientRepository } from '../../../../infrastructure/repositories/InMemoryClientRepository';
import { SessionTable } from '../../../../presentation/components/dashboard/SessionTable';

// Inyección de dependencias (In-Memory)
const sessionRepository = new InMemorySessionRepository();
const clientRepository = new InMemoryClientRepository();
const getSessionsUseCase = new GetSessions(sessionRepository);
const getClientsUseCase = new GetClients(clientRepository);

export default async function SessionsPage() {
  // Obtenemos ambos para poder mapear los nombres de los clientes en la tabla
  const sessions = await getSessionsUseCase.execute();
  const clients = await getClientsUseCase.execute();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Sesiones</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestiona los eventos fotográficos y su estatus.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
          <CalendarPlus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      {/* Main Content */}
      <SessionTable sessions={sessions} clients={clients} />

    </div>
  );
}
