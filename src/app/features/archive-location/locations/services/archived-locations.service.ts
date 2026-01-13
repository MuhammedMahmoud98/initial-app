import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONSTANTS, ItemFilter } from '../../../../shared';
import { CreatedArchivedLocationResponse } from '../models/locations.model';
import { archiveResponse } from '../../../../shared/models/create-location-type.model';


@Injectable({
  providedIn: 'root'
})
export class ArchivedLocationService {
  readonly #httpClient = inject(HttpClient);


  getLocationsArchived(payload: ItemFilter): Observable<CreatedArchivedLocationResponse> {
    const params = new HttpParams({ fromObject: payload as never });
    return this.#httpClient.get<CreatedArchivedLocationResponse>(API_CONSTANTS.ARCHIVED_LOCATIONS, { params });
  }

  unarchiveLocation(locationIdS: number[]): Observable<archiveResponse> {
    return this.#httpClient.post<archiveResponse>(`${API_CONSTANTS.UNARCHIVED_LOCATIONS_ITEMS}`, locationIdS);
  }

  unarchiveLocationType(locationTypeId: number): Observable<void> {
    return this.#httpClient.post<void>(`${API_CONSTANTS.UNARCHIVED_LOCATION_TYPE.replace('{id}', locationTypeId.toString())}`, {});
  }
}
