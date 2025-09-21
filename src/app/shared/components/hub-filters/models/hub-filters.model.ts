import {FormControlsOf} from '../../../types/common-types.model';

export interface HubFilters {
  filter: string;
}


export type FilterForm = FormControlsOf<HubFilters>;
