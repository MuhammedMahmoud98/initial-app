import {LocationBase, TableColumn} from '../../../shared';

export interface CreatedLocation {
  id:        number;
  district:  string;
  category:  string;
  building:  string;
  floor:     string;
  zone:      string;
  code:      string;
  qrCode:    string;
  serial:    string;
  typeTitle: string;
  typeCode:  string;
  isSelected?: boolean;
}

export type CustomCreatedLocationColumn = CreatedLocation

export type CreatedLocationColumnType = TableColumn<CustomCreatedLocationColumn>;

export type CreatedLocationResponse = LocationBase<CreatedLocation>;
