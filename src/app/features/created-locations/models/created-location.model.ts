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

export type CustomCreatedLocationColumn = CreatedLocation;

export type CreatedLocationColumnType = TableColumn<CustomCreatedLocationColumn>;

export type CreatedLocationResponse = LocationBase<CreatedLocation>;

export type PDFSize = 'A4' | 'A5' | `${number}*${number}`;


export interface GenerateQrPayload {
  all: boolean;
  filter?: string;
  selectedLocationIds?: number[];
  excludedLocationIds?: number[];
}

export interface GenerateQrResponse {
  message: string;
}

export interface PrintQRCodeDto {
  locationId: number;
  locationCode: string;
  qrCode: string;
  size: PDFSize;
}

export type PrintQrCodeResponse = LocationBase<PrintQRCodeDto>;
