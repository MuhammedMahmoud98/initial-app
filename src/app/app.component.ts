import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { LocalizationService } from './core/services';
import { HeaderComponent } from './core/components/header/header.component';
import { AppsListComponent } from './core/components/apps-list/apps-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    AppsListComponent,
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly localizationService = inject(LocalizationService);
  private router = inject(Router);
  protected readonly isRTL: Signal<boolean> = computed(() =>
    this.localizationService.isRTL(),
  );

  constructor() {
    this.localizationService.initialize();
  }

  ngOnInit(): void {
  }

  toggleLanguage() {
    this.localizationService.toggleLanguage();
  }

}
