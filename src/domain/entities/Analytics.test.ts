// Analytics.test.ts
// Pruebas unitarias para validar las fórmulas analíticas del servicio de métricas.
// Ejecutado mediante Vitest.

import { describe, it, expect } from 'vitest';
import { MockAnalyticsService } from '../../infrastructure/services/MockAnalyticsService';

describe('Analytics Calculations', () => {
  it('should calculate monthly profits and margins correctly', () => {
    const financials = MockAnalyticsService.getMonthlyFinancials();
    
    expect(financials.length).toBe(12);

    financials.forEach(month => {
      // 1. La utilidad neta debe ser la resta exacta de ingresos menos egresos
      const expectedProfit = month.revenue - month.expenses;
      expect(month.profit).toBe(expectedProfit);

      // 2. El margen debe coincidir con el porcentaje redondeado de la relación utilidad/ingresos
      if (month.revenue > 0) {
        const expectedMargin = Math.round((month.profit / month.revenue) * 100);
        expect(month.margin).toBe(expectedMargin);
      } else {
        expect(month.margin).toBe(0);
      }
      
      // 3. El presupuesto del cliente debe ser un valor no negativo
      expect(month.budgets).toBeGreaterThanOrEqual(0);
    });
  });

  it('should calculate operational metrics and efficiency ratios correctly', () => {
    const operations = MockAnalyticsService.getMonthlyOperations();
    
    expect(operations.length).toBe(12);

    operations.forEach(month => {
      // Días de entrega deben ser valores razonables y no negativos
      expect(month.averageDeliveryDays).toBeGreaterThan(0);
      expect(month.averageDeliveryDays).toBeLessThan(60); // Menos de 2 meses de retraso

      // Horas no pueden ser negativas
      expect(month.shootingHours).toBeGreaterThanOrEqual(0);
      expect(month.editingHours).toBeGreaterThanOrEqual(0);
      expect(month.sessionCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('should compile an accurate consolidate summary', () => {
    const summary = MockAnalyticsService.getSummary();
    const financials = MockAnalyticsService.getMonthlyFinancials();
    const operations = MockAnalyticsService.getMonthlyOperations();

    const sumRevenue = financials.reduce((s, i) => s + i.revenue, 0);
    const sumExpenses = financials.reduce((s, i) => s + i.expenses, 0);
    const sumProfit = sumRevenue - sumExpenses;

    // 1. Utilidades netas y totales consolidadas
    expect(summary.totalRevenue).toBe(sumRevenue);
    expect(summary.totalExpenses).toBe(sumExpenses);
    expect(summary.netProfit).toBe(sumProfit);

    // 2. Comprobación del ratio de eficiencia de edición (debe ser un flotante con 1 decimal)
    const sumShooting = operations.reduce((s, i) => s + i.shootingHours, 0);
    const sumEditing = operations.reduce((s, i) => s + i.editingHours, 0);
    const expectedRatio = parseFloat((sumEditing / sumShooting).toFixed(1));
    expect(summary.efficiencyRatio).toBe(expectedRatio);

    // 3. Comprobación de horas de trabajo totales
    expect(summary.totalHoursWorked).toBe(sumShooting + sumEditing);
  });
});
