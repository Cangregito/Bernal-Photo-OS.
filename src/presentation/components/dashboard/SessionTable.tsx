'use client';

import { useState } from 'react';
import {
  CalendarDays, MapPin, Clock, CheckCircle, XCircle,
  CalendarPlus, X, Loader2, Pencil, Mail, Phone, ExternalLink,
} from 'lucide-react';

type SessionType = 'wedding' | 'engagement' | 'portrait' | 'event';
type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface SerializableSession {
  id: string;
  clientId: string;
  date: string;
  type: SessionType;
  status: SessionStatus;
  location?: string;
  notes?: string;
}

export interface SerializableClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface SessionTableProps {
  sessions: SerializableSession[];
  clients: SerializableClient[];
}

const typeMap: Record<SessionType, string> = {
  wedding: '💍 Boda',
  engagement: '💑 Compromiso',
  portrait: '📸 Retrato',
  event: '🎉 Evento',
};

const statusConfig: Record<SessionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
  completed: { label: 'Completado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

// Format a Date or ISO string for datetime-local input
function toDatetimeLocal(dateStr: string) {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionTable({ sessions: initialSessions, clients }: SessionTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editSession, setEditSession] = useState<SerializableSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [form, setForm] = useState({
    clientId: '', date: '', type: 'wedding' as SessionType, location: '', notes: '',
  });

  const [editForm, setEditForm] = useState({
    date: '', type: 'wedding' as SessionType, status: 'pending' as SessionStatus, location: '', notes: '',
  });

  const getClient = (clientId: string) => clients.find(c => c.id === clientId);
  const getClientName = (clientId: string) => {
    const c = getClient(clientId);
    return c ? `${c.firstName} ${c.lastName}` : 'Cliente Desconocido';
  };

  const mapsUrl = (location: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  const openEdit = (session: SerializableSession) => {
    setEditSession(session);
    setEditForm({
      date: toDatetimeLocal(session.date),
      type: session.type,
      status: session.status,
      location: session.location || '',
      notes: session.notes || '',
    });
  };

  const handleCreate = async () => {
    if (!form.clientId || !form.date) return;
    setSaving(true);
    try {
      const { createSessionAction } = await import('@/app/(dashboard)/dashboard/sessions/actions');
      const result = await createSessionAction({
        clientId: form.clientId,
        date: form.date,
        type: form.type,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      if (result.success) {
        setForm({ clientId: '', date: '', type: 'wedding', location: '', notes: '' });
        setShowCreateModal(false);
      } else {
        alert('Error al crear la sesión: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al crear la sesión');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editSession) return;
    setEditSaving(true);
    try {
      const { updateSessionAction } = await import('@/app/(dashboard)/dashboard/sessions/actions');
      const result = await updateSessionAction(editSession.id, {
        date: editForm.date,
        type: editForm.type,
        status: editForm.status,
        location: editForm.location || undefined,
        notes: editForm.notes || undefined,
      });
      if (result.success) {
        setEditSession(null);
      } else {
        alert('Error al actualizar la sesión: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al actualizar la sesión');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Sesiones</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestiona los eventos fotográficos y su estatus.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer">
          <CalendarPlus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Nueva Sesión</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Cliente *</label>
                <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Fecha *</label>
                  <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as SessionType })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                    <option value="wedding">Boda</option>
                    <option value="engagement">Compromiso</option>
                    <option value="portrait">Retrato</option>
                    <option value="event">Evento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Ubicación</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" placeholder="Hacienda Los Pinos, Gdl" />
              </div>
              <button onClick={handleCreate} disabled={!form.clientId || !form.date || saving} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Sesión'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-zinc-100">Editar Sesión</h2>
              <button onClick={() => setEditSession(null)} className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-zinc-400 mb-6">{getClientName(editSession.clientId)}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">📅 Nueva Fecha *</label>
                  <input type="datetime-local" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value as SessionType })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                    <option value="wedding">Boda</option>
                    <option value="engagement">Compromiso</option>
                    <option value="portrait">Retrato</option>
                    <option value="event">Evento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Estatus</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as SessionStatus })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Ubicación</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" placeholder="Hacienda Los Pinos, Gdl" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Notas</label>
                <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors resize-none" placeholder="Observaciones adicionales..." />
              </div>
              <button onClick={handleUpdate} disabled={!editForm.date || editSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
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
              <th className="px-6 py-4 font-medium">Evento</th>
              <th className="px-6 py-4 font-medium">Fecha y Lugar</th>
              <th className="px-6 py-4 font-medium hidden lg:table-cell">Contacto</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Estatus</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialSessions.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No hay sesiones programadas.</td></tr>
            ) : (
              initialSessions.map((session) => {
                const StatusIcon = statusConfig[session.status].icon;
                return (
                  <tr key={session.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{getClientName(session.clientId)}</span>
                        <span className="text-xs text-zinc-400 mt-1">{typeMap[session.type]}</span>
                        {session.notes && (
                          <span className="text-xs text-zinc-600 mt-1 truncate max-w-[200px]">{session.notes}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CalendarDays className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <span className="text-sm">
                            {new Date(session.date).toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {new Date(session.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs
                        </div>
                        {session.location && (
                          <a
                            href={mapsUrl(session.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs transition-colors group"
                            title="Abrir en Google Maps"
                          >
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[180px] underline-offset-2 group-hover:underline">{session.location}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
                          </a>
                        )}
                      </div>
                    </td>
                    {/* Contact info */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {(() => {
                        const client = getClient(session.clientId);
                        if (!client) return <span className="text-zinc-600 text-xs">—</span>;
                        return (
                          <div className="flex flex-col gap-1.5">
                            <a
                              href={`mailto:${client.email}`}
                              className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 text-xs transition-colors"
                              title={client.email}
                            >
                              <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                              <span className="truncate max-w-[160px]">{client.email}</span>
                            </a>
                            {client.phone && (
                              <a
                                href={`tel:${client.phone}`}
                                className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 text-xs transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                <span>{client.phone}</span>
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig[session.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[session.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(session)}
                        title="Editar sesión"
                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
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
