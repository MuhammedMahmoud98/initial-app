import { LocationBase, TableColumn } from '../../../../shared';

export interface archiveLocation {
  id: number;
  district: string;
  category: string;
  building: string;
  floor: string;
  zone: string;
  code: string;
  qrCode: string;
  serial: string;
  typeTitle: string;
  typeCode: string;
  isSelected?: boolean;
  'has-linked-locations'?: boolean;

}

export type CustomArchivedLocationColumn = archiveLocation;
export type CreatedArchivedLocationColumnType = TableColumn<CustomArchivedLocationColumn>;

export type CreatedArchivedLocationResponse = LocationBase<archiveLocation>;


export interface LocationServiceResponse {
  message: string;
}

export interface LocationServiceBody {
  available: boolean;
}


export interface BackendErrorSource {
  pointer: string;
  code: string;
  message: string;
}

export interface BackendErrorItem {
  source: BackendErrorSource;
  code: string;
  message: string;
}

export interface BackendErrorResponse {
  message: BackendErrorItem[];
}

