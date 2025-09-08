import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGS = ['en', 'ar'];
export const APP_LANGUAGE_LOCAL_STORAGE_KEY = 'lang';

export function translationAppInitializer() {
  return () => {
    const translateService = inject(TranslateService);

    const savedLang: string = localStorage.getItem(APP_LANGUAGE_LOCAL_STORAGE_KEY) || DEFAULT_LANG;
    translateService.addLangs(SUPPORTED_LANGS);
    translateService.setDefaultLang(DEFAULT_LANG);

    return translateService.use(savedLang).toPromise();
  };
}
