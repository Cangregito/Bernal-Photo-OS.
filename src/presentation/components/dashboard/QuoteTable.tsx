'use client';

import { useState } from 'react';
import { FileEdit, CheckCircle, XCircle, Send, DollarSign, FilePlus, X, Plus, Trash2, Loader2, MoreHorizontal, Download } from 'lucide-react';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

interface QuoteItem {
  name: string;
  price: number;
  quantity: number;
}

export interface SerializableQuote {
  id: string;
  clientId: string;
  items: QuoteItem[];
  totalAmount: number;
  status: QuoteStatus;
  validUntil: string;
}

export interface SerializableClient {
  id: string;
  firstName: string;
  lastName: string;
}

interface QuoteTableProps {
  quotes: SerializableQuote[];
  clients: SerializableClient[];
}

const statusConfig: Record<QuoteStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Borrador', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: FileEdit },
  sent: { label: 'Enviada', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Send },
  accepted: { label: 'Aceptada', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export function QuoteTable({ quotes: initialQuotes, clients }: QuoteTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);
  const [form, setForm] = useState({ clientId: '', items: [{ name: '', price: 0, quantity: 1 }] as QuoteItem[] });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Cliente Desconocido';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  const addItem = () => setForm({ ...form, items: [...form.items, { name: '', price: 0, quantity: 1 }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, field: keyof QuoteItem, value: string | number) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, items });
  };

  const handleCreate = async () => {
    if (!form.clientId || form.items.length === 0) return;
    const validItems = form.items.filter(i => i.name && i.price > 0);
    if (validItems.length === 0) return;
    setSaving(true);
    try {
      const { createQuoteAction } = await import('@/app/(dashboard)/dashboard/quotes/actions');
      const result = await createQuoteAction({ clientId: form.clientId, items: validItems });
      if (result.success) {
        setForm({ clientId: '', items: [{ name: '', price: 0, quantity: 1 }] });
        setShowModal(false);
      } else {
        alert('Error al guardar cotización: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async (quoteId: string) => {
    setSendingId(quoteId);
    try {
      const { sendQuoteEmailAction } = await import('@/app/(dashboard)/dashboard/quotes/actions');
      const result = await sendQuoteEmailAction(quoteId);
      if (result.success) {
        alert('✅ Cotización enviada por correo al cliente.');
      } else {
        alert('Error al enviar correo: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al enviar el correo');
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadPDF = async (quote: SerializableQuote) => {
    setLoadingPdfId(quote.id);
    try {
      const clientName = getClientName(quote.clientId);
      const { pdf } = await import('@react-pdf/renderer');
      const { QuotePDF } = await import('../pdf/QuotePDF');
      const React = await import('react');
      const pdfData = {
        id: quote.id,
        clientName,
        clientEmail: '',
        items: quote.items,
        totalAmount: quote.totalAmount,
        status: quote.status,
        validUntil: quote.validUntil,
      };
      const blob = await pdf(React.createElement(QuotePDF, { quote: pdfData })).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cotizacion_${clientName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF');
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Cotizaciones</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestiona los presupuestos dinámicos y su cálculo financiero.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer">
          <FilePlus className="w-4 h-4" />
          Nueva Cotización
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Nueva Cotización</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Cliente *</label>
                <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Servicios</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} className="flex-1 bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="Ej: Cobertura 8hrs" />
                      <input type="number" value={item.price || ''} onChange={e => updateItem(i, 'price', Number(e.target.value))} className="w-24 bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="$" />
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="w-16 bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" min={1} />
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                  <Plus className="w-3 h-3" /> Agregar servicio
                </button>
              </div>
              <div className="text-right text-sm text-zinc-300 border-t border-white/5 pt-3">
                Total: <span className="font-semibold text-white">{formatCurrency(form.items.reduce((s, i) => s + (i.price * i.quantity), 0))}</span>
              </div>
              <button
                onClick={handleCreate}
                disabled={!form.clientId || !form.items.some(i => i.name && i.price > 0) || saving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Cotización'}
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
              <th className="px-6 py-4 font-medium">Cotización</th>
              <th className="px-6 py-4 font-medium">Items</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Monto Total</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Estatus</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialQuotes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No hay cotizaciones registradas.</td></tr>
            ) : (
              initialQuotes.map((quote) => {
                const StatusIcon = statusConfig[quote.status].icon;
                const isSendingThis = sendingId === quote.id;
                return (
                  <tr key={quote.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{getClientName(quote.clientId)}</span>
                        <span className="text-xs text-zinc-400 mt-1">Válida hasta: {new Date(quote.validUntil).toLocaleDateString('es-MX')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-zinc-300 text-xs">
                        {quote.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center max-w-[200px]">
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
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig[quote.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[quote.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPDF(quote)}
                          disabled={loadingPdfId === quote.id}
                          title="Descargar cotización en PDF"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPdfId === quote.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Download className="w-3.5 h-3.5" />
                          }
                          {loadingPdfId === quote.id ? 'PDF...' : 'PDF'}
                        </button>
                        {/* Send Email */}
                        <button
                          onClick={() => handleSendEmail(quote.id)}
                          disabled={isSendingThis}
                          title="Enviar cotización por correo al cliente"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingThis
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Send className="w-3.5 h-3.5" />
                          }
                          {isSendingThis ? 'Enviando...' : 'Enviar'}
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer">
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
