import {ChangeDetectionStrategy, ChangeDetectorRef, Component, signal, OnInit, OnDestroy, inject} from '@angular/core';
import { CORE_APP_ROUTES } from '../../../shared/constants/common-constants';
import {Router, RouterLink, RouterLinkActive, NavigationEnd} from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {Subscription, tap} from 'rxjs';
import {MAIN_ROUTES} from '../../../shared/enums/shared.enum';
import {StatisticMainCardsService} from '../statistics-widgets/services/statistic-main-cards.service';

@Component({
  selector: 'app-core-tabs-list',
  imports: [RouterLink, RouterLinkActive, TranslatePipe ,CommonModule],
  templateUrl: './core-tabs-list.component.html',
  styleUrl: './core-tabs-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreTabsListComponent implements OnInit, OnDestroy {
  tabsList = signal(CORE_APP_ROUTES);

  readonly #statisticMainCardsService: StatisticMainCardsService = inject(StatisticMainCardsService);

  private routeSub!: Subscription;

  previousUrl: string | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // ✅ Watch for route changes to refresh conditions
    this.routeSub = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          this.cdr.markForCheck();
        })
      ).subscribe();
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

  protected updateCardStatistics(path: string): void {
    if (!this.previousUrl) {
      this.previousUrl = path;
    }

    if (this.previousUrl !== path) {
      this.#statisticMainCardsService.updateMainCards();
      this.previousUrl = null;
    }
  }
}
