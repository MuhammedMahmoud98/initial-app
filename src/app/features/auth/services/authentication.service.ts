import {inject, Injectable, signal} from '@angular/core';
import {
  AuthCredentials,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ValidatePayload,
  ValidateResponse
} from '../models/auth.model';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_CONSTANTS} from '../../../shared';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // ***** INJECTIONS ***** //
  private readonly cookiesService: CookieService = inject(CookieService);
  private readonly http: HttpClient = inject(HttpClient);

  unAuthorizedChecked = signal(false);
  skipThriftGuard = signal(false);


  // ***** HELPERS METHODS ***** //
  getAccessToken(): string {
    return this.cookiesService.get('token');
  }

  getRefreshToken(): string {
    return this.cookiesService.get('refreshToken');
  }

  getIgateRefreshToken(): string {
    return this.cookiesService.get('igateRefreshToken');
  }

  hasToken(): boolean {
    return !!this.cookiesService.get('token');
  }

  isRefreshTokenExist(): boolean {
    return !!this.getRefreshToken();
  }

  setCookies(loginCredentials: AuthCredentials): void {
    this.cookiesService.set('username', loginCredentials?.email ?? '', undefined, '/');
    this.cookiesService.set('token', loginCredentials?.['access-token'] ?? '', undefined, '/');
    this.cookiesService.set('userId', JSON.stringify(loginCredentials['user-id'] ?? ''), undefined, '/');
    this.cookiesService.set('refreshToken', loginCredentials['refresh-token'] ?? '', undefined, '/');
    this.cookiesService.set('myGateToken', loginCredentials?.authorization ?? '', undefined, '/', undefined, true, 'Lax');
    this.cookiesService.set('igateRefreshToken', loginCredentials?.['igate-refresh-token'] ?? '', undefined, '/', undefined, true, 'Lax');
  }

  setRefreshTokens(tokensResponse: RefreshTokenResponse): void {
    const authCookies = ['token', 'refreshToken', 'igateRefreshToken', 'myGateToken'];

    // Clear old tokens
    authCookies.forEach(cookie => this.cookiesService.delete(cookie, '/'));

    // Set new tokens
    this.cookiesService.set('token', tokensResponse['access-token'], undefined, '/');
    this.cookiesService.set('refreshToken', tokensResponse['refresh-token'], undefined, '/');
    this.cookiesService.set('igateRefreshToken', tokensResponse['igate-refresh-token'], undefined, '/');
    this.cookiesService.set('myGateToken', tokensResponse?.authorization, undefined, '/');
  }

  clearUserCookies(): void {
    this.cookiesService.deleteAll();
    this.cookiesService.delete('token', '/', undefined);
    this.cookiesService.delete('token');
    this.cookiesService.deleteAll('/');
    this.cookiesService.delete('userId', '/', undefined);
    this.cookiesService.delete('refreshToken', '/', undefined);
    localStorage.clear();
    sessionStorage.clear();
  }

  handleLogoutRedirection(): void {
    if (environment.name === 'mygate' || environment.name === 'production') {
      this.cookiesService.delete('token', '/dobox', 'mygate.stc.com.sa');
      this.cookiesService.delete('token');
      this.cookiesService.deleteAll('/dobox');
      this.cookiesService.delete('userId', '/dobox', 'mygate.stc.com.sa');
      this.cookiesService.delete('refreshToken', '/dobox', 'mygate.stc.com.sa');
      localStorage.setItem('currentAccessPage', window.location.href);
      window.location.href = '/mygate/login';
    } else {
      this.clearUserCookies();
      window.location.href = 'https://webdev.hubplatforms.com/new-dobox/auth/login';
    }
  }

  // ***** API METHODS ***** //

  validateToken(): Observable<ValidateResponse> {
    return this.http.post<ValidateResponse>(API_CONSTANTS.VALIDATE_TOKEN, {
      'access-token': `${this.getAccessToken().replace('Bearer ', '').trim()}`,
    } as Readonly<ValidatePayload>);
  }

  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(API_CONSTANTS.REFRESH_TOKEN, {
      'refresh-token': refreshToken,
      'igate-refresh-token': this.getIgateRefreshToken(),
    } as Readonly<RefreshTokenPayload>);
  }

  handleMyGateCookies() {
    this.cookiesService.delete('token', '/', 'mygate.stc.com.sa');
    this.cookiesService.delete('token');
    this.cookiesService.deleteAll('/');
    this.cookiesService.delete('userId', '/', 'mygate.stc.com.sa');
    this.cookiesService.delete('refreshToken', '/', 'mygate.stc.com.sa');
    localStorage.setItem('currentAccessPage', window.location.href);
    return window.location.href = '/mygate/login';
  }
}
