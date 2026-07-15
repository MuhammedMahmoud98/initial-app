import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { LocalizationService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import {environment} from '../../../environment/environment';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [ButtonModule, MenuModule],
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
})
export class ProfileMenuComponent {
  readonly localizationService = inject(LocalizationService);
  readonly translateService = inject(TranslateService);
  readonly #authenticationService: AuthenticationService = inject(AuthenticationService);
  showBackDrop = signal(false);
  currentUser = signal(null);
  userObject = signal(null);
  menuItems: MenuItem[] = [
    {
      label: this.translateService.instant('profile'),
      icon: 'pi pi-user',
      command: () => this.navigateToProfile(),
      styleClass: this.localizationService.isRTL() ? 'rtl' : 'ltr',
    },
    {
      label: this.translateService.instant('languageToTranslate'),
      icon: 'pi pi-globe',
      command: () => this.toggleLanguage(),
      styleClass: this.localizationService.isRTL() ? 'rtl' : 'ltr',
    },
    {
      separator: true,
    },
    {
      label: this.translateService.instant('logOut'),
      style: { color: '#FF0000' },
      icon: 'pi pi-sign-out',
      iconStyle: { color: '#FF0000' },
      command: () => this.logout(),
      styleClass: this.localizationService.isRTL() ? 'rtl' : 'ltr',
    },
  ];

  navigateToProfile() {
    window.location.href = '/profile';
  }

  toggleLanguage() {
    this.localizationService.toggleLanguage();
  }

  logout() {
    this.#authenticationService.clearUserCookies();
    return window.location.href = (environment as Partial<{logoutURL: string}>)?.logoutURL ?? '';
  }
}
