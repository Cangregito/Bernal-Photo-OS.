'use client';

import { useState } from 'react';
import { User, Mail, Phone, Calendar, MoreHorizontal, Download, Plus, X, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { DigitalDossierPDF } from '../pdf/DigitalDossierPDF';

// Tipos serializables (strings en vez de Date)
export interface SerializableDossier {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
  sessions: Array<{
    id: string;
    clientId: string;
    date: string;
    type: string;
    status: string;
    location?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  quotes: Array<{
    id: string;
    clientId: string;
    items: Array<{ name: string; price: number; quantity: number }>;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  contracts: Array<{
    id: string;
    clientId: string;
    content: string;
    status: string;
    hashSignature?: string;
    signedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  generatedAt: string;
}

interface ClientTableProps {
  dossiers: SerializableDossier[];
}

// Convertir datos serializables a datos con Date para el PDF
function toDateDossier(d: SerializableDossier) {
  return {
    client: { ...d.client, createdAt: new Date(d.client.createdAt), updatedAt: new Date(d.client.updatedAt) },
    sessions: d.sessions.map(s => ({ ...s, date: new Date(s.date), createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })),
    quotes: d.quotes.map(q => ({ ...q, validUntil: new Date(), createdAt: new Date(q.createdAt), updatedAt: new Date(q.updatedAt) })),
    contracts: d.contracts.map(c => ({ ...c, signedAt: c.signedAt ? new Date(c.signedAt) : undefined, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })),
    generatedAt: new Date(d.generatedAt),
  };
}

export function ClientTable({ dossiers: initialDossiers }: ClientTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });


  const handleDownloadPDF = async (dossier: SerializableDossier) => {
    setLoadingPdf(dossier.client.id);
    try {
      const dateDossier = toDateDossier(dossier);
      const blob = await pdf(<DigitalDossierPDF dossier={dateDossier as Parameters<typeof DigitalDossierPDF>[0]['dossier']} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Expediente_${dossier.client.firstName}_${dossier.client.lastName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setLoadingPdf(null);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleCreateClient = async () => {
    if (!form.firstName || !form.lastName || !form.email) return;
    setSaving(true);
    try {
      const { createClientAction } = await import('@/app/(dashboard)/dashboard/clients/actions');
      const result = await createClientAction({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      });

      if (result.success) {
        setForm({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
        setShowModal(false);
      } else {
        console.error(result.error);
        alert('Error al crear el cliente: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">

      {/* Header con botón funcional */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Clientes</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestiona los expedientes centrales de tus clientes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Modal para Nuevo Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Nuevo Cliente</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Nombre *</label>
                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                    placeholder="Ana"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Apellido *</label>
                  <input
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                    placeholder="García"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Correo Electrónico *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                  placeholder="ana@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors resize-none"
                  placeholder="Boda en jardín, estilo bohemio..."
                />
              </div>
              <button
                onClick={handleCreateClient}
                disabled={!form.firstName || !form.lastName || !form.email || saving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
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
            {initialDossiers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              initialDossiers.map((dossier) => {
                const { client } = dossier;
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
                        <button
                          onClick={() => handleDownloadPDF(dossier)}
                          disabled={loadingPdf === client.id}
                          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          title="Descargar Expediente PDF"
                        >
                          {loadingPdf === client.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer" title="Opciones">
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
