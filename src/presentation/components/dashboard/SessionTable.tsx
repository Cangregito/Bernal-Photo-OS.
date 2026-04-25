import { Session, SessionType, SessionStatus } from '../../../domain/entities/Session';
import { Client } from '../../../domain/entities/Client';
import { CalendarDays, MapPin, MoreHorizontal, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SessionTableProps {
  sessions: Session[];
  clients: Client[];
}

const typeMap: Record<SessionType, string> = {
  wedding: 'Boda',
  engagement: 'Compromiso',
  portrait: 'Retrato',
  event: 'Evento',
};

const statusMap: Record<SessionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
  completed: { label: 'Completado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export function SessionTable({ sessions, clients }: SessionTableProps) {
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
              <th className="px-6 py-4 font-medium">Evento</th>
              <th className="px-6 py-4 font-medium">Fecha y Lugar</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Estatus</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No hay sesiones programadas.
                </td>
              </tr>
            ) : (
              sessions.map((session) => {
                const StatusIcon = statusMap[session.status].icon;
                return (
                  <tr key={session.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{getClientName(session.clientId)}</span>
                        <span className="text-xs text-zinc-400 mt-1">{typeMap[session.type]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                          {new Date(session.date).toLocaleDateString('es-MX', { 
                            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-2 text-zinc-400 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="truncate max-w-[200px]">{session.location}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusMap[session.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusMap[session.status].label}
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
