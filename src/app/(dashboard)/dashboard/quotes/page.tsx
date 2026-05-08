import { GetQuotes } from '../../../../application/use-cases/quote/GetQuotes';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { SupabaseQuoteRepository } from '../../../../infrastructure/repositories/SupabaseQuoteRepository';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';
import { QuoteTable } from '../../../../presentation/components/dashboard/QuoteTable';

const quoteRepository = new SupabaseQuoteRepository();
const clientRepository = new SupabaseClientRepository();
const getQuotesUseCase = new GetQuotes(quoteRepository);
const getClientsUseCase = new GetClients(clientRepository);

export default async function QuotesPage() {
  const quotes = await getQuotesUseCase.execute();
  const clients = await getClientsUseCase.execute();

  const serializedQuotes = quotes.map(q => ({
    id: q.id,
    clientId: q.clientId,
    items: q.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
    totalAmount: q.totalAmount,
    status: q.status,
    validUntil: q.validUntil.toISOString(),
  }));

  const serializedClients = clients.map(c => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <QuoteTable quotes={serializedQuotes} clients={serializedClients} />
    </div>
  );
}
