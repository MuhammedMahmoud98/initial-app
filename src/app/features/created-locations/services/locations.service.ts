import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {API_CONSTANTS, ItemFilter} from '../../../shared';
import {Observable} from 'rxjs';
import {CreatedLocationResponse} from '../models/created-location.model';
import {LocationTypesResponse} from '../models/location-types.model';

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
}
