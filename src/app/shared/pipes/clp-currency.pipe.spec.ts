import { ClpCurrencyPipe } from './clp-currency.pipe';

/**
 * Pruebas unitarias para ClpCurrencyPipe.
 * 
 * Verifica que el pipe formatee correctamente los valores
 * numéricos como moneda chilena con separadores de miles
 * usando puntos.
 */
describe('ClpCurrencyPipe', () => {
  let pipe: ClpCurrencyPipe;

  beforeEach(() => {
    pipe = new ClpCurrencyPipe();
  });

  /**
   * Prueba que el pipe se cree correctamente.
   */
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /**
   * Grupo de pruebas para formato básico.
   */
  describe('Basic formatting', () => {
    /**
     * Prueba formateo de números simples.
     */
    it('should format simple numbers correctly', () => {
      expect(pipe.transform(100)).toBe('$100');
      expect(pipe.transform(1000)).toBe('$1.000');
      expect(pipe.transform(10000)).toBe('$10.000');
    });

    /**
     * Prueba formateo de números grandes.
     */
    it('should format large numbers with dots as thousands separator', () => {
      expect(pipe.transform(849990)).toBe('$849.990');
      expect(pipe.transform(1299990)).toBe('$1.299.990');
      expect(pipe.transform(2499990)).toBe('$2.499.990');
    });

    /**
     * Prueba formateo de números muy grandes.
     */
    it('should handle millions correctly', () => {
      expect(pipe.transform(1000000)).toBe('$1.000.000');
      expect(pipe.transform(15000000)).toBe('$15.000.000');
    });
  });

  /**
   * Grupo de pruebas para valores edge case.
   */
  describe('Edge cases', () => {
    /**
     * Prueba manejo de valor cero.
     */
    it('should handle zero correctly', () => {
      expect(pipe.transform(0)).toBe('$0');
    });

    /**
     * Prueba manejo de valores null y undefined.
     */
    it('should handle null and undefined values', () => {
      expect(pipe.transform(null)).toBe('$0');
      expect(pipe.transform(undefined)).toBe('$0');
    });

    /**
     * Prueba manejo de valores NaN.
     */
    it('should handle NaN values', () => {
      expect(pipe.transform(NaN)).toBe('$0');
    });

    /**
     * Prueba números negativos.
     */
    it('should handle negative numbers', () => {
      expect(pipe.transform(-1000)).toBe('$-1.000');
      expect(pipe.transform(-849990)).toBe('$-849.990');
    });
  });

  /**
   * Grupo de pruebas para opciones del pipe.
   */
  describe('Pipe options', () => {
    /**
     * Prueba formateo sin símbolo de peso.
     */
    it('should format without currency symbol when showSymbol is false', () => {
      expect(pipe.transform(849990, false)).toBe('849.990');
      expect(pipe.transform(1299990, false)).toBe('1.299.990');
      expect(pipe.transform(0, false)).toBe('0');
    });

    /**
     * Prueba formateo con símbolo por defecto.
     */
    it('should show currency symbol by default', () => {
      expect(pipe.transform(849990)).toBe('$849.990');
      expect(pipe.transform(849990, true)).toBe('$849.990');
    });
  });

  /**
   * Grupo de pruebas de integración.
   */
  describe('Integration scenarios', () => {
    /**
     * Prueba valores típicos de productos.
     */
    it('should format typical product prices correctly', () => {
      // iPhone price
      expect(pipe.transform(849990)).toBe('$849.990');
      
      // MacBook price
      expect(pipe.transform(2499990)).toBe('$2.499.990');
      
      // AirPods price
      expect(pipe.transform(249990)).toBe('$249.990');
      
      // Apple Watch price
      expect(pipe.transform(399990)).toBe('$399.990');
    });

    /**
     * Prueba que no muestre decimales para precios enteros.
     */
    it('should not show decimals for whole numbers', () => {
      expect(pipe.transform(1000)).toBe('$1.000');
      expect(pipe.transform(1000.00)).toBe('$1.000');
      expect(pipe.transform(849990.00)).toBe('$849.990');
    });
  });
});
