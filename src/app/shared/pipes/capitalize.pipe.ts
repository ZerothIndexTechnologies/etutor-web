import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (!str) return '';

    return str
      .toLowerCase()
      .split(' ')
      .map(word => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');
  }
}
