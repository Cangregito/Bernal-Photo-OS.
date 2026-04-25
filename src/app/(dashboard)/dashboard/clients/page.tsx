import { Plus } from 'lucide-react';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { GenerateDigitalDossier } from '../../../../application/use-cases/client/GenerateDigitalDossier';
import { InMemoryClientRepository } from '../../../../infrastructure/repositories/InMemoryClientRepository';
import { InMemorySessionRepository } from '../../../../infrastructure/repositories/InMemorySessionRepository';
import { InMemoryQuoteRepository } from '../../../../infrastructure/repositories/InMemoryQuoteRepository';
import { InMemoryContractRepository } from '../../../../infrastructure/repositories/InMemoryContractRepository';
import { ClientTable } from '../../../../presentation/components/dashboard/ClientTable';

// Inyección de dependencias
const clientRepository = new InMemoryClientRepository();
const sessionRepository = new InMemorySessionRepository();
const quoteRepository = new InMemoryQuoteRepository();
const contractRepository = new InMemoryContractRepository();

const getClientsUseCase = new GetClients(clientRepository);
const generateDigitalDossierUseCase = new GenerateDigitalDossier(
  clientRepository,
  sessionRepository,
  quoteRepository,
  contractRepository
);

export default async function ClientsPage() {
  const clients = await getClientsUseCase.execute();
  
  // Generar expedientes para todos los clientes (en una app real se paginaría)
  const dossiers = await Promise.all(
    clients.map(client => generateDigitalDossierUseCase.execute(client.id))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Clientes</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestiona los expedientes centrales de tus clientes.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Main Content */}
      <ClientTable dossiers={dossiers} />

    </div>
  );
}
