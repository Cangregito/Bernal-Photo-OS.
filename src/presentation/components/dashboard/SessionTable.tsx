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
          <h1 className="text-2xl font-semibold text-foreground">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los eventos fotográficos y su estatus.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer">
          <CalendarPlus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-popover border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Nueva Sesión</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cliente *</label>
                <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha *</label>
                  <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as SessionType })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                    <option value="wedding">Boda</option>
                    <option value="engagement">Compromiso</option>
                    <option value="portrait">Retrato</option>
                    <option value="event">Evento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ubicación</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" placeholder="Hacienda Los Pinos, Gdl" />
              </div>
              <button onClick={handleCreate} disabled={!form.clientId || !form.date || saving} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-foreground px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
          <div className="bg-popover border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Editar Sesión</h2>
              <button onClick={() => setEditSession(null)} className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{getClientName(editSession.clientId)}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">📅 Nueva Fecha *</label>
                  <input type="datetime-local" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value as SessionType })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                    <option value="wedding">Boda</option>
                    <option value="engagement">Compromiso</option>
                    <option value="portrait">Retrato</option>
                    <option value="event">Evento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Estatus</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as SessionStatus })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors">
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ubicación</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors" placeholder="Hacienda Los Pinos, Gdl" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
                <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={2} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors resize-none" placeholder="Observaciones adicionales..." />
              </div>
              <button onClick={handleUpdate} disabled={!editForm.date || editSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-foreground px-4 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
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
                <th className="px-6 py-4 font-medium">Evento</th>
                <th className="px-6 py-4 font-medium">Fecha y Lugar</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Contacto</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Estatus</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {initialSessions.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No hay sesiones programadas.</td></tr>
              ) : (
                initialSessions.map((session) => {
                  const StatusIcon = statusConfig[session.status].icon;
                  return (
                    <tr key={session.id} className="hover:bg-accent transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{getClientName(session.clientId)}</span>
                          <span className="text-xs text-muted-foreground mt-1">{typeMap[session.type]}</span>
                          {session.notes && (
                            <span className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{session.notes}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-foreground">
                            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">
                              {new Date(session.date).toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
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
                          if (!client) return <span className="text-muted-foreground text-xs">—</span>;
                          return (
                            <div className="flex flex-col gap-1.5">
                              <a
                                href={`mailto:${client.email}`}
                                className="flex items-center gap-1.5 text-foreground hover:text-emerald-400 text-xs transition-colors"
                                title={client.email}
                              >
                                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="truncate max-w-[160px]">{client.email}</span>
                              </a>
                              {client.phone && (
                                <a
                                  href={`tel:${client.phone}`}
                                  className="flex items-center gap-1.5 text-foreground hover:text-emerald-400 text-xs transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
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
                          className="p-2 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors cursor-pointer"
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

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-border/20">
          {initialSessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No hay sesiones programadas.</div>
          ) : (
            initialSessions.map((session) => {
              const StatusIcon = statusConfig[session.status].icon;
              return (
                <div key={session.id} className="p-5 flex flex-col gap-4 hover:bg-accent/30 transition-colors">
                  {/* Header: Name, Type & Status */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base truncate">{getClientName(session.clientId)}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{typeMap[session.type]}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 ${statusConfig[session.status].color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{statusConfig[session.status].label}</span>
                    </div>
                  </div>

                  {/* Body: Date & Location */}
                  <div className="bg-background/50 rounded-lg p-3 space-y-2.5 border border-border/50">
                    <div className="flex items-center gap-2 text-foreground text-sm">
                      <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{new Date(session.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} a las {new Date(session.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2 text-foreground text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <a href={mapsUrl(session.location)} target="_blank" rel="noopener noreferrer" className="truncate text-blue-400 hover:underline">
                          {session.location}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => openEdit(session)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar Sesión
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
