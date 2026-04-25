import { Quote, QuoteStatus } from '../../../domain/entities/Quote';
import { Client } from '../../../domain/entities/Client';
import { FileEdit, CheckCircle, XCircle, Send, MoreHorizontal, DollarSign } from 'lucide-react';

interface QuoteTableProps {
  quotes: Quote[];
  clients: Client[];
}

const statusMap: Record<QuoteStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Borrador', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: FileEdit },
  sent: { label: 'Enviada', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Send },
  accepted: { label: 'Aceptada', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export function QuoteTable({ quotes, clients }: QuoteTableProps) {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Cliente Desconocido';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="rounded-md border border-white/5 bg-black/20 overflow-hidden glass-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Cotización</th>
              <th className="px-6 py-4 font-medium">Items</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Monto Total</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Estatus</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No hay cotizaciones registradas.
                </td>
              </tr>
            ) : (
              quotes.map((quote) => {
                const StatusIcon = statusMap[quote.status].icon;
                return (
                  <tr key={quote.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{getClientName(quote.clientId)}</span>
                        <span className="text-xs text-zinc-400 mt-1">
                          Válida hasta: {new Date(quote.validUntil).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-zinc-300 text-xs">
                        {quote.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center max-w-[200px]">
                            <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                        {formatCurrency(quote.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusMap[quote.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusMap[quote.status].label}
                      </div>
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
