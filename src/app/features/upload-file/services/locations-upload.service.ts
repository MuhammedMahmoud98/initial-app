import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_CONSTANTS, ItemFilter} from '../../../shared';
import {catchError, Observable, throwError} from 'rxjs';
import { CreatedLocationResponse } from '../../created-locations/models/created-location.model';



@Injectable({
  providedIn: 'root'
})
export class LocationsUploadService {
  #httpClient: HttpClient = inject(HttpClient);


  downloadTemplate(): Observable<Blob> {
    return this.#httpClient.get(API_CONSTANTS.DOWNLOAD_TEMPLATE, {
      responseType: 'blob'
    });
  }


  uploadLocations(file: File): Observable<any> {
    const location_data = new FormData();
    location_data.append('location_data', file);
    return this.#httpClient.post(API_CONSTANTS.UPLOAD_TEMPLATE, location_data)
  }

  getCreatedLocationsByFileID(payload: ItemFilter, fileID: string): Observable<CreatedLocationResponse> {
    const params = { ...payload, uploadId: fileID };
    const url: string = API_CONSTANTS.CREATE_LOCATION_BY_FILEID.replace('{uploadId}', fileID.toString());

    return this.#httpClient.get<CreatedLocationResponse>(url, { params })
  }

  discardUpload(fileID: string): Observable<any> {
    const url: string = API_CONSTANTS.DISCARD_LOCATION_BY_FILEID.replace('{uploadId}', fileID.toString());
    return this.#httpClient.put(url,{})
  }
   
  saveUpload(fileID: string): Observable<any> {
    const url: string = API_CONSTANTS.SAVE_LOCATION_BY_FILEID.replace('{uploadId}', fileID.toString()) + '/confirm';
    return this.#httpClient.put(url, {})
  }

}