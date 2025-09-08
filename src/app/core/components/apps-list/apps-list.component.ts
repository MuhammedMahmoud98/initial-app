import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Component, signal, WritableSignal, inject, computed, ChangeDetectorRef} from '@angular/core';
import { NavItem } from '../../models';
import { AppsService } from '../../services/apps.service';
import {retry, tap} from 'rxjs';
import {environment} from '../../../environment/environment';

@Component({
  selector: 'app-apps-list',
  standalone: true,
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  imports: [CommonModule, NgOptimizedImage], // Add necessary Angular modules here
})
export class AppsListComponent {
  readonly appsService = inject(AppsService);
  readonly #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  showApp = signal(false);
  isDesktop = signal(false);

  navItems: WritableSignal<NavItem[]> = signal([]);
  navDesktopItems = signal([
    {
      name: 'dobox',
      url: '/dobox',
      iconUrl: 'assets/images/app-icon.png',
    },
    {
      name: 'chat',
      url: '/chat',
      iconUrl: 'assets/images/app-icon.png',
    },
    {
      name: 'Meetings',
      url: '/meetings',
      iconUrl: 'assets/images/app-icon.png',
    },
    {
      name: 'stcToday',
      url: '/stc-profile',
      iconUrl: 'assets/images/app-icon.png',
    },
    {
      name: 'Articles',
      url: '/articles',
      iconUrl: 'assets/images/app-icon.png',
    },
    {
      name: 'Timeline',
      url: '/feeds',
      iconUrl: 'assets/images/app-icon.png',
    },
  ]);

  isMygateProduction = computed(() => {
    return environment.name === 'mygate' || environment.name === 'production';
  });

  constructor() {
    this.checkIfDesktop();
    this.loadNavItems();
  }

  checkIfDesktop(): void {
    this.isDesktop.set(window.navigator.userAgent.includes('desktop'));
  }

  loadNavItems(): void {
    const myGateEmail = localStorage.getItem('myGateEmail');
    if (myGateEmail) {
      this.appsService
        .getNavigationItems(myGateEmail)
        .pipe(
          tap((appsList: NavItem[]) => {
            this.navItems.set(appsList);
          }),
          retry({
            count: 2,
            delay: 1000,
            resetOnSuccess: true,
          })
        ).subscribe();
    }
  }

  handleBrokenImage(event: Event) {
     const img = event.target as HTMLImageElement;
     img.src = 'assets/images/app-icon.png';
     img.style.display = 'inline';
     this.#cdr.markForCheck();
  }
}
