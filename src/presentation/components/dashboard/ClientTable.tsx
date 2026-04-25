import { DigitalDossier } from '../../../application/use-cases/client/GenerateDigitalDossier';
import { User, Mail, Phone, Calendar, MoreHorizontal } from 'lucide-react';
import { DownloadPDFButton } from '../pdf/DownloadPDFButton';

interface ClientTableProps {
  dossiers: DigitalDossier[];
}

export function ClientTable({ dossiers }: ClientTableProps) {
  return (
    <div className="w-full">
      <div className="rounded-md border border-white/5 bg-black/20 overflow-hidden glass-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Registro</th>
              <th className="px-6 py-4 font-medium text-right">Expediente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dossiers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              dossiers.map(({ client, ...dossierRest }) => {
                const fullDossier = { client, ...dossierRest };
                return (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-100">
                            {client.firstName} {client.lastName}
                          </div>
                          {client.notes && (
                            <div className="text-xs text-zinc-500 truncate max-w-[200px]">
                              {client.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-zinc-400 text-xs">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(client.createdAt).toLocaleDateString('es-MX')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DownloadPDFButton dossier={fullDossier} />
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Opciones">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
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
