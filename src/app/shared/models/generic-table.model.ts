import {TemplateRef} from '@angular/core';

export interface TableColumn<T> {
  field: keyof T | '' | 'status';
  template?: TemplateRef<unknown>;
  columnWidth?: `${number}px`;
}
