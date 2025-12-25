import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_CONSTANTS} from '../../../shared';
import {
  LocationTypePayload,
  LocationTypeResponse,
  ServiceLinkPayload, ServiceLinkResponse
} from '../../../shared/models/create-location-type.model';

@Injectable({
  providedIn: 'root'
})
export class LocationTypeActionsService {
  readonly #http = inject(HttpClient);

  createNewLocationType(payload: LocationTypePayload): Observable<LocationTypeResponse> {
    return this.#http.post<LocationTypeResponse>(API_CONSTANTS.CREATE_LOCATION_TYPE, payload);
  }

  updateLocationType(id: number, payload: LocationTypePayload): Observable<unknown> {
    const uri = API_CONSTANTS.UPDATE_LOCATION_TYPE.replace('{id}', id.toString());

    return this.#http.patch(uri, payload);
  }

  deleteLocationType(id: number): Observable<unknown> {
    const uri = API_CONSTANTS.DELETE_LOCATION_TYPE.replace('{id}', id.toString());

    return this.#http.delete(uri);
  }

  archiveLocationType(id: number): Observable<unknown> {
    const uri = API_CONSTANTS.DELETE_LOCATION_TYPE.replace('{id}', id.toString());

    return this.#http.post(uri,{});
  }

  validateServiceLink(linkPayload: ServiceLinkPayload): Observable<ServiceLinkResponse> {
    return this.#http.post<ServiceLinkResponse>(API_CONSTANTS.LINK_VALIDATE_QR, linkPayload);
  }
}
