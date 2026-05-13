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
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
          <div className="bg-popover border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Nuevo Cliente</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                    placeholder="Ana"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Apellido *</label>
                  <input
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                    placeholder="García"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Correo Electrónico *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                  placeholder="ana@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors resize-none"
                  placeholder="Boda en jardín, estilo bohemio..."
                />
              </div>
              <button
                onClick={handleCreateClient}
                disabled={!form.firstName || !form.lastName || !form.email || saving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-foreground px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Content */}
      <div className="rounded-md border border-border bg-black/20 overflow-hidden glass-card">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Registro</th>
                <th className="px-6 py-4 font-medium text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {initialDossiers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No hay clientes registrados.
                  </td>
                </tr>
              ) : (
                initialDossiers.map((dossier) => {
                  const { client } = dossier;
                  return (
                    <tr key={client.id} className="hover:bg-accent transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-foreground">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {client.firstName} {client.lastName}
                            </div>
                            {client.notes && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {client.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-foreground">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(client.createdAt).toLocaleDateString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(dossier)}
                            disabled={loadingPdf === client.id}
                            className="p-2 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Descargar Expediente PDF"
                          >
                            {loadingPdf === client.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" title="Opciones">
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

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-border/20">
          {initialDossiers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No hay clientes registrados.</div>
          ) : (
            initialDossiers.map((dossier) => {
              const { client } = dossier;
              return (
                <div key={client.id} className="p-5 flex flex-col gap-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-semibold text-foreground text-base truncate">{client.firstName} {client.lastName}</h3>
                      {client.notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{client.notes}</p>}
                    </div>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3 space-y-2.5 border border-border/50">
                    <div className="flex items-center gap-2 text-foreground text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-foreground text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground text-xs pt-2 border-t border-border/50">
                      <Calendar className="w-3.5 h-3.5" />
                      Registro: {new Date(client.createdAt).toLocaleDateString('es-MX')}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleDownloadPDF(dossier)}
                      disabled={loadingPdf === client.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {loadingPdf === client.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Expediente PDF
                    </button>
                    <button className="flex items-center justify-center p-2.5 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
