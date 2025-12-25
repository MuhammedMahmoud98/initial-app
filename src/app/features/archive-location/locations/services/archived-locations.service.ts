import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONSTANTS, ItemFilter } from '../../../../shared';
import { CreatedArchivedLocationResponse } from '../models/locations.model';


@Injectable({
  providedIn: 'root'
})
export class ArchivedLocationTypeService {
  readonly #httpClient = inject(HttpClient);


  getLocationTypeArchived(payload: ItemFilter): Observable<CreatedArchivedLocationResponse> {
    const params = new HttpParams({ fromObject: payload as never });
    return this.#httpClient.get<CreatedArchivedLocationResponse>(API_CONSTANTS.ARCHIVED_LOCATIONS_TYPE, { params });
  }
}
