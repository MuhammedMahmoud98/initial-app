import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, catchError, delay, filter, Observable, of, switchMap, take, throwError} from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<RefreshTokenResponse| null>(null);


import { HttpHandlerFn, HttpEvent } from '@angular/common/http';
import {AuthenticationService} from '../../features/auth/services/authentication.service';
import {inject} from '@angular/core';
import {RefreshTokenResponse} from '../../features/auth/models/auth.model';
import {HttpErrorResponse} from '@angular/common/http';
import {isTokenLessUrl} from '../../shared/helpers/helpers';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService: AuthenticationService = inject(AuthenticationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // REFRESH TOKEN IS FAILED CASE
      if (isAuthError(error) && error?.url?.includes('v3/public/auth/refresh_token')) {
        handleRefreshFailure(authService);
      }

      // Check if it's an authentication error
      if (isAuthError(error)) {
        console.error('%cIS AUTH ERROR', 'color: red; font-weight: bold;');
        return handleAuthError(req, next, error, authService);
      }

      // Handle other error types
      handleErrorByStatus(error);

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

function handleAuthError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  originalError: HttpErrorResponse,
  authService: AuthenticationService,
): Observable<HttpEvent<unknown>> {
  // If token refresh is already in progress, wait for it
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        if (token?.['access-token']) {
          // Retry the original request with new token
          console.log('%cRetrying request with new token', 'color: green; font-weight: bold;');
          const newReq = addTokenToRequest(req, token?.['access-token']);
          return next(newReq);
        } else {
          // Refresh failed, return original error
          return throwError(() => originalError);
        }
      })
    );
  }

  // Start token refresh process
  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken(authService.getRefreshToken()).pipe(
    switchMap((refreshResult: RefreshTokenResponse): Observable<HttpEvent<unknown>> => {
      isRefreshing = false;

      if (refreshResult?.['access-token']) {
        // Token refresh successful
        refreshTokenSubject.next(refreshResult);

        authService.setRefreshTokens(refreshResult);

        // Retry the original request with new token
        const newReq = addTokenToRequest(req, refreshResult['access-token']);
        return of(newReq).pipe(
          delay(100),
          switchMap((delayedReq: HttpRequest<unknown>) => next(delayedReq))
        );
      } else {
        // Token refresh failed
        refreshTokenSubject.next(null);
        isRefreshing = false;
        return throwError(() => originalError);
      }
    }),
    catchError((err) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      // Handle refresh failure - logout user
      handleRefreshFailure(authService);
      return throwError(() => err);
    })
  );
}

function isAuthError(error: HttpErrorResponse): boolean {
  return (error.status === 0 || error.status === 401) || error.error instanceof ProgressEvent && (
    error.message.includes('401') ||
    error.message.toLowerCase().includes('unauthorized') ||
    error.message.toLowerCase().includes('authentication')
  );
}

// NO NEED TO ADD API-CLIENT, AGENT AND SO ON, THIS FUNCTION WILL ONLY REPLACE THE OLD HEADER
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  const shouldSetToken = !isTokenLessUrl(req.url);
  const isValidateUrl = req.url.includes('/auth/validate');


  if (isValidateUrl && req.method === 'POST') {
    // Clone the request and add access-token to the body
    const originalBody = req.body || {};
    const newBody = { ...originalBody, 'access-token': token };

    return req.clone({
      headers: req.headers.set('Authorization', shouldSetToken ? `Bearer ${token}` : ''),
      body: newBody
    });
  }

  return req.clone({
    headers: req.headers.set('Authorization', shouldSetToken ? `Bearer ${token}` : '')
  });
}

function handleRefreshFailure(authService: AuthenticationService): void {
  // Clear stored tokens
  authService.handleLogoutRedirection();
}

function handleErrorByStatus(error: HttpErrorResponse): void {
  switch (error.status) {
    case 0:
      console.error('Network error or CORS issue');
      break;
    case 403:
      console.error('Forbidden - insufficient permissions');
      break;
    case 404:
      console.error('Resource not found');
      break;
    case 500:
      console.error('Internal server error');
      break;
    case 502:
      console.error('Bad Gateway');
      break;
    case 503:
      console.error('Service Unavailable');
      break;
    default:
      console.error('An unexpected error occurred');
  }
}
