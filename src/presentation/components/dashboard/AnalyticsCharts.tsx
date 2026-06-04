// AnalyticsCharts.tsx
// Componentes de gráficos interactivos desarrollados a la medida con SVG y Tailwind CSS.
// Diseñados para máxima fidelidad, sin dependencias pesadas y con soporte de responsive design.

import { useState, useMemo } from 'react';
import { MonthlyFinancials, ExpenseCategoryDetail, OperationsTime } from '../../../infrastructure/services/MockAnalyticsService';

// Helper de formato de moneda
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);
}

// ────────────────────────────────────────────────────────────────
// 1. GRÁFICO DE TENDENCIA FINANCIERA (Área y Línea)
// ────────────────────────────────────────────────────────────────
interface FinancialTrendChartProps {
  data: MonthlyFinancials[];
}

export function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Dimensiones del SVG
  const width = 600;
  const height = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Encontrar valores máximos para escalar
  const maxVal = useMemo(() => {
    const vals = data.flatMap(d => [d.revenue, d.expenses]);
    return Math.max(...vals, 10000) * 1.1; // 10% margen superior
  }, [data]);

  // Coordenadas calculadas
  const points = useMemo(() => {
    return data.map((d, idx) => {
      const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
      const yRevenue = paddingTop + chartHeight - (d.revenue / maxVal) * chartHeight;
      const yExpenses = paddingTop + chartHeight - (d.expenses / maxVal) * chartHeight;
      const yProfit = paddingTop + chartHeight - (d.profit / maxVal) * chartHeight;
      return { x, yRevenue, yExpenses, yProfit, month: d.monthName, raw: d };
    });
  }, [data, chartWidth, chartHeight, maxVal]);

  // Generar trazado de línea/área
  const revenuePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, p, idx) => {
      return path + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yRevenue}`;
    }, '');
  }, [points]);

  const revenueAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    return `${revenuePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }, [points, revenuePath, chartHeight]);

  const expensesPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, p, idx) => {
      return path + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yExpenses}`;
    }, '');
  }, [points]);

  const profitPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, p, idx) => {
      return path + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yProfit}`;
    }, '');
  }, [points]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Flujo de Caja Histórico (12 Meses)</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Ingresos vs. Gastos y Utilidad Neta</p>
        </div>
        
        {/* Leyenda */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-emerald-500 block" />
            <span className="text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-rose-500 block" />
            <span className="text-muted-foreground">Gastos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-blue-500 block" />
            <span className="text-muted-foreground">Utilidad Neta</span>
          </div>
        </div>
      </div>

      <div className="relative glass-card rounded-xl p-4 border border-border overflow-hidden">
        {/* SVG responsivo */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas de cuadrícula horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const val = maxVal * (1 - ratio);
            return (
              <g key={i} className="opacity-20">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] font-sans fill-muted-foreground">{formatCurrency(val)}</text>
              </g>
            );
          })}

          {/* Áreas rellenas */}
          <path d={revenueAreaPath} fill="url(#revenueGrad)" />

          {/* Líneas principales */}
          <path d={revenuePath} fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={expensesPath} fill="none" stroke="rgb(244, 63, 94)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,2" />
          <path d={profitPath} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Nombres de los meses (Eje X) */}
          {points.map((p, idx) => {
            // Mostrar solo uno de cada dos meses si es pantalla chica para evitar amontonamiento
            if (idx % 2 !== 0 && idx !== points.length - 1) return null;
            return (
              <text key={idx} x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] fill-muted-foreground font-sans">
                {p.month.split(' ')[0]}
              </text>
            );
          })}

          {/* Zonas interactivas de columna (Hover) */}
          {points.map((p, idx) => {
            const colWidth = chartWidth / (data.length - 1);
            return (
              <rect
                key={idx}
                x={p.x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Marcadores e indicadores de Hover */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <g>
              <line
                x1={points[hoveredIdx].x}
                y1={paddingTop}
                x2={points[hoveredIdx].x}
                y2={paddingTop + chartHeight}
                stroke="var(--border)"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].yRevenue} r="5" fill="rgb(16, 185, 129)" stroke="var(--background)" strokeWidth="2" />
              <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].yExpenses} r="4" fill="rgb(244, 63, 94)" stroke="var(--background)" strokeWidth="1.5" />
              <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].yProfit} r="4" fill="rgb(59, 130, 246)" stroke="var(--background)" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Tooltip Dinámico Flotante */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div className="absolute top-4 right-4 bg-background/90 border border-border backdrop-blur-md rounded-lg p-2.5 text-[11px] shadow-lg animate-in fade-in duration-200 pointer-events-none">
            <p className="font-semibold text-foreground border-b border-border pb-1 mb-1">{points[hoveredIdx].month}</p>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Ingresos:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(points[hoveredIdx].raw.revenue)}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Gastos:</span>
                <span className="font-bold text-rose-400">{formatCurrency(points[hoveredIdx].raw.expenses)}</span>
              </div>
              <div className="flex items-center justify-between gap-6 border-t border-border/50 pt-0.5 mt-0.5">
                <span className="text-muted-foreground">U. Neta:</span>
                <span className="font-bold text-blue-400">{formatCurrency(points[hoveredIdx].raw.profit)}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Margen:</span>
                <span className="font-medium text-amber-400">{points[hoveredIdx].raw.margin}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 2. DISTRIBUCIÓN DEL TIEMPO (Shooting vs Edición + SLA de entrega)
// ────────────────────────────────────────────────────────────────
interface TimeSplitChartProps {
  data: OperationsTime[];
}

export function TimeSplitChart({ data }: TimeSplitChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 600;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Máximo para escala de horas (Shooting + Edición)
  const maxHours = useMemo(() => {
    return Math.max(...data.map(d => d.shootingHours + d.editingHours), 50) * 1.05;
  }, [data]);

  // Máximo para escala de entrega (Días)
  const maxDays = useMemo(() => {
    return Math.max(...data.map(d => d.averageDeliveryDays), 10) * 1.2;
  }, [data]);

  // Coordenadas
  const barWidth = (chartWidth / data.length) * 0.55;
  const barSpacing = (chartWidth / data.length);

  const items = useMemo(() => {
    return data.map((d, idx) => {
      const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
      
      const shootHeight = (d.shootingHours / maxHours) * chartHeight;
      const editHeight = (d.editingHours / maxHours) * chartHeight;
      
      const yEdit = paddingTop + chartHeight - editHeight;
      const yShoot = yEdit - shootHeight; // apiladas

      // Línea de días de entrega (Eje Y derecho)
      const xLine = paddingLeft + idx * barSpacing + barSpacing / 2;
      const yLine = paddingTop + chartHeight - (d.averageDeliveryDays / maxDays) * chartHeight;

      return { x, xLine, yLine, yShoot, yEdit, shootHeight, editHeight, raw: d };
    });
  }, [data, barSpacing, barWidth, chartHeight, maxHours, maxDays]);

  // Generar trazado de línea de días de entrega (SLA)
  const linePath = useMemo(() => {
    if (items.length === 0) return '';
    return items.reduce((path, item, idx) => {
      return path + `${idx === 0 ? 'M' : 'L'} ${item.xLine} ${item.yLine}`;
    }, '');
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Distribución del Tiempo y Tiempos de Entrega</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Horas de Sesión (Apilado) vs. SLA de Entrega en días (Línea)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-500 block" />
            <span className="text-muted-foreground">Horas Edición</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-400 block" />
            <span className="text-muted-foreground">Horas Shooting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-400 block relative"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute left-1 -top-0.5" /></span>
            <span className="text-muted-foreground">Entrega (Días Promedio)</span>
          </div>
        </div>
      </div>

      <div className="relative glass-card rounded-xl p-4 border border-border overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Grillas Horas (Eje Izquierdo) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const hourVal = Math.round(maxHours * (1 - ratio));
            const dayVal = Math.round(maxDays * (1 - ratio));
            return (
              <g key={i} className="opacity-20">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border)" strokeWidth="1" />
                {/* Texto Izquierdo: Horas */}
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-muted-foreground font-sans">{hourVal}h</text>
                {/* Texto Derecho: Días */}
                <text x={width - paddingRight + 8} y={y + 4} textAnchor="start" className="text-[10px] fill-amber-400/80 font-sans">{dayVal}d</text>
              </g>
            );
          })}

          {/* Barras de Horas Apiladas */}
          {items.map((item, idx) => (
            <g key={idx} className="transition-all duration-200">
              {/* Barra Edición */}
              <rect
                x={item.x}
                y={item.yEdit}
                width={barWidth}
                height={item.editHeight}
                fill="rgb(20, 184, 166)"
                rx="2"
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              {/* Barra Shooting */}
              <rect
                x={item.x}
                y={item.yShoot}
                width={barWidth}
                height={item.shootHeight}
                fill="rgb(45, 212, 191)"
                rx="2"
                className="opacity-85 hover:opacity-100 transition-opacity"
              />
            </g>
          ))}

          {/* Línea de SLA (Días de Entrega) */}
          <path d={linePath} fill="none" stroke="rgb(251, 191, 36)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Puntos en la línea de SLA */}
          {items.map((item, idx) => (
            <circle
              key={idx}
              cx={item.xLine}
              cy={item.yLine}
              r="4.5"
              fill="rgb(251, 191, 36)"
              stroke="var(--background)"
              strokeWidth="2"
              className="cursor-pointer"
            />
          ))}

          {/* Eje X: Meses */}
          {data.map((d, idx) => {
            if (idx % 2 !== 0 && idx !== data.length - 1) return null;
            return (
              <text key={idx} x={paddingLeft + idx * barSpacing + barSpacing / 2} y={height - 8} textAnchor="middle" className="text-[10px] fill-muted-foreground font-sans">
                {d.monthName.split(' ')[0]}
              </text>
            );
          })}

          {/* Zonas interactivas verticales */}
          {items.map((item, idx) => (
            <rect
              key={idx}
              x={paddingLeft + idx * barSpacing}
              y={paddingTop}
              width={barSpacing}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Tooltip Dinámico */}
        {hoveredIdx !== null && items[hoveredIdx] && (
          <div className="absolute top-4 right-4 bg-background/90 border border-border backdrop-blur-md rounded-lg p-2.5 text-[11px] shadow-lg animate-in fade-in duration-200 pointer-events-none">
            <p className="font-semibold text-foreground border-b border-border pb-1 mb-1">{items[hoveredIdx].raw.monthName}</p>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Shooting:</span>
                <span className="font-bold text-teal-300">{items[hoveredIdx].raw.shootingHours} horas</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Edición:</span>
                <span className="font-bold text-teal-400">{items[hoveredIdx].raw.editingHours} horas</span>
              </div>
              <div className="flex items-center justify-between gap-6 border-t border-border/50 pt-0.5 mt-0.5">
                <span className="text-muted-foreground">SLA Entrega:</span>
                <span className="font-bold text-amber-400">{items[hoveredIdx].raw.averageDeliveryDays} días prom.</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Sesiones:</span>
                <span className="font-medium text-foreground">{items[hoveredIdx].raw.sessionCount} programadas</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 3. DESGLOSE DE GASTOS (Gráfico de Dona)
// ────────────────────────────────────────────────────────────────
// Colores estables para las categorías de gastos (definidos fuera del render para evitar recreación)
const EXPENSE_COLORS = [
  'rgb(59, 130, 246)', // Blue
  'rgb(16, 185, 129)', // Emerald
  'rgb(244, 63, 94)',  // Rose
  'rgb(251, 191, 36)', // Amber
  'rgb(139, 92, 246)', // Violet
  'rgb(107, 114, 128)' // Gray
];

interface ExpensePieChartProps {
  data: ExpenseCategoryDetail[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Cálculos de la dona
  const total = useMemo(() => data.reduce((sum, d) => sum + d.amount, 0), [data]);
  
  const size = 160;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 14;

  const segments = useMemo(() => {
    let currentAngle = 0;
    const result = [];
    for (let idx = 0; idx < data.length; idx++) {
      const d = data[idx];
      const percentage = d.amount / total;
      const strokeDashoffset = circumference - percentage * circumference;
      const rotationAngle = (currentAngle * 360) - 90; // Empezar arriba (-90deg)
      currentAngle += percentage;
      result.push({ 
        ...d, 
        strokeDashoffset, 
        rotationAngle, 
        color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] 
      });
    }
    return result;
  }, [data, total, circumference]);

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="glass-card rounded-xl p-5 border border-border flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-[160px] h-[160px] flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
          {/* Segmentos de Dona */}
          {segments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeDashoffset}
                transform={`rotate(${seg.rotationAngle} ${size / 2} ${size / 2})`}
                strokeLinecap="round"
                className="cursor-pointer transition-[stroke-width] duration-200 ease-out"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Texto central de la dona */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {activeSegment ? (
            <>
              <span className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[120px]">{activeSegment.category.split(' ')[0]}</span>
              <span className="text-base font-bold text-foreground mt-0.5">{activeSegment.percentage}%</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(activeSegment.amount)}</span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-muted-foreground font-medium uppercase">Gastos Totales</span>
              <span className="text-base font-bold text-foreground mt-0.5">{formatCurrency(total)}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Anual</span>
            </>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex-1 w-full space-y-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Desglose de Gastos</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {segments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${isHovered ? 'bg-muted border border-border' : 'border border-transparent'}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground truncate">{seg.category}</p>
                  <p className="font-semibold text-foreground">{formatCurrency(seg.amount)} <span className="text-[10px] font-normal text-muted-foreground">({seg.percentage}%)</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 4. EMBUDO DE CONVERSIÓN & PIPELINE (Funnel Visual)
// ────────────────────────────────────────────────────────────────
interface ConversionPipelineProps {
  quoteRate: number;     // e.g. 74.2
  contractRate: number;  // e.g. 94.6
  avgSignTime: number;   // e.g. 18.4
}

export function ConversionPipeline({ quoteRate, contractRate, avgSignTime }: ConversionPipelineProps) {
  return (
    <div className="glass-card rounded-xl p-5 border border-border space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Eficiencia del Pipeline de Ventas</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Tasas de conversión y tiempos de respuesta</p>
      </div>

      <div className="relative space-y-3 pt-2">
        {/* Paso 1: Cotizaciones */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs mb-1 px-1">
            <span className="text-muted-foreground font-medium">1. Cotizaciones Enviadas</span>
            <span className="font-bold text-foreground">100%</span>
          </div>
          <div className="h-5 w-full bg-muted rounded overflow-hidden relative border border-border/50">
            <div className="h-full bg-gradient-to-r from-blue-600/30 to-blue-500/50 w-full" />
          </div>
        </div>

        {/* Flecha/Indicador 1 */}
        <div className="flex justify-center -my-1">
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Aceptación: {quoteRate}%
          </span>
        </div>

        {/* Paso 2: Aceptadas / Contrato */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs mb-1 px-1">
            <span className="text-muted-foreground font-medium">2. Cotizaciones Aceptadas / Contratos Enviados</span>
            <span className="font-bold text-blue-400">{quoteRate}%</span>
          </div>
          <div className="h-5 w-full bg-muted rounded overflow-hidden relative border border-border/50">
            <div className="h-full bg-gradient-to-r from-teal-600/30 to-teal-500/50" style={{ width: `${quoteRate}%` }} />
          </div>
        </div>

        {/* Flecha/Indicador 2 */}
        <div className="flex justify-center -my-1">
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Firma: {contractRate}%
          </span>
        </div>

        {/* Paso 3: Firmadas */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs mb-1 px-1">
            <span className="text-muted-foreground font-medium">3. Contratos Firmados</span>
            <span className="font-bold text-teal-400">{Math.round((quoteRate * contractRate) / 100)}%</span>
          </div>
          <div className="h-5 w-full bg-muted rounded overflow-hidden relative border border-border/50">
            <div className="h-full bg-gradient-to-r from-emerald-600/30 to-emerald-500/50" style={{ width: `${(quoteRate * contractRate) / 100}%` }} />
          </div>
        </div>
      </div>

      {/* SLA de respuesta */}
      <div className="border-t border-border/50 pt-4 mt-2 flex items-center justify-between gap-4 text-center">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground uppercase leading-none mb-1.5">SLA Promedio de Firma</p>
          <p className="text-xl font-bold text-emerald-400 tracking-tight">{avgSignTime} horas</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground uppercase leading-none mb-1.5">Conversión Total Pipeline</p>
          <p className="text-xl font-bold text-blue-400 tracking-tight">{Math.round((quoteRate * contractRate) / 100)}%</p>
        </div>
      </div>
    </div>
  );
}
