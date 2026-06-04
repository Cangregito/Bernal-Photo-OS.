'use client';

import { useState, useMemo } from 'react';
import { 
  Users, Camera, TrendingUp, Clock, ChevronLeft, ChevronRight, 
  MapPin, FileSignature, CheckCircle, Send, FileEdit, XCircle,
  DollarSign, Percent, BarChart3, Receipt, Wallet2 
} from 'lucide-react';
import { MockAnalyticsService } from '../../../infrastructure/services/MockAnalyticsService';
import { FinancialTrendChart, TimeSplitChart, ExpensePieChart, ConversionPipeline } from './AnalyticsCharts';

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
  draft: 'bg-zinc-500/10 text-muted-foreground border-border/20',
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
  
  // Pestaña Activa: 'overview' (calendario/listas) | 'financials' (graficos dinero) | 'operations' (graficos tiempos/sla/conversión)
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'operations'>('overview');
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ─── Carga de Datos de Analítica ──────────────────────────────
  const analyticsSummary = useMemo(() => MockAnalyticsService.getSummary(), []);
  const monthlyFinancials = useMemo(() => MockAnalyticsService.getMonthlyFinancials(), []);
  const monthlyOperations = useMemo(() => MockAnalyticsService.getMonthlyOperations(), []);
  const expenseCategories = useMemo(() => MockAnalyticsService.getExpenseCategories(), []);

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

  // ─── Stats cards con datos reales (Vista General) ───────────
  const stats = [
    { name: 'Clientes Activos', value: String(data.stats.totalClients), icon: Users, color: 'from-blue-500/20 to-blue-600/5' },
    { name: 'Sesiones Programadas', value: String(data.stats.totalSessions), icon: Camera, color: 'from-emerald-500/20 to-emerald-600/5' },
    { name: 'Ingresos Totales', value: formatCurrency(data.stats.totalRevenue || analyticsSummary.totalRevenue), icon: TrendingUp, color: 'from-amber-500/20 to-amber-600/5' },
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Panel de Control Analítico</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestión operativa, métricas de rentabilidad y control del tiempo.</p>
        </div>

        {/* Selector de Pestañas Estilo Glass */}
        <div className="flex bg-muted/80 border border-border p-1 rounded-xl w-fit self-start md:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'overview' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Vista General
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'financials' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Finanzas
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'operations' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tiempos & Pipeline
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* PESTAÑA: VISTA GENERAL (Original con mejoras de datos) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="glass-card rounded-xl p-5 relative overflow-hidden group hover:border-border transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="flex items-center justify-between relative z-10">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-3 relative z-10">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Grid: Calendar + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Calendario */}
            <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-border">
              {/* Nav del mes */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">{MONTHS_ES[currentMonth]} {currentYear}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">Hoy</button>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Contenedor responsivo del calendario */}
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  {/* Header de días */}
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS_ES.map(d => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>

                  {/* Grid de días */}
                  <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
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
                            ${day.isCurrentMonth ? 'text-foreground hover:bg-accent' : 'text-zinc-700 cursor-default'}
                            ${day.isToday ? 'font-bold text-foreground' : ''}
                            ${isSelected ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30 rounded-lg' : ''}
                          `}
                        >
                          <span className={day.isToday ? 'w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-foreground text-xs font-bold' : ''}>{day.day}</span>
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
                <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Sesiones del {new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h4>
                  {selectedSessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin sesiones programadas.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSessions.map(s => {
                        const StatusIcon = statusIcons[s.status] || Clock;
                        return (
                          <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent border border-border hover:bg-accent transition-colors">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[s.status]}`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{s.clientName}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-muted-foreground">{typeLabels[s.type] || s.type}</span>
                                {s.location && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
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

            {/* Sidebar derecho */}
            <div className="space-y-6">

              {/* Próximas sesiones */}
              <div className="glass-card rounded-xl p-5 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" /> Próximas Sesiones
                </h3>
                <div className="space-y-3">
                  {upcomingSessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No hay sesiones próximas.</p>
                  ) : (
                    upcomingSessions.map(s => {
                      const d = new Date(s.date);
                      const daysUntil = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={s.id} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br bg-muted border border-border flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground uppercase leading-none">{MONTHS_ES[d.getMonth()].substring(0, 3)}</span>
                            <span className="text-sm font-bold text-foreground leading-none">{d.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{s.clientName}</p>
                            <p className="text-xs text-muted-foreground">{typeLabels[s.type] || s.type} · {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `en ${daysUntil} días`}</p>
                          </div>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'confirmed' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Contratos recientes */}
              <div className="glass-card rounded-xl p-5 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-blue-400" /> Contratos Recientes
                </h3>
                <div className="space-y-3">
                  {data.contracts.slice(0, 3).map(c => {
                    const StatusIcon = statusIcons[c.status] || Clock;
                    return (
                      <div key={c.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColors[c.status]}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{c.clientName}</p>
                          <p className="text-xs text-muted-foreground">{statusLabels[c.status]}</p>
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
              <div className="glass-card rounded-xl p-5 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Cotizaciones
                </h3>
                <div className="space-y-3">
                  {data.quotes.slice(0, 3).map(q => {
                    const StatusIcon = statusIcons[q.status] || FileEdit;
                    return (
                      <div key={q.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColors[q.status]}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{q.clientName}</p>
                          <p className="text-xs text-muted-foreground">{statusLabels[q.status]}</p>
                        </div>
                        <span className="text-sm font-medium text-foreground">{formatCurrency(q.totalAmount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* PESTAÑA: ANÁLISIS FINANCIERO                             */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'financials' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* KPI Cards Financieras */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Ingreso Neto (Margen)</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{formatCurrency(analyticsSummary.netProfit)}</h3>
                <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> {analyticsSummary.averageMargin}% Margen Promedio
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Gastos Totales (Anual)</p>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{formatCurrency(analyticsSummary.totalExpenses)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Suscripciones fijas + Costo variable
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Ticket Promedio (AOV)</p>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Wallet2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{formatCurrency(analyticsSummary.averageTicket)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor medio por sesión contratada
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Cumplimiento Presupuesto</p>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{analyticsSummary.budgetComplianceRate}%</h3>
                <p className="text-xs text-emerald-400 font-medium mt-1">
                  Upselling promedio del +11.5%
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico de Línea Temporal */}
          <FinancialTrendChart data={monthlyFinancials} />

          {/* Fila: Dona de Categoría de Gastos + Tabla de Detalle Histórico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ExpensePieChart data={expenseCategories} />
            </div>

            {/* Tabla de Resultados Mensuales */}
            <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-border space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Estado de Resultados Mensual</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Detalle tabular para exportación y auditoría</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-medium">
                      <th className="py-2.5">Mes</th>
                      <th className="py-2.5 text-right">Ingresos</th>
                      <th className="py-2.5 text-right">Gastos</th>
                      <th className="py-2.5 text-right">Utilidad Neta</th>
                      <th className="py-2.5 text-right">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-foreground font-medium">
                    {monthlyFinancials.slice(-6).map((m, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2 text-muted-foreground">{m.monthName}</td>
                        <td className="py-2 text-right text-emerald-400">{formatCurrency(m.revenue)}</td>
                        <td className="py-2 text-right text-rose-400">{formatCurrency(m.expenses)}</td>
                        <td className="py-2 text-right text-blue-400">{formatCurrency(m.profit)}</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${m.margin >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {m.margin}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* PESTAÑA: TIEMPOS, SLA & PIPELINE                        */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'operations' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* KPI Cards Operativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">SLA de Entrega Promedio</p>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{analyticsSummary.averageDeliveryDays} Días</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Desde toma hasta entrega final
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Ratio de Eficiencia de Edición</p>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{analyticsSummary.efficiencyRatio}x</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Horas de edición por hora de disparo
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Conversión de Cotizaciones</p>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{analyticsSummary.quoteAcceptanceRate}%</h3>
                <p className="text-xs text-emerald-400 font-medium mt-1">
                  Cotizaciones aceptadas por clientes
                </p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-border relative overflow-hidden group transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Conversión de Contratos</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <FileSignature className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-foreground">{analyticsSummary.contractSignatureRate}%</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  Firma en {analyticsSummary.averageContractSignTimeHours} horas prom.
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos de Operaciones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TimeSplitChart data={monthlyOperations} />
            </div>

            <div>
              <ConversionPipeline 
                quoteRate={analyticsSummary.quoteAcceptanceRate}
                contractRate={analyticsSummary.contractSignatureRate}
                avgSignTime={analyticsSummary.averageContractSignTimeHours}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

