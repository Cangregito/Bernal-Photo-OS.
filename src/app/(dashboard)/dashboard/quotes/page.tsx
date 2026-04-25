import { FilePlus } from 'lucide-react';
import { GetQuotes } from '../../../../application/use-cases/quote/GetQuotes';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { InMemoryQuoteRepository } from '../../../../infrastructure/repositories/InMemoryQuoteRepository';
import { InMemoryClientRepository } from '../../../../infrastructure/repositories/InMemoryClientRepository';
import { QuoteTable } from '../../../../presentation/components/dashboard/QuoteTable';

// Inyección de dependencias (In-Memory)
const quoteRepository = new InMemoryQuoteRepository();
const clientRepository = new InMemoryClientRepository();
const getQuotesUseCase = new GetQuotes(quoteRepository);
const getClientsUseCase = new GetClients(clientRepository);

export default async function QuotesPage() {
  const quotes = await getQuotesUseCase.execute();
  const clients = await getClientsUseCase.execute();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Cotizaciones</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestiona los presupuestos dinámicos y su cálculo financiero.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
          <FilePlus className="w-4 h-4" />
          Nueva Cotización
        </button>
      </div>

      {/* Main Content */}
      <QuoteTable quotes={quotes} clients={clients} />

    </div>
  );
}
