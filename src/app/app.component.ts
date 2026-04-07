import {Component, computed, inject, Signal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
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
import {filter, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {StatisticsWidgetsComponent} from './core/components/statistics-widgets/statistics-widgets.component';

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
    StatisticsWidgetsComponent,
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
  private activatedRoute = inject(ActivatedRoute);
  protected readonly isRTL: Signal<boolean> = computed(() =>
    this.localizationService.isRTL(),
  );

  hasCredentials: Signal<boolean> = computed(() => {
    const useId = this.#userService.getUserId();
    const hasToken = this.#authService.hasToken();

    return !!(useId || hasToken);
  });

  isSubHeaderVisible = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(() => {
    const child = this.getDeepestChild(this.activatedRoute);
    const data = child.snapshot.data as {hideSubHeader: boolean};

    return !(data && data['hideSubHeader']) && this.hasCredentials();
  })));

  isAppReady = computed(() => this.#userService.currentUser()?.['is-qr-code-admin']);
  isAppLoading = computed(() => this.#userService.isUserLoading());

  constructor() {
    console.log('%c APP COMPONENT INITIALIZED 07 APR 26', 'color: yellow; font-weight: bold;');
    this.localizationService.initialize();
    // Start warming pdfMake/font in background to avoid first-use delay
    try { this.#pdfMakerService.warmUpPdfMake(); } catch (e) {
      console.log(e, 'FAILED TO WARMUP FONT FILE');
    }
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}
