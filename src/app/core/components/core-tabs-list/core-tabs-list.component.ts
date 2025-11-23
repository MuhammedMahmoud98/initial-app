import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CORE_APP_ROUTES } from '../../../shared/constants/common-constants';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {MAIN_ROUTES} from '../../../shared/enums/shared.enum';

@Component({
  selector: 'app-core-tabs-list',
  imports: [RouterLink, RouterLinkActive, TranslatePipe ,CommonModule],
  templateUrl: './core-tabs-list.component.html',
  styleUrl: './core-tabs-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreTabsListComponent implements OnInit, OnDestroy {
  tabsList = signal(CORE_APP_ROUTES);

  private routeSub!: Subscription;

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // ✅ Watch for route changes to refresh conditions
    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cdr.markForCheck(); // Force re-render when route changes
      });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  /** ✅ Works reactively after navigation */
  get isUploadPage(): boolean {
    return this.router.url.includes('/upload-file');
  }

  get isCreatedLocationsPage(): boolean {
    return this.router.url.includes('/created-locations');
  }

  goToUploadFile() {
    this.router.navigate([`${MAIN_ROUTES.CREATED_LOCATIONS}/${MAIN_ROUTES.UPLOAD_FILE}`]);
  }
}
