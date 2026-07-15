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
import {CookieService} from 'ngx-cookie-service';
import {API_CONSTANTS} from '../../shared';
import {TokenKeyConstants} from '../constants/token-key.constants';
import {environment} from '../../environment/environment';

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
    return this.cookiesService.get(TokenKeyConstants.ACCESS_TOKEN);
  }

  getRefreshToken(): string {
    return this.cookiesService.get(TokenKeyConstants.REFRESH_TOKEN);
  }

  getIgateRefreshToken(): string {
    return this.cookiesService.get(TokenKeyConstants.IGATE_REFRESH_TOKEN);
  }

  hasToken(): boolean {
    return !!this.cookiesService.get(TokenKeyConstants.ACCESS_TOKEN);
  }

  isRefreshTokenExist(): boolean {
    return !!this.getRefreshToken();
  }

  setCookies(loginCredentials: AuthCredentials): void {
    this.cookiesService.set('username', loginCredentials?.email ?? '', undefined, '/');
    this.cookiesService.set(TokenKeyConstants.ACCESS_TOKEN, loginCredentials?.['access-token'] ?? '', undefined, '/');
    this.cookiesService.set('userId', JSON.stringify(loginCredentials['user-id'] ?? ''), undefined, '/');
    this.cookiesService.set(TokenKeyConstants.REFRESH_TOKEN, loginCredentials['refresh-token'] ?? '', undefined, '/');
    this.cookiesService.set(TokenKeyConstants.THIRD_PARTY_TOKEN_KEY, loginCredentials?.authorization ?? '', undefined, '/', undefined, true, 'Lax');
    this.cookiesService.set(TokenKeyConstants.IGATE_REFRESH_TOKEN, loginCredentials?.['igate-refresh-token'] ?? '', undefined, '/', undefined, true, 'Lax');
  }

  setRefreshTokens(tokensResponse: RefreshTokenResponse): void {
    const authCookies = [
      TokenKeyConstants.ACCESS_TOKEN,
      TokenKeyConstants.REFRESH_TOKEN,
      TokenKeyConstants.IGATE_REFRESH_TOKEN,
      TokenKeyConstants.THIRD_PARTY_TOKEN_KEY,
    ];

    // Clear old tokens
    authCookies.forEach(cookie => this.cookiesService.delete(cookie, '/'));

    // Set new tokens
    this.cookiesService.set(TokenKeyConstants.ACCESS_TOKEN, tokensResponse['access-token'], undefined, '/');
    this.cookiesService.set(TokenKeyConstants.REFRESH_TOKEN, tokensResponse['refresh-token'], undefined, '/');
    this.cookiesService.set(TokenKeyConstants.IGATE_REFRESH_TOKEN, tokensResponse['igate-refresh-token'], undefined, '/');
    this.cookiesService.set(TokenKeyConstants.THIRD_PARTY_TOKEN_KEY, tokensResponse?.authorization, undefined, '/');
  }

  clearUserCookies(): void {
    this.cookiesService.deleteAll();
    this.cookiesService.delete(TokenKeyConstants.ACCESS_TOKEN, '/', undefined);
    this.cookiesService.delete(TokenKeyConstants.ACCESS_TOKEN);
    this.cookiesService.deleteAll('/');
    this.cookiesService.delete('userId', '/', undefined);
    this.cookiesService.delete(TokenKeyConstants.REFRESH_TOKEN, '/', undefined);
    localStorage.clear();
    sessionStorage.clear();
  }

  handleLogoutRedirection(): void {
    if (environment.name === 'mygate' || environment.name === 'production') {
      this.cookiesService.delete(TokenKeyConstants.ACCESS_TOKEN, '/dobox', 'mygate.stc.com.sa');
      this.cookiesService.delete(TokenKeyConstants.ACCESS_TOKEN);
      this.cookiesService.deleteAll('/dobox');
      this.cookiesService.delete('userId', '/dobox', 'mygate.stc.com.sa');
      this.cookiesService.delete(TokenKeyConstants.REFRESH_TOKEN, '/dobox', 'mygate.stc.com.sa');
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
    this.cookiesService.delete(TokenKeyConstants.ACCESS_TOKEN, '/', 'mygate.stc.com.sa');
    this.cookiesService.delete(TokenKeyConstants.ACCESS_TOKEN);
    this.cookiesService.deleteAll('/');
    this.cookiesService.delete('userId', '/', 'mygate.stc.com.sa');
    this.cookiesService.delete(TokenKeyConstants.REFRESH_TOKEN, '/', 'mygate.stc.com.sa');
    localStorage.setItem('currentAccessPage', window.location.href);
    return window.location.href = '/mygate/login';
  }
}
