import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {API_CONSTANTS, ItemFilter} from '../../../shared';
import {Observable} from 'rxjs';
import {
  CreatedLocationResponse,
  GenerateQrPayload,
  GenerateQrResponse,
  PrintQrCodeResponse, ValidateQrResponse
} from '../models/created-location.model';
import {LocationTypesResponse} from '../models/location-types.model';
import {
  LocationServiceBody,
  LocationServicePayload,
  LocationServiceResponse
} from '../../location-types/models/location-types.model';
import {
  AssignedLocationTypesResponse,
  LinkAssignedLocation
} from '../../assigned-locations/models/assigned-location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  #httpClient: HttpClient = inject(HttpClient);

  getCreatedLocations(payload: ItemFilter): Observable<CreatedLocationResponse> {
    const params = new HttpParams({fromObject: payload as never});
    return this.#httpClient.get<CreatedLocationResponse>(API_CONSTANTS.CREATED_LOCATIONS, {params});
  }

  getLocationTypes(payload: ItemFilter): Observable<LocationTypesResponse> {
    const params = new HttpParams({fromObject: payload as never});
    return this.#httpClient.get<LocationTypesResponse>(API_CONSTANTS.LOCATION_TYPES, {params});
  }

  getAssignedLocation(payload: ItemFilter): Observable<AssignedLocationTypesResponse>  {
    const params = new HttpParams({ fromObject: payload as never });
    return this.#httpClient.get<AssignedLocationTypesResponse>(API_CONSTANTS.ASSIGNED_LOCATIONS, { params });
  }

  updateAssignedLocationsLinks(payload: LocationServicePayload): Observable<LocationServiceResponse>{
    const url: string = API_CONSTANTS.LOCATION_TYPE_SERVICES.replace('{id}', payload.id.toString()).replace('{id}', payload.id.toString());

    return this.#httpClient.patch<LocationServiceResponse>(url,{});
  }

  updateLocationService(payload: LocationServicePayload, body: LocationServiceBody): Observable<LocationServiceResponse> {
    const url: string = API_CONSTANTS.LOCATION_TYPE_SERVICES.replace('{id}', payload.id.toString()).replace('{serviceId}', payload.serviceId.toString());

    return this.#httpClient.post<LocationServiceResponse>(url, body);
  }

  generateQRCode(payload: GenerateQrPayload): Observable<GenerateQrResponse> {
    let customPayload!: Partial<GenerateQrPayload>;
    if (payload.all) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {selectedLocationIds, ...rest} = payload;
      customPayload = rest;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {excludedLocationIds, ...rest} = payload;
      customPayload = rest;
    }

    console.log(payload.all ? customPayload : payload, 'QR PAYLOAD');
    return this.#httpClient.post<GenerateQrResponse>(API_CONSTANTS.GENERATE_QR, customPayload);
  }

  deleteQRCode(payload: GenerateQrPayload): Observable<GenerateQrResponse> {
    let customPayload!: Partial<GenerateQrPayload>;
    if (payload.all) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {selectedLocationIds, ...rest} = payload;
      customPayload = rest;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {excludedLocationIds, ...rest} = payload;
      customPayload = rest;
    }

    return this.#httpClient.post<GenerateQrResponse>(API_CONSTANTS.DELETE_LOCATIONS, customPayload);
  }

  printQRCode(payload: GenerateQrPayload, pagination: ItemFilter): Observable<PrintQrCodeResponse> {
    const params = new HttpParams({fromObject: pagination as never});

    let customPayload!: Partial<GenerateQrPayload>;
    if (payload.all) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {selectedLocationIds, ...rest} = payload;
      customPayload = rest;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {excludedLocationIds, ...rest} = payload;
      customPayload = rest;
    }

    return this.#httpClient.post<PrintQrCodeResponse>(API_CONSTANTS.PRINT_QR, customPayload, {params});
  }

  validateQRPrint(payload: GenerateQrPayload): Observable<ValidateQrResponse> {
    return this.#httpClient.post<ValidateQrResponse>(API_CONSTANTS.VALIDATE_QR_PRINT, payload);
  }

  unLinkAssignedLocation(assignedLocationId: number): Observable<LinkAssignedLocation> {
    const url: string = API_CONSTANTS.ASSIGNED_LOCATIONS_UNLINK.replace('{id}', assignedLocationId.toString());
    return this.#httpClient.patch<LinkAssignedLocation>(url,{});
  }
}
