import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_CONSTANTS, ItemFilter} from '../../../../shared';
import { LocationTypesResponse } from '../../../created-locations/models/location-types.model';

@Injectable({
  providedIn: 'root'
})
export class LocationTypeArchivedService {
  readonly #http = inject(HttpClient);



 getLocationTypes(payload: ItemFilter): Observable<LocationTypesResponse> {
    const params = new HttpParams({fromObject: payload as never});
    return this.#http.get<LocationTypesResponse>(API_CONSTANTS.ARCHIVED_LOCATIONS_TYPE, {params});
  }
}
