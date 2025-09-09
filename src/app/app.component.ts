import {Component, computed, inject, Signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { LocalizationService } from './core/services';
import { HeaderComponent } from './core/components/header/header.component';
import { AppsListComponent } from './core/components/apps-list/apps-list.component';
import {SubHeaderComponent} from './core/components/sub-header/sub-header.component';
import {CoreTabsListComponent} from './core/components/core-tabs-list/core-tabs-list.component';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Toast} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';

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
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly localizationService = inject(LocalizationService);
  private router = inject(Router);
  protected readonly isRTL: Signal<boolean> = computed(() =>
    this.localizationService.isRTL(),
  );

  constructor() {
    this.localizationService.initialize();
  }

  // toggleLanguage() {
  //   this.localizationService.toggleLanguage();
  // }
}
