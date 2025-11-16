import {LocationBase, ModeType, TableColumn} from '../../../shared';

export interface LocationType {
  id:       number;
  name:     string;
  code:     string;
  size:     string;
  category: string;
  services: LocationService[];
}

export interface LocationService {
  id?:          number;
  serviceType:  string;
  internalLink: string;
  externalLink: string;
  available:    boolean;
}

export interface LocationServicePayload {
  id: number;
  serviceId: number;
}

export interface LocationServiceResponse {
  message: string;
}

export interface LocationServiceBody {
  available: boolean;
}

export interface ToggleServiceEvent {
  isAvailable: boolean | null;
  serviceId: number | undefined;
}

export interface LocationServiceEvent extends ToggleServiceEvent{
  id: number | null;
}

export type LocationColumnType = TableColumn<LocationType>;

export type LocationTypeResponse = LocationBase<LocationType>;

export interface LocationTypeDialogData {
  mode: ModeType;
  locationTypeData?: LocationType;
}
