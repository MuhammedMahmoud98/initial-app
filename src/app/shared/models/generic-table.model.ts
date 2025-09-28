import {TemplateRef} from '@angular/core';

export interface TableColumn<T> {
  field: keyof T | '' | 'status' | 'type' | 'serial' | 'availability';
  template?: TemplateRef<unknown>;
  columnWidth?: `${number}px`;
}
