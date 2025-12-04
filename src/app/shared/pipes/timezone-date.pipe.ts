import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timezoneDate',
  standalone: true,
})
export class TimezoneDatePipe implements PipeTransform {
  private datePipe: DatePipe;

  constructor(@Inject(LOCALE_ID) private locale: string) {
    this.datePipe = new DatePipe(this.locale);
  }

  /**
   * Normalize incoming value so it's interpreted as UTC when it's a naive timestamp/string.
   * - If value is a string and contains no timezone info, append 'Z' to force UTC parsing.
   * - If value is Date or number, leave as-is (these represent an absolute moment in time).
   */
  private normalizeToUtc(value: Date | string | number): Date | string | number | null {
    if (value === null || value === undefined) return null;

    if (typeof value === 'string') {
      let str = value.trim();
      if (!str) return null;

      // If the string already contains timezone info (Z or +HH or +HH:MM), keep it
      const hasIsoTimezone = /([+-]\d{2}:?\d{2}|Z)$/i.test(str);
      if (hasIsoTimezone) return str;

      // Replace space with 'T' if present to form an ISO-like string, then append 'Z' to force UTC
      if (str.indexOf(' ') !== -1 && str.indexOf('T') === -1) {
        str = str.replace(' ', 'T');
      }

      // Append 'Z' so Date parsing treats it as UTC
      return str + 'Z';
    }

    // number (epoch ms) and Date are already absolute moments in time
    if (typeof value === 'number') return value;
    if (value instanceof Date) return new Date(value.getTime());

    return null;
  }

  transform(
    value: Date | string | number,
    format: string = 'dd MMM yyyy hh:mm a',
    timezone?: string
  ): string | null {
    const normalized = this.normalizeToUtc(value);

    // If timezone is explicitly 'local' or not provided, let DatePipe use the runtime/local timezone
    const tz = timezone === 'local' || !timezone ? undefined : timezone;

    return this.datePipe.transform(normalized as any, format, tz);
  }
}
