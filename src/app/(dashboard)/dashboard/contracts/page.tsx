import { GetContracts } from '../../../../application/use-cases/contract/GetContracts';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { GetQuotes } from '../../../../application/use-cases/quote/GetQuotes';
import { SupabaseContractRepository } from '../../../../infrastructure/repositories/SupabaseContractRepository';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';
import { SupabaseQuoteRepository } from '../../../../infrastructure/repositories/SupabaseQuoteRepository';
import { ContractTable } from '../../../../presentation/components/dashboard/ContractTable';

const contractRepository = new SupabaseContractRepository();
const clientRepository = new SupabaseClientRepository();
const quoteRepository = new SupabaseQuoteRepository();
const getContractsUseCase = new GetContracts(contractRepository);
const getClientsUseCase = new GetClients(clientRepository);
const getQuotesUseCase = new GetQuotes(quoteRepository);

export default async function ContractsPage() {
  const [contracts, clients, quotes] = await Promise.all([
    getContractsUseCase.execute(),
    getClientsUseCase.execute(),
    getQuotesUseCase.execute(),
  ]);

  const serializedContracts = contracts.map(c => ({
    id: c.id,
    clientId: c.clientId,
    quoteId: c.quoteId,
    content: c.content,
    status: c.status,
    hashSignature: c.hashSignature,
    signedAt: c.signedAt?.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }));

  const serializedClients = clients.map(c => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
  }));

  const serializedQuotes = quotes.map(q => ({
    id: q.id,
    clientId: q.clientId,
    items: q.items,
    totalAmount: q.totalAmount,
    status: q.status,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ContractTable
        contracts={serializedContracts}
        clients={serializedClients}
        quotes={serializedQuotes}
      />
    </div>
  );
}
