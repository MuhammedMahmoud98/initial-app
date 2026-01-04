import { LocationBase, TableColumn } from '../../../shared';


export interface AssignedLocationType {
    id: number;
    user: {
        id: number;
        email: string;
        employeeId: string;
        name: string;
    };
    location: {
        id: number;
        code: string;
    };
    createdAt: string;
    linkedAt: string;
}

export interface LinkAssignedLocation {
  id: number;
  message: string;
}

export interface locationTypeDetails {
  id: number
  district: string
  districtAr: string
  category: string
  building: string
  floor: string
  zone: string
  locationType: string
  locationTypeAr: string
  locationTypeCode: string
  serial: string
  locationCode: string
  qrStatus: string
  qrStatusAr: string
  inheritedServices: InheritedService[]
}

export interface InheritedService {
  serviceId: number
  locationServiceId: number
  serviceName: string
  serviceNameAr: string
  enabled: boolean
  inherited: boolean
  overridden: boolean
  sourceLocationTypeName: string
  sourceLocationTypeNameAr: string
}



export type AssignedLocationTypesResponse = LocationBase<AssignedLocationType>;
export type AssignedLocationColumnType = TableColumn<AssignedLocationType>;
