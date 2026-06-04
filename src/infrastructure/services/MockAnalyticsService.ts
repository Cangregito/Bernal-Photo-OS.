// MockAnalyticsService.ts
// Servicio para generar datos analíticos de grado profesional (históricos de 12 meses, gastos, tiempos y conversión)

export interface MonthlyFinancials {
  monthName: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  budgets: number; // Suma de presupuestos estimados de clientes
}

export interface OperationsTime {
  monthName: string;
  shootingHours: number;
  editingHours: number;
  averageDeliveryDays: number;
  sessionCount: number;
}

export interface ExpenseCategoryDetail {
  category: string;
  amount: number;
  percentage: number;
}

export interface AnalyticsSummary {
  // KPIs de Dinero & Presupuestos
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageMargin: number;
  averageTicket: number;
  budgetComplianceRate: number; // Porcentaje de cotizaciones que coinciden con el presupuesto del cliente
  
  // KPIs de Tiempos
  totalHoursWorked: number;
  averageDeliveryDays: number;
  efficiencyRatio: number; // horas de edición por cada hora de shooting (menor es más eficiente)
  
  // KPIs de Conversión (Pipeline)
  quoteAcceptanceRate: number;
  contractSignatureRate: number;
  averageContractSignTimeHours: number;
}

const MONTHS = ['Jun 2025', 'Jul 2025', 'Ago 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dic 2025', 'Ene 2026', 'Feb 2026', 'Mar 2026', 'Abr 2026', 'May 2026'];

export class MockAnalyticsService {
  /**
   * Genera los datos financieros históricos agregados mes a mes de los últimos 12 meses
   */
  public static getMonthlyFinancials(): MonthlyFinancials[] {
    // Generar con estacionalidad: picos de ingresos en primavera (Abr-May) y fin de año (Oct-Nov-Dic)
    const baseRevenue = [35000, 28000, 24000, 32000, 58000, 64000, 75000, 29000, 31000, 42000, 68000, 82000];
    const fixedExpenses = 8500; // Adobe CC, Supabase, Vercel, CRM, renta de estudio prorrateada
    
    return MONTHS.map((month, idx) => {
      const revenue = baseRevenue[idx];
      // Gastos variables: asistentes de segunda cámara, transporte, marketing digital (12-22% de ingresos)
      const variableExpenses = Math.round(revenue * (0.12 + (idx % 3) * 0.04));
      const expenses = fixedExpenses + variableExpenses;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
      
      // Presupuesto total que los clientes tenían en mente (comparación)
      // Usualmente los fotógrafos logran vender un 5-15% más del presupuesto inicial gracias a upselling
      const budgets = Math.round(revenue * (0.90 + (idx % 2) * 0.05));

      return {
        monthName: month,
        revenue,
        expenses,
        profit,
        margin,
        budgets
      };
    });
  }

  /**
   * Genera datos de distribución de gastos por categorías
   */
  public static getExpenseCategories(): ExpenseCategoryDetail[] {
    const categories = [
      { name: 'Equipo (Cámaras/Lentes/Luces)', amount: 45000 },
      { name: 'Software (Adobe/Supabase/Vercel/CRM)', amount: 15400 },
      { name: 'Transporte y Viáticos', amount: 22000 },
      { name: 'Marketing y Anuncios (Meta/Google)', amount: 18000 },
      { name: 'Asistentes & Segundas Cámaras', amount: 32000 },
      { name: 'Operaciones (Estudio/Luz/Internet)', amount: 12000 }
    ];

    const total = categories.reduce((sum, item) => sum + item.amount, 0);

    return categories.map(cat => ({
      category: cat.name,
      amount: cat.amount,
      percentage: Math.round((cat.amount / total) * 100)
    }));
  }

  /**
   * Genera el desglose del uso del tiempo (Shooting vs Edición) y tiempos de entrega
   */
  public static getMonthlyOperations(): OperationsTime[] {
    // Sesiones por mes (con estacionalidad)
    const sessionCounts = [6, 4, 3, 5, 10, 12, 14, 5, 5, 8, 12, 15];
    
    return MONTHS.map((month, idx) => {
      const sessionCount = sessionCounts[idx];
      // Promedio de 4.5 horas de shooting por sesión (bodas largas, retratos cortos)
      const shootingHours = Math.round(sessionCount * 4.5);
      // Promedio de 2.2 horas de edición por cada hora de shooting
      const editingHours = Math.round(shootingHours * 2.2);
      
      // En meses ocupados (Dic, May), el promedio de entrega sube debido al volumen de trabajo (cuello de botella)
      let averageDeliveryDays = 8; // base
      if (sessionCount > 10) averageDeliveryDays = 14;
      if (sessionCount > 13) averageDeliveryDays = 19;
      // Añadir pequeña aleatoriedad
      averageDeliveryDays += (idx % 3) - 1;

      return {
        monthName: month,
        shootingHours,
        editingHours,
        averageDeliveryDays,
        sessionCount
      };
    });
  }

  /**
   * Retorna un resumen consolidado de todos los KPIs del negocio
   */
  public static getSummary(): AnalyticsSummary {
    const monthlyFinancials = this.getMonthlyFinancials();
    const monthlyOperations = this.getMonthlyOperations();

    const totalRevenue = monthlyFinancials.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = monthlyFinancials.reduce((sum, item) => sum + item.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const averageMargin = Math.round(monthlyFinancials.reduce((sum, item) => sum + item.margin, 0) / monthlyFinancials.length);
    
    const totalSessions = monthlyOperations.reduce((sum, item) => sum + item.sessionCount, 0);
    const averageTicket = totalSessions > 0 ? Math.round(totalRevenue / totalSessions) : 0;
    
    // Cumplimiento de Presupuesto (tasas de desvío aceptables)
    const budgetComplianceRate = 88.5; 

    // Horas totales
    const totalShooting = monthlyOperations.reduce((sum, item) => sum + item.shootingHours, 0);
    const totalEditing = monthlyOperations.reduce((sum, item) => sum + item.editingHours, 0);
    const totalHoursWorked = totalShooting + totalEditing;
    const efficiencyRatio = parseFloat((totalEditing / totalShooting).toFixed(1)); // Ej: 2.2 horas de edición por shooting
    
    const averageDeliveryDays = parseFloat((monthlyOperations.reduce((sum, item) => sum + item.averageDeliveryDays, 0) / monthlyOperations.length).toFixed(1));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      averageMargin,
      averageTicket,
      budgetComplianceRate,
      totalHoursWorked,
      averageDeliveryDays,
      efficiencyRatio,
      quoteAcceptanceRate: 74.2, // 74.2% de cotizaciones son aceptadas
      contractSignatureRate: 94.6, // 94.6% de contratos enviados terminan firmados
      averageContractSignTimeHours: 18.4 // Contratos se firman en promedio en 18.4 horas
    };
  }
}
