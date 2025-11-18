import {
  PrintingSizeTypes
} from '../components/printing-size-dimensions/models/printing-size-dimensions.model';
import {FormControlsOf} from './common.model';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {LOCATION_TYPE_CATEGORIES} from '../enums/shared.enum';

// TYPES
export type CategoryTypes = typeof LOCATION_TYPE_CATEGORIES[keyof typeof LOCATION_TYPE_CATEGORIES];
export type ServiceType = 'Feedback';
export type ServiceResponse = ServiceDto & 'id';

export interface ServiceDto {
  serviceType: ServiceType;
  internalLink: string;
  externalLink: string;
  available: boolean;
}

export interface LocationTypePayload {
  name: string;
  code: string;
  'has-linked-locations': boolean;
  size: PrintingSizeTypes;
  category: CategoryTypes;
  services: ServiceDto[];
}


export interface LocationTypeResponse extends LocationTypePayload {
  id: string;
  services: ServiceResponse[];
}

export type LocationTypeKeys = keyof LocationTypePayload;
export type ServicesTypeKeys = keyof ServiceDto;

export interface LocationTypeForm {
  name: FormControl<string>;
  code: FormControl<string>;
  size: FormControl<PrintingSizeTypes>;
  category: FormControl<CategoryTypes>;
  services: FormArray<FormGroup<FormControlsOf<ServiceDto>>>;
}

export interface ServiceLink {
  internalLink: LinkInfo;
  externalLink: LinkInfo;
}

export interface LinkInfo {
  valid: boolean;
  message: string;
}


export type ServiceLinkKeys = keyof ServiceLink;
export type ServiceLinkPayload = Partial<Record<ServiceLinkKeys, string>>;

export interface ServiceLinkResponse {
  data: ServiceLink;
}
