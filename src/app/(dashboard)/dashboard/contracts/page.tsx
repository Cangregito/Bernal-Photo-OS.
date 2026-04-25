import { FileSignature } from 'lucide-react';
import { GetContracts } from '../../../../application/use-cases/contract/GetContracts';
import { GetClients } from '../../../../application/use-cases/client/GetClients';
import { InMemoryContractRepository } from '../../../../infrastructure/repositories/InMemoryContractRepository';
import { InMemoryClientRepository } from '../../../../infrastructure/repositories/InMemoryClientRepository';
import { ContractTable } from '../../../../presentation/components/dashboard/ContractTable';

// Inyección de dependencias (In-Memory)
const contractRepository = new InMemoryContractRepository();
const clientRepository = new InMemoryClientRepository();
const getContractsUseCase = new GetContracts(contractRepository);
const getClientsUseCase = new GetClients(clientRepository);

export default async function ContractsPage() {
  const contracts = await getContractsUseCase.execute();
  const clients = await getClientsUseCase.execute();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            Contratos <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">Protegido por SHA-256</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestiona la legalidad y firma inmutable de los eventos.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
          <FileSignature className="w-4 h-4" />
          Redactar Contrato
        </button>
      </div>

      {/* Main Content */}
      <ContractTable contracts={contracts} clients={clients} />

    </div>
  );
}
