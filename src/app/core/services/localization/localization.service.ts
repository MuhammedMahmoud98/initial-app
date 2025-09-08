import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  APP_LANGUAGE_LOCAL_STORAGE_KEY,
  DEFAULT_LANG,
} from '../../initializers';
import {CookieService} from 'ngx-cookie-service';

export type SupportedLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  readonly translateService = inject(TranslateService);

  private readonly cookiesService: CookieService = inject(CookieService);

  protected readonly currentLang = signal<SupportedLanguage>(DEFAULT_LANG);

  readonly getDirection = computed(() =>
    this.currentLang() === 'ar' ? 'rtl' : 'ltr',
  );

  readonly isRTL = computed(() => this.currentLang() === 'ar');

  switchLanguage(lang: SupportedLanguage): void {
    if (this.currentLang() !== lang) {
      this.updateLocalStorageLanguage(lang);

      window.location.reload();
    }
  }

  toggleLanguage(): void {
    const lang = this.currentLang() === 'ar' ? 'en' : 'ar';

    this.switchLanguage(lang);
  }

  getCurrentLang(): SupportedLanguage {
    return (this.cookiesService.get('lang') || localStorage.getItem(APP_LANGUAGE_LOCAL_STORAGE_KEY)) as SupportedLanguage;
  }

  initialize(): void {
    const savedLang = (this.getCurrentLang() ||
      DEFAULT_LANG) as SupportedLanguage;

    this.currentLang.set(savedLang);

    this.appendLanguageToHTMLTag(savedLang);
    this.switchAppDirection(savedLang);
  }

  private appendLanguageToHTMLTag(lang: SupportedLanguage): void {
    globalThis.document.querySelector('html')?.setAttribute('lang', lang);
  }

  private switchAppDirection(lang: SupportedLanguage): void {
    const direction = lang === 'ar' ? 'rtl' : 'ltr';

    globalThis.document.querySelector('html')?.setAttribute('dir', direction);
  }

  private updateLocalStorageLanguage(lang: SupportedLanguage): void {
    localStorage.setItem(APP_LANGUAGE_LOCAL_STORAGE_KEY, lang);
    this.cookiesService.set('lang', lang);
  }
}
