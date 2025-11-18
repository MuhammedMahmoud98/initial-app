import {LOCATION_TYPE_CATEGORIES} from '../../../enums/shared.enum';

export interface LocationTypeCategory {
  label: string;
  value: typeof LOCATION_TYPE_CATEGORIES[keyof typeof LOCATION_TYPE_CATEGORIES];
  isSelected?: boolean;
}
