import {TemplateRef} from '@angular/core';

export interface TableColumn<T> {
  field: keyof T | '' | 'status' | 'type' | 'serial' | 'availability';
  alias?: string;
  template?: TemplateRef<unknown>;
  columnWidth?: `${number}${'px' | '%'}`;
}
