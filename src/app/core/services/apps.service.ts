import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONSTANTS } from '../../shared';
import { map, Observable} from 'rxjs';
import { NavItem, NavItemResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppsService {
  constructor(private http: HttpClient) {}

  getNavigationItems(email: string):Observable<NavItem[]> {
    let parameters = new HttpParams();
    parameters = parameters.append('navType', 'hub');
    return this.http
      .get<NavItemResponse>(API_CONSTANTS.NAVIGATION_ITEMS.replace('{email}', email), {
        params: parameters,
      }).pipe(
      map((response) => response.items),
    );
  }
}
