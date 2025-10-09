import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, switchMap, of, throwError } from 'rxjs';
import { User } from '../models';
import { CookieService } from 'ngx-cookie-service';
import { API_CONSTANTS } from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly cookiesService: CookieService = inject(CookieService);

  currentUser = signal<User | null>(null);
  isUserLoading = signal(false);

  constructor(private http: HttpClient) {}

  getUserById(userId: number) {
    const newUrl = API_CONSTANTS.USER_SERVICE.replace(
      '{id}',
      userId.toString(),
    );
    const params = new HttpParams().append('whitelist', 'qr-code');
    const headers = new HttpHeaders({
      'third-party-token': this.getMygateGateAuthToken() || '',
    });

    this.isUserLoading.set(true);
    return this.http.get<{ data: User }>(newUrl, { headers, params }).pipe(
      switchMap((response) => {
        this.currentUser.set(response.data);
        this.isUserLoading.set(false);
        return of(response.data);
      }),
      catchError((error) => {
        this.currentUser.set(null);
        this.isUserLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  getAnyUserById(url: string, userId: number) {
    const newUrl = url.replace('{id}', userId.toString());
    return this.http.get<User>(newUrl);
  }

  getSwitcherItems(url: string, email: string) {
    const parameters = new HttpParams()
      .append('navType', 'appSwitcher-new')
      .append('agent', 'web');
    return this.http.get(url.replace('{email}', email), { params: parameters });
  }

  getUserIbnoxItems(url: string, email: string) {
    return this.http.get(url.replace('{email}', email), {});
  }

  searchUsersByEmailOrName(url: string, searchQuery: string) {
    const parameters = new HttpParams()
      .append('_q', searchQuery)
      .append('include', 'isFavorite');
    return this.http.get(url, { params: parameters });
  }

  getUserSuggestedFollowees(url: string, userId: number) {
    const parameters = new HttpParams().append('include', 'followers');
    return this.http.get(url + '/' + userId + '/suggested-followees', {
      params: parameters,
    });
  }

  followUser(url: string, userId: number, followeeId: number) {
    const requestBody = {
      'followed-user-id': followeeId,
    };

    return this.http.post(url + '/' + userId + '/followees', requestBody);
  }

  getFavoriteUsers(url: string, userId: number) {
    const newUrl = url + '/' + userId + '/favorite-users';
    return this.http.get<User[]>(newUrl);
  }

  addFavoriteUser(url: string, userId: number, favoriteUserId: number) {
    const requestBody = {
      'favorite-user-id': favoriteUserId,
    };

    return this.http.post(url + '/' + userId + '/favorite-users', requestBody);
  }

  delFavoriteUser(url: string, userId: number, favoriteUserId: number) {
    const newUrl = url + '/' + userId + '/favorite-users/' + favoriteUserId;
    return this.http.delete(newUrl);
  }

  getUserId(): string {
    return this.cookiesService.get('userId');
  }

  getMygateGateAuthToken() {
    return localStorage.getItem('myGateToken')
      ? localStorage.getItem('myGateToken')
      : this.cookiesService.get('myGateToken');
  }
}
