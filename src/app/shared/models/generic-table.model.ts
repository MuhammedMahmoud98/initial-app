import {TemplateRef} from '@angular/core';

export interface TableColumn<T> {
  field: keyof T | '' | 'status' | 'type' | 'serial';
  template?: TemplateRef<unknown>;
  columnWidth?: `${number}px`;
}
