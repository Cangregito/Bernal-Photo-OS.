'use client';

import { useState, useMemo } from 'react';
import { Users, Camera, TrendingUp, Clock, ChevronLeft, ChevronRight, MapPin, FileSignature, CheckCircle, Send, FileEdit, XCircle } from 'lucide-react';

// ─── Tipos serializables ────────────────────────────────────────
export interface DashboardSession {
  id: string;
  clientName: string;
  date: string;
  type: string;
  status: string;
  location?: string;
}

export interface DashboardQuote {
  id: string;
  clientName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardContract {
  id: string;
  clientName: string;
  status: string;
  hashSignature?: string;
  signedAt?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalSessions: number;
  pendingSessions: number;
  totalRevenue: number;
  pendingContracts: number;
}

export interface DashboardData {
  stats: DashboardStats;
  sessions: DashboardSession[];
  quotes: DashboardQuote[];
  contracts: DashboardContract[];
}

// ─── Maps de tipos / status ─────────────────────────────────────
const typeLabels: Record<string, string> = { wedding: 'Boda', engagement: 'Compromiso', portrait: 'Retrato', event: 'Evento' };
const statusIcons: Record<string, React.ElementType> = { draft: FileEdit, sent: Send, accepted: CheckCircle, rejected: XCircle, signed: FileSignature, pending: Clock, confirmed: CheckCircle, completed: CheckCircle, cancelled: XCircle };
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  signed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};
const statusLabels: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada', rejected: 'Rechazada', signed: 'Firmado' };

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);
}

export function DashboardPanel({ data }: { data: DashboardData }) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ─── Calcular grid del calendario ──────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    let startDayOfWeek = firstDay.getDay() - 1; // Lunes = 0
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: Array<{ day: number; date: string; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Días del mes anterior
    const prevMonthLast = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      days.push({ day: d, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false, isToday: false });
    }

    // Días del mes actual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      days.push({ day: d, date: dateStr, isCurrentMonth: true, isToday });
    }

    // Completar hasta 42 (6 filas)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, date: '', isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [currentMonth, currentYear, today]);

  // ─── Mapear sesiones a fechas ──────────────────────────────
  const sessionsByDate = useMemo(() => {
    const map: Record<string, DashboardSession[]> = {};
    data.sessions.forEach(s => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [data.sessions]);

  const selectedSessions = selectedDate ? (sessionsByDate[selectedDate] || []) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  // ─── Stats cards con datos reales ─────────────────────────
  const stats = [
    { name: 'Clientes Activos', value: String(data.stats.totalClients), icon: Users, color: 'from-blue-500/20 to-blue-600/5' },
    { name: 'Sesiones Programadas', value: String(data.stats.totalSessions), icon: Camera, color: 'from-emerald-500/20 to-emerald-600/5' },
    { name: 'Ingresos Totales', value: formatCurrency(data.stats.totalRevenue), icon: TrendingUp, color: 'from-amber-500/20 to-amber-600/5' },
    { name: 'Firmas Pendientes', value: String(data.stats.pendingContracts), icon: Clock, color: 'from-red-500/20 to-red-600/5' },
  ];

  // ─── Upcoming sessions ────────────────────────────────────
  const upcomingSessions = useMemo(() => {
    return data.sessions
      .filter(s => new Date(s.date) >= today && s.status !== 'cancelled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [data.sessions, today]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Panel de Control</h2>
        <p className="text-sm text-white/50 mt-1">Bienvenido a Bernal Photo OS. Resumen en tiempo real.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-card rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="flex items-center justify-between relative z-10">
                <p className="text-sm font-medium text-white/50">{stat.name}</p>
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Icon className="w-4 h-4 text-white/70" />
                </div>
              </div>
              <div className="mt-3 relative z-10">
                <h3 className="text-2xl font-bold tracking-tight text-white">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Calendar + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Calendario ─────────────────────────────────── */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-white/5">
          {/* Nav del mes */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">{MONTHS_ES[currentMonth]} {currentYear}</h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} className="px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">Hoy</button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Contenedor responsivo del calendario */}
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              {/* Header de días */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_ES.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-zinc-500 py-2">{d}</div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-px bg-white/[0.02] rounded-lg overflow-hidden">
                {calendarDays.map((day, i) => {
                  const hasSessions = day.isCurrentMonth && sessionsByDate[day.date]?.length > 0;
                  const isSelected = selectedDate === day.date;
                  return (
                    <button
                      key={i}
                      onClick={() => day.isCurrentMonth && setSelectedDate(isSelected ? null : day.date)}
                      disabled={!day.isCurrentMonth}
                      className={`
                        relative h-12 flex flex-col items-center justify-center text-sm transition-all duration-150 cursor-pointer
                        ${day.isCurrentMonth ? 'text-zinc-300 hover:bg-white/5' : 'text-zinc-700 cursor-default'}
                        ${day.isToday ? 'font-bold text-white' : ''}
                        ${isSelected ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30 rounded-lg' : ''}
                      `}
                    >
                      <span className={day.isToday ? 'w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold' : ''}>{day.day}</span>
                      {hasSessions && (
                        <div className="flex gap-0.5 mt-0.5">
                          {sessionsByDate[day.date].map((s, j) => (
                            <span key={j} className={`w-1.5 h-1.5 rounded-full ${s.status === 'confirmed' ? 'bg-emerald-400' : s.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detalle del día seleccionado */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">
                Sesiones del {new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              {selectedSessions.length === 0 ? (
                <p className="text-xs text-zinc-500">Sin sesiones programadas.</p>
              ) : (
                <div className="space-y-2">
                  {selectedSessions.map(s => {
                    const StatusIcon = statusIcons[s.status] || Clock;
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[s.status]}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-200">{s.clientName}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-zinc-400">{typeLabels[s.type] || s.type}</span>
                            {s.location && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[s.status]}`}>{statusLabels[s.status]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Sidebar derecho ────────────────────────────── */}
        <div className="space-y-6">

          {/* Próximas sesiones */}
          <div className="glass-card rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" /> Próximas Sesiones
            </h3>
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <p className="text-xs text-zinc-500">No hay sesiones próximas.</p>
              ) : (
                upcomingSessions.map(s => {
                  const d = new Date(s.date);
                  const daysUntil = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={s.id} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-zinc-500 uppercase leading-none">{MONTHS_ES[d.getMonth()].substring(0, 3)}</span>
                        <span className="text-sm font-bold text-white leading-none">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 truncate">{s.clientName}</p>
                        <p className="text-xs text-zinc-500">{typeLabels[s.type] || s.type} · {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `en ${daysUntil} días`}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'confirmed' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Contratos recientes */}
          <div className="glass-card rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-blue-400" /> Contratos Recientes
            </h3>
            <div className="space-y-3">
              {data.contracts.map(c => {
                const StatusIcon = statusIcons[c.status] || Clock;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColors[c.status]}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{c.clientName}</p>
                      <p className="text-xs text-zinc-500">{statusLabels[c.status]}</p>
                    </div>
                    {c.hashSignature && (
                      <span className="text-[10px] font-mono text-emerald-500/70 truncate max-w-[60px]">{c.hashSignature.substring(0, 8)}…</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cotizaciones activas */}
          <div className="glass-card rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Cotizaciones
            </h3>
            <div className="space-y-3">
              {data.quotes.map(q => {
                const StatusIcon = statusIcons[q.status] || FileEdit;
                return (
                  <div key={q.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColors[q.status]}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{q.clientName}</p>
                      <p className="text-xs text-zinc-500">{statusLabels[q.status]}</p>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">{formatCurrency(q.totalAmount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
