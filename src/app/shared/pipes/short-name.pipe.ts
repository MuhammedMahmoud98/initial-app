import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortName',
  standalone: true,
})
export class ShortNamePipe implements PipeTransform {
  transform(value: string): `${string} ${string}` | null {
    if (value) {
      const nameParts: string[] = value.split(' ');
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}` as `${string} ${string}`;
    }

    return null;
  }
}
