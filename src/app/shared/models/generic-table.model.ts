import {TemplateRef} from '@angular/core';

export interface TableColumn<T> {
  field: keyof T | '';
  template?: TemplateRef<unknown>;
  columnWidth?: `${number}px`;
}
