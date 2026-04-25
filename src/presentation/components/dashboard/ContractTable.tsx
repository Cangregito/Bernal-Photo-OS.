import { Contract, ContractStatus } from '../../../domain/entities/Contract';
import { Client } from '../../../domain/entities/Client';
import { FileSignature, ShieldCheck, Clock, ShieldAlert, Send, MoreHorizontal } from 'lucide-react';

interface ContractTableProps {
  contracts: Contract[];
  clients: Client[];
}

const statusMap: Record<ContractStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Borrador', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Send },
  signed: { label: 'Firmado y Sellado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: FileSignature },
};

export function ContractTable({ contracts, clients }: ContractTableProps) {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Cliente Desconocido';
  };

  return (
    <div className="w-full">
      <div className="rounded-md border border-white/5 bg-black/20 overflow-hidden glass-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Contrato</th>
              <th className="px-6 py-4 font-medium">Estado Legal</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Firma Criptográfica (SHA-256)</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No hay contratos registrados.
                </td>
              </tr>
            ) : (
              contracts.map((contract) => {
                const StatusIcon = statusMap[contract.status].icon;
                return (
                  <tr key={contract.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{getClientName(contract.clientId)}</span>
                        <span className="text-xs text-zinc-400 mt-1 truncate max-w-[250px]">
                          {contract.content.substring(0, 50)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusMap[contract.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusMap[contract.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {contract.hashSignature ? (
                        <div className="flex items-center gap-2 text-emerald-400/90 text-xs font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="truncate max-w-[200px]" title={contract.hashSignature}>
                            {contract.hashSignature}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Sin Sellar</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
