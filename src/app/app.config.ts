import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withViewTransitions} from '@angular/router';

import { routes } from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {stcPreset} from './custom-preset';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {translationAppInitializer} from './core/initializers';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {APP_BASE_HREF, registerLocaleData} from '@angular/common';
import {environment} from './environment/environment';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import localeAr from '@angular/common/locales/ar';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
registerLocaleData(localeAr);

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
    },
    {
      provide: LOCALE_ID,
      deps: [TranslateService],
      useFactory: (translate: TranslateService) => {
        const lang = translate.currentLang || 'en';
        return lang === 'ar' ? 'ar' : 'en';
      }
    }

  ]
};
