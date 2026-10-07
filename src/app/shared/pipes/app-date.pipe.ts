import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'appDate',
  standalone: true
})
export class AppDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: any, format: string = 'MM/dd/yyyy'): string {
    if (value === null || value === undefined || value === '') return '—';
    try {
      let dateValue = value;
      // Handle 10-digit epoch timestamp (seconds -> milliseconds)
      if (typeof value === 'number' && value < 10000000000) {
        dateValue = value * 1000;
      } else if (typeof value === 'string' && /^\d{10}$/.test(value.trim())) {
        dateValue = parseInt(value.trim(), 10) * 1000;
      }

      const formatted = this.datePipe.transform(dateValue, format);
      return formatted || String(value);
    } catch (e) {
      return String(value);
    }
  }
}
