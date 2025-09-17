import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services';
import {map, catchError, of, take, switchMap} from 'rxjs';
import {AuthenticationService} from '../../features/auth/services/authentication.service';
import {environment} from '../../environment/environment';

export const thriftGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const authService: AuthenticationService = inject(AuthenticationService);

  const currentPath = route.url.join('/');
  const userId = +userService.getUserId();
  const hasToken = authService.hasToken();

  if (!userId || !hasToken) {
    const isMyGateEnv = ['mygate', 'production'].includes(environment.name);

    if (isMyGateEnv) {
      authService.handleMyGateCookies();
    } else {
      authService.unAuthorizedChecked.set(true);
      router.navigate(['/un-authorized']);
    }

    return false;
  }

  return authService.validateToken().pipe(
    switchMap(() => userService.getUserById(userId).pipe(
      take(1),
      map((user) => {
        if (!user) {
          authService.unAuthorizedChecked.set(true);
          router.navigate(['/un-authorized']);
          return false;
        }

        if (user['is-qr-code-admin'] && currentPath.includes('un-authorized')) {
          router.navigate(['/']);
          return false;
        }

        if (!user['is-qr-code-admin']) {
          authService.unAuthorizedChecked.set(true);
          router.navigate(['/un-authorized']);
          return false;
        }

        // adminControlsService.isAppLoading$.next(true);
        return true;
      }),
      catchError(() => {
        // router.navigate(['un-authorized']);
        return of(false);
      }),
    )),
    catchError(() => {
      // router.navigate(['un-authorized']);
      return of(false);
    }),
  )
};
