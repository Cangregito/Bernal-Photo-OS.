import { QuoteItem } from '../../../domain/entities/Quote';

export class CalculateQuoteTotal {
  /**
   * Garantiza que el total de la cotización es la suma exacta de (precio * cantidad)
   * de cada uno de sus items.
   */
  execute(items: QuoteItem[]): number {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((total, item) => {
      // Validaciones básicas de integridad
      const price = Math.max(0, item.price || 0);
      const quantity = Math.max(1, item.quantity || 1);
      
      return total + (price * quantity);
    }, 0);
  }
}
