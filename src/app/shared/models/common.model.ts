import {FormControl} from '@angular/forms';
import {MODE} from '../enums/shared.enum';

export interface CoreAppRoutes {
  path: string;
  title: string;
}

export interface LocationBase<T> {
  content:                 T[];
  totalAvailableLocations?: number;
  totalQRGenerated?:        number;
  page:                    number;
  size:                    number;
  totalElements:           number;
  totalPages:              number;
}

export interface ItemFilter {
  page: number;
  size: number;
  filter?: string;
  search?: string;
}

export type FormControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export type FormErrorType = 'minlength' | 'maxlength' | 'required' | 'duplicatedTypeCode' | 'invalidServiceLink' | 'whitespace' | 'sqlInjectionDetected' | 'xssDetected';

export type ModeType = typeof MODE[keyof typeof MODE];
