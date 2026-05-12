'use client';

import { useState } from 'react';
import {
  FileSignature, ShieldCheck, Clock, ShieldAlert,
  Send, X, Download, Loader2,
  FilePlus, Link, CheckCircle, AlertTriangle, CalendarPlus,
  Trash2, Edit
} from 'lucide-react';

type ContractStatus = 'draft' | 'sent' | 'signed';

export interface SerializableContract {
  id: string;
  clientId: string;
  quoteId?: string;
  content: string;
  status: ContractStatus;
  hashSignature?: string;
  signedAt?: string;
  createdAt: string;
}

export interface SerializableClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface SerializableQuote {
  id: string;
  clientId: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  totalAmount: number;
  status: string;
}

interface ContractTableProps {
  contracts: SerializableContract[];
  clients: SerializableClient[];
  quotes: SerializableQuote[];
}

const statusConfig: Record<ContractStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Borrador', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: Clock },
  sent: { label: 'Enviado para firma', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Send },
  signed: { label: 'Firmado ✓', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: FileSignature },
};

function buildContractContent(
  client: SerializableClient,
  quote: SerializableQuote,
  dateStr: string
): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const items = quote.items
    .map(i => `  • ${i.quantity}x ${i.name} — ${fmt(i.price * i.quantity)}`)
    .join('\n');

  return `CONTRATO DE PRESTACIÓN DE SERVICIOS FOTOGRÁFICOS

Entre:
  PRESTADOR: Bernal Photo Studio
  CLIENTE: ${client.firstName} ${client.lastName}
  CORREO: ${client.email}${client.phone ? `\n  TELÉFONO: ${client.phone}` : ''}
  FECHA: ${dateStr}

1. OBJETO DEL CONTRATO
El prestador se compromete a brindar los servicios fotográficos descritos en la cotización adjunta.

2. SERVICIOS CONTRATADOS
${items}

  Total: ${fmt(quote.totalAmount)}

3. CONDICIONES DE PAGO
  • Se requiere un anticipo del 50% (${fmt(quote.totalAmount * 0.5)}) para confirmar la reservación.
  • El saldo restante (${fmt(quote.totalAmount * 0.5)}) se liquida el día del evento.

4. POLÍTICA DE CANCELACIÓN
  • Cancelación con más de 30 días de anticipación: reembolso del 80% del anticipo.
  • Cancelación con menos de 30 días: el anticipo no es reembolsable.
  • En caso de cancelación por parte del prestador, se reembolsa el 100% del anticipo.

5. DERECHOS DE IMAGEN
Bernal Photo podrá utilizar las fotografías con fines promocionales en redes sociales y portafolio, salvo indicación escrita contraria del cliente.

6. ENTREGA DE FOTOGRAFÍAS
Las fotografías editadas serán entregadas en un plazo máximo de 30 días hábiles después del evento.

7. ACEPTACIÓN
Al firmar este contrato, ambas partes aceptan los términos y condiciones descritos anteriormente.

Bernal Photo Studio                    ${client.firstName} ${client.lastName}
____________________________           ____________________________
Firma del Prestador                    Firma del Cliente`;
}

export function ContractTable({ contracts: initialContracts, clients, quotes }: ContractTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);
  const [creatingSessionId, setCreatingSessionId] = useState<string | null>(null);
  const [lastSigningUrl, setLastSigningUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ clientId: '', quoteId: '', content: '', sessionDate: '', sessionType: 'wedding' as 'wedding' | 'engagement' | 'portrait' | 'event', sessionLocation: '' });

  const getClient = (clientId: string) => clients.find(c => c.id === clientId);
  const getClientName = (clientId: string) => {
    const c = getClient(clientId);
    return c ? `${c.firstName} ${c.lastName}` : 'Cliente Desconocido';
  };

  // When client or quote changes, auto-generate contract content
  const handleClientOrQuoteChange = (newClientId: string, newQuoteId: string) => {
    const client = clients.find(c => c.id === newClientId);
    const quote = quotes.find(q => q.id === newQuoteId);
    if (client && quote) {
      const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
      setForm(f => ({ ...f, clientId: newClientId, quoteId: newQuoteId, content: buildContractContent(client, quote, today) }));
    } else {
      setForm(f => ({ ...f, clientId: newClientId, quoteId: newQuoteId }));
    }
  };

  // Quotes filtered by selected client
  const clientQuotes = quotes.filter(q => q.clientId === form.clientId);

  const handleCreateOrUpdate = async () => {
    if (!form.clientId || !form.content) return;
    setSaving(true);
    try {
      if (editingContractId) {
        const { updateContractAction } = await import('@/app/(dashboard)/dashboard/contracts/actions');
        const result = await updateContractAction(editingContractId, {
          content: form.content,
          sessionDate: form.sessionDate || undefined,
          sessionType: form.sessionType,
          sessionLocation: form.sessionLocation || undefined,
        });
        if (result.success) {
          closeModal();
        } else {
          alert('Error al actualizar contrato: ' + result.error);
        }
      } else {
        const { createContractAction } = await import('@/app/(dashboard)/dashboard/contracts/actions');
        const result = await createContractAction({
          clientId: form.clientId,
          quoteId: form.quoteId || undefined,
          content: form.content,
          sessionDate: form.sessionDate || undefined,
          sessionType: form.sessionType,
          sessionLocation: form.sessionLocation || undefined,
        });
        if (result.success) {
          closeModal();
        } else {
          alert('Error al guardar contrato: ' + result.error);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al guardar el contrato');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContractId(null);
    setForm({ clientId: '', quoteId: '', content: '', sessionDate: '', sessionType: 'wedding', sessionLocation: '' });
  };

  const handleEdit = (contract: SerializableContract) => {
    // Parse metadata from content to fill form correctly
    let parsedDate = '';
    let parsedType = 'wedding';
    let parsedLocation = '';
    let parsedContent = contract.content;

    const firstLine = contract.content.split('\n')[0] || '';
    const dateMatch = firstLine.match(/\[SESSION_DATE:([^\]]+)\]/);
    const typeMatch = firstLine.match(/\[SESSION_TYPE:([^\]]+)\]/);
    const locationMatch = firstLine.match(/\[SESSION_LOCATION:([^\]]*)\]/);

    if (dateMatch) {
      parsedDate = dateMatch[1];
      parsedType = typeMatch?.[1] || 'wedding';
      parsedLocation = locationMatch?.[1] || '';
      // Remove the metadata line from the displayed content in the form
      parsedContent = contract.content.split('\n').slice(1).join('\n');
    }

    setForm({
      clientId: contract.clientId,
      quoteId: contract.quoteId || '',
      content: parsedContent,
      sessionDate: parsedDate,
      sessionType: parsedType as 'wedding' | 'engagement' | 'portrait' | 'event',
      sessionLocation: parsedLocation,
    });
    setEditingContractId(contract.id);
    setShowModal(true);
  };

  const handleDelete = async (contractId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contrato? Esta acción no se puede deshacer.')) return;
    setDeletingId(contractId);
    try {
      const { deleteContractAction } = await import('@/app/(dashboard)/dashboard/contracts/actions');
      const result = await deleteContractAction(contractId);
      if (!result.success) {
        alert('Error al eliminar contrato: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al eliminar el contrato');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendLink = async (contractId: string) => {
    setSendingId(contractId);
    setLastSigningUrl(null);
    try {
      const { sendContractLinkAction } = await import('@/app/(dashboard)/dashboard/contracts/actions');
      const result = await sendContractLinkAction(contractId);
      if (result.success) {
        setLastSigningUrl(result.signingUrl || null);
        alert('✅ Enlace de firma enviado por correo al cliente.');
      } else {
        alert('Error al enviar: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al enviar el enlace');
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadPDF = async (contract: SerializableContract) => {
    setLoadingPdfId(contract.id);
    try {
      const clientData = getClient(contract.clientId);
      const { pdf } = await import('@react-pdf/renderer');
      const { ContractPDF } = await import('../pdf/ContractPDF');
      const React = await import('react');

      const blob = await pdf(React.createElement(ContractPDF, {
        contract: {
          content: contract.content,
          clientName: getClientName(contract.clientId),
          clientEmail: clientData?.email || '',
          status: contract.status,
          hashSignature: contract.hashSignature,
          signedAt: contract.signedAt,
          createdAt: contract.createdAt,
        }
      }) as any).toBlob(); // eslint-disable-line @typescript-eslint/no-explicit-any

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${getClientName(contract.clientId).replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF del contrato');
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handleCreateSession = async (contractId: string) => {
    setCreatingSessionId(contractId);
    try {
      const { createSessionFromContractAction } = await import('@/app/(dashboard)/dashboard/contracts/actions');
      const result = await createSessionFromContractAction(contractId);
      if (result.success) {
        alert('✅ Sesión creada correctamente. Ve a la sección de Sesiones para verla.');
      } else {
        alert('Error al crear sesión: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al crear la sesión');
    } finally {
      setCreatingSessionId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            Contratos <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">SHA-256</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gestiona y firma contratos con integridad criptográfica.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer">
          <FilePlus className="w-4 h-4" />
          Nuevo Contrato
        </button>
      </div>

      {/* Last signing url banner */}
      {lastSigningUrl && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
          <Link className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-300 mb-1">Enlace de firma generado</p>
            <p className="text-xs text-blue-400/80 break-all font-mono">{lastSigningUrl}</p>
          </div>
          <button onClick={() => setLastSigningUrl(null)} className="text-blue-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">{editingContractId ? 'Editar Contrato' : 'Nuevo Contrato'}</h2>
              <button onClick={closeModal} className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Cliente *</label>
                  <select
                    value={form.clientId}
                    onChange={e => handleClientOrQuoteChange(e.target.value, '')}
                    disabled={!!editingContractId}
                    className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors disabled:opacity-40"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Cotización (opcional)</label>
                  <select
                    value={form.quoteId}
                    onChange={e => handleClientOrQuoteChange(form.clientId, e.target.value)}
                    disabled={!form.clientId || !!editingContractId}
                    className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors disabled:opacity-40"
                  >
                    <option value="">Sin cotización vinculada</option>
                    {clientQuotes.map(q => (
                      <option key={q.id} value={q.id}>
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(q.totalAmount)} — {q.items.length} servicio(s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.quoteId && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-md px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Contrato pre-generado automáticamente con los datos de la cotización
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Contenido del Contrato *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors resize-y font-mono"
                  placeholder="Selecciona un cliente y cotización para pre-generar el contrato automáticamente, o escríbelo manualmente..."
                />
              </div>

              {/* Session date & type */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">📅 Fecha de Sesión *</label>
                  <input
                    type="datetime-local"
                    value={form.sessionDate}
                    onChange={e => setForm({ ...form, sessionDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Tipo de Sesión</label>
                  <select
                    value={form.sessionType}
                    onChange={e => setForm({ ...form, sessionType: e.target.value as typeof form.sessionType })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  >
                    <option value="wedding">Boda</option>
                    <option value="engagement">Compromiso</option>
                    <option value="portrait">Retrato</option>
                    <option value="event">Evento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">📍 Ubicación de la Sesión</label>
                <input
                  value={form.sessionLocation}
                  onChange={e => setForm({ ...form, sessionLocation: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  placeholder="Hacienda Los Pinos, Guadalajara"
                />
              </div>
              <p className="text-xs text-zinc-500 -mt-2">Fecha, tipo y ubicación se copiarán automáticamente al registro de sesión al firmar.</p>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-md p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">Una vez guardado, podrás enviar el enlace de firma al cliente por correo electrónico.</p>
              </div>

              <button
                onClick={handleCreateOrUpdate}
                disabled={!form.clientId || !form.content || saving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : editingContractId ? 'Actualizar Contrato' : 'Guardar Contrato'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-white/5 bg-black/20 overflow-hidden glass-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Contrato</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Sello SHA-256</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialContracts.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No hay contratos registrados.</td></tr>
            ) : (
              initialContracts.map((contract) => {
                const StatusIcon = statusConfig[contract.status].icon;
                const isSendingThis = sendingId === contract.id;
                const isDownloadingThis = loadingPdfId === contract.id;
                const isCreatingSession = creatingSessionId === contract.id;
                return (
                  <tr key={contract.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{getClientName(contract.clientId)}</span>
                        <span className="text-xs text-zinc-500 mt-1 truncate max-w-[260px] font-mono">
                          {contract.content.substring(0, 55)}...
                        </span>
                        {contract.signedAt && (
                          <span className="text-xs text-emerald-400 mt-1">
                            Firmado: {new Date(contract.signedAt).toLocaleDateString('es-MX')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig[contract.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[contract.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {contract.hashSignature ? (
                        <div className="flex items-center gap-2 text-emerald-400/90 text-xs font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="truncate max-w-[180px]" title={contract.hashSignature}>{contract.hashSignature}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Sin Sellar</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPDF(contract)}
                          disabled={isDownloadingThis}
                          title="Descargar contrato en PDF"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDownloadingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          PDF
                        </button>

                        {/* Send signing link — only for draft contracts */}
                        {contract.status !== 'signed' && (
                          <button
                            onClick={() => handleSendLink(contract.id)}
                            disabled={isSendingThis}
                            title="Enviar enlace de firma al cliente"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSendingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {isSendingThis ? 'Enviando...' : 'Firmar'}
                          </button>
                        )}

                        {/* Signed: create session manually if needed */}
                        {contract.status === 'signed' && (
                          <button
                            onClick={() => handleCreateSession(contract.id)}
                            disabled={isCreatingSession}
                            title="Crear sesión desde este contrato firmado"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isCreatingSession ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarPlus className="w-3.5 h-3.5" />}
                            {isCreatingSession ? 'Creando...' : 'Sesión'}
                          </button>
                        )}

                        {contract.status !== 'signed' && (
                          <button
                            onClick={() => handleEdit(contract)}
                            title="Editar contrato"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(contract.id)}
                          disabled={deletingId === contract.id}
                          title="Eliminar contrato"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === contract.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
