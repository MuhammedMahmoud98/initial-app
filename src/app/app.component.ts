import {Component, computed, inject, Signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {LocalizationService, UserService, PdfMakerService} from './core/services';
import { HeaderComponent } from './core/components/header/header.component';
import { AppsListComponent } from './core/components/apps-list/apps-list.component';
import {SubHeaderComponent} from './core/components/sub-header/sub-header.component';
import {CoreTabsListComponent} from './core/components/core-tabs-list/core-tabs-list.component';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Toast} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AuthenticationService} from './features/auth/services/authentication.service';
import {SpinnerLoaderComponent} from './shared/components/spinner-loader/spinner-loader.component';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    AppsListComponent,
    SubHeaderComponent,
    CoreTabsListComponent,
    ConfirmDialog,
    Toast,
    SpinnerLoaderComponent,
  ],
  providers: [ConfirmationService, MessageService, PdfMakerService, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly localizationService = inject(LocalizationService);
  readonly #userService = inject(UserService);
  readonly #pdfMakerService = inject(PdfMakerService);
  readonly #authService = inject(AuthenticationService);
  private router = inject(Router);
  protected readonly isRTL: Signal<boolean> = computed(() =>
    this.localizationService.isRTL(),
  );

  hasCredentials: Signal<boolean> = computed(() => {
    const useId = this.#userService.getUserId();
    const hasToken = this.#authService.hasToken();

    return !!(useId || hasToken);
  });

  isAppReady = computed(() => this.#userService.currentUser()?.['is-qr-code-admin']);
  isAppLoading = computed(() => this.#userService.isUserLoading());

  constructor() {
    this.localizationService.initialize();
    // Start warming pdfMake/font in background to avoid first-use delay
    try { this.#pdfMakerService.warmUpPdfMake(); } catch (e) {
      console.log(e, 'FAILED TO WARMUP FONT FILE');
    }
  }

  // toggleLanguage() {
  //   this.localizationService.toggleLanguage();
  // }
}
