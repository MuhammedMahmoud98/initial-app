import { FormControl } from '@angular/forms';


export type FormControlsOf<T> = {
  [K in keyof T]: FormControl<T[K] | null>;
};


export interface HubFilters {
  filter?: string;
  search?: string;
}


export type FilterForm = FormControlsOf<HubFilters>;
