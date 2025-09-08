import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JsEncryptService } from '../services/js-encrypt.service';
import { environment } from '../../environment/environment';
import { CookieService } from 'ngx-cookie-service';
import { AuthorizationToken } from '../models/auth-interceptor.model';
import {isTokenLessUrl} from '../../shared/helpers/helpers';
import {AuthenticationService} from '../../features/auth/services/authentication.service';
import { UserService } from '../services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jsEncryptService: JsEncryptService = inject(JsEncryptService);
  const cookiesService = inject(CookieService);
  const authService = inject(AuthenticationService);
  const userService = inject(UserService);
  // const Authorization: AuthorizationToken | string = isTokenLessUrl(req.url) ? '' : `Bearer ${cookiesService.get('token')}` as AuthorizationToken;
  const alreadyHasAuthorization = req.headers.has('Authorization');
  const shouldSetToken = !alreadyHasAuthorization && !isTokenLessUrl(req.url);

  const Authorization: AuthorizationToken | string = shouldSetToken
    ? `Bearer ${authService.getAccessToken()}` as AuthorizationToken
    : '';
  jsEncryptService.setPublicKey(environment.ENCRYPTION_PUBLIC_KEY);

  const existingHeaders: Record<string, string> = {};
  req.headers.keys().forEach((key) => {
    const value = req.headers.get(key);
    if (value) {
      existingHeaders[key] = value;
    }
  });

  const urlsNeedThirdPartyToken = [
    { pattern: /^.*\/header\/employees\/[^/]+\/nav\/items$/, methods: ['GET'] }
  ];

  const shouldModifyThirdPartyToken = urlsNeedThirdPartyToken.some(
    ({ pattern, methods }) =>
      pattern.test(req.url) && methods.includes(req.method),
  );
  // Define default headers
  const defaultHeaders = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'API-CLIENT': jsEncryptService.encrypt(`${environment.API_CLIENT};${new Date().toUTCString()}`),
    ...(Authorization ? { Authorization } : {}),
    'Accept-Language': cookiesService.get('lang'),
    'locale': cookiesService.get('lang'),
    'API-DATE': new Date().toUTCString(),
    Agent: 'web',
    ...(shouldModifyThirdPartyToken && {
       'third-party-token': userService.getMygateGateAuthToken() || '',
    }),
  };


  return next(
    req.clone({
      setHeaders: {
        ...defaultHeaders,
        ...existingHeaders,
      },
    }),
  );
};

