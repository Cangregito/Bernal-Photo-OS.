import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { GenerateDigitalDossier } from '../../../../application/use-cases/client/GenerateDigitalDossier';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';
import { SupabaseSessionRepository } from '../../../../infrastructure/repositories/SupabaseSessionRepository';
import { SupabaseQuoteRepository } from '../../../../infrastructure/repositories/SupabaseQuoteRepository';
import { SupabaseContractRepository } from '../../../../infrastructure/repositories/SupabaseContractRepository';
import { ClientTable, SerializableDossier } from '../../../../presentation/components/dashboard/ClientTable';

// Inyección de dependencias
const clientRepository = new SupabaseClientRepository();
const sessionRepository = new SupabaseSessionRepository();
const quoteRepository = new SupabaseQuoteRepository();
const contractRepository = new SupabaseContractRepository();

const getClientsUseCase = new GetClients(clientRepository);
const generateDigitalDossierUseCase = new GenerateDigitalDossier(
  clientRepository,
  sessionRepository,
  quoteRepository,
  contractRepository
);

// Serializar Date → string para poder pasar de Server Component a Client Component
function serializeDossier(dossier: Awaited<ReturnType<typeof generateDigitalDossierUseCase.execute>>): SerializableDossier {
  return {
    client: {
      ...dossier.client,
      createdAt: dossier.client.createdAt.toISOString(),
      updatedAt: dossier.client.updatedAt.toISOString(),
    },
    sessions: dossier.sessions.map(s => ({
      ...s,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    quotes: dossier.quotes.map(q => ({
      ...q,
      totalAmount: q.totalAmount,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    })),
    contracts: dossier.contracts.map(c => ({
      ...c,
      signedAt: c.signedAt?.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    generatedAt: dossier.generatedAt.toISOString(),
  };
}

export default async function ClientsPage() {
  const clients = await getClientsUseCase.execute();

  const dossiers = await Promise.all(
    clients.map(client => generateDigitalDossierUseCase.execute(client.id))
  );

  const serializedDossiers = dossiers.map(serializeDossier);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ClientTable dossiers={serializedDossiers} />
    </div>
  );
}
