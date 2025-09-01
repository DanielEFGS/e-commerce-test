import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clpCurrency',
  standalone: true
})
export class ClpCurrencyPipe implements PipeTransform {

  /**
   * Transforms a number into Chilean currency format.
   * 
   * @param value - The numeric value to format
   * @param showSymbol - Whether to show the $ symbol (default: true)
   * @returns String formatted as Chilean currency
   */
  transform(value: number | null | undefined, showSymbol: boolean = true): string {
    if (value === null || value === undefined || isNaN(value)) {
      return showSymbol ? '$0' : '0';
    }

    // Format with dots as thousands separators
    const formatted = value.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return showSymbol ? `$${formatted}` : formatted;
  }
}
