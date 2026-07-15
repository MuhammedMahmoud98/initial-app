import {Component, computed, inject, Signal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {LocalizationService, UserService} from './core/services';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {filter, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

import {Button} from 'primeng/button';
import {AuthenticationService} from './core/services/authentication.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Button,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly localizationService = inject(LocalizationService);
  readonly #userService = inject(UserService);
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
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}
