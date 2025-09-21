import {LocationBase} from '../../../shared';

export interface LocationType {
  id:       number;
  name:     string;
  code:     string;
  size:     string;
  category: string;
  services: LocationTypeService[];
}

export interface LocationTypeService {
  id:           number;
  serviceType:  string;
  internalLink: string;
  externalLink: string;
  available:    boolean;
}


export type LocationTypesResponse = LocationBase<LocationType>;
