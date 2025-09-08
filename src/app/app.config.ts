import {ApplicationConfig, importProvidersFrom, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withViewTransitions} from '@angular/router';

import { routes } from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {stcPreset} from './custom-preset';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {translationAppInitializer} from './core/initializers';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {APP_BASE_HREF} from '@angular/common';
import {environment} from './environment/environment';
import {errorInterceptor} from './core/interceptors/error.interceptor';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      // TODO APPLYING ERROR INTERCEPTOR HERE..
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimationsAsync(),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ]),
    provideAppInitializer(translationAppInitializer()),
    providePrimeNG({
      theme: {
        preset: stcPreset,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
    {
      provide: APP_BASE_HREF,
      useValue: environment.baseHref
    }
  ]
};
