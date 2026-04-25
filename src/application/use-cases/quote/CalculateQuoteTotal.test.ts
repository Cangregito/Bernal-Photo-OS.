import { describe, it, expect } from 'vitest';
import { CalculateQuoteTotal } from './CalculateQuoteTotal';
import { QuoteItem } from '../../../domain/entities/Quote';

describe('CalculateQuoteTotal', () => {
  const useCase = new CalculateQuoteTotal();

  it('debe retornar 0 si no hay items', () => {
    expect(useCase.execute([])).toBe(0);
  });

  it('debe calcular correctamente el total de múltiples items', () => {
    const items: QuoteItem[] = [
      { name: 'A', price: 100, quantity: 2 }, // 200
      { name: 'B', price: 50, quantity: 3 }   // 150
    ];
    expect(useCase.execute(items)).toBe(350);
  });

  it('debe manejar precios negativos sanitizándolos a 0', () => {
    const items: QuoteItem[] = [
      { name: 'Error', price: -100, quantity: 1 },
      { name: 'Normal', price: 100, quantity: 1 }
    ];
    expect(useCase.execute(items)).toBe(100);
  });

  it('debe forzar al menos cantidad 1 si viene en 0 o negativo', () => {
    const items: QuoteItem[] = [
      { name: 'Zero', price: 50, quantity: 0 },   // Sanitizado a 1 -> 50
      { name: 'Neg', price: 50, quantity: -5 }    // Sanitizado a 1 -> 50
    ];
    expect(useCase.execute(items)).toBe(100);
  });
});
