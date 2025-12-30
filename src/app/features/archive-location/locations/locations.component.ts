import {
  afterNextRender,
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  signal, TemplateRef, viewChild
} from '@angular/core';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { GenericTableCacheService } from '../../../shared/services';
import { DialogService } from 'primeng/dynamicdialog';
import { HubFilters } from '../../../shared/components/hub-filters/models/hub-filters.model';

import { ItemFilter } from '../../../shared';
import {
  catchError,
  EMPTY,

  tap
} from 'rxjs';
import { genericCasting } from '../../../shared/helpers/helpers';

import { ComponentStateComponent } from '../../../shared/components/component-state/component-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

import { TitleWithIconComponent } from '../../../shared/components/title-with-icon/title-with-icon.component';
import { INITIAL_FILTER_PAYLOAD } from '../../../shared/constants/common-constants';
import { HubFiltersComponent } from '../../../shared/components/hub-filters/hub-filters.component';
import { CopyToClipboardComponent } from '../../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TimezoneDatePipe } from '../../../shared/pipes/timezone-date.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArchivedLocationService } from './services/archived-locations.service';
import { archiveLocation, CreatedArchivedLocationColumnType, CreatedArchivedLocationResponse } from './models/locations.model';
import { TextWithBgColorComponent } from '../../../shared/components/text-with-bg-color/text-with-bg-color.component';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-location-type',
  imports: [
    GenericTableComponent,
    ComponentStateComponent,
    SkeletonLoaderComponent,
    TitleWithIconComponent,
    HubFiltersComponent,
    CopyToClipboardComponent,
    TranslatePipe,
    TimezoneDatePipe,
    CommonModule,
    TextWithBgColorComponent,
    MenuModule,

  ],
  providers: [DialogService, TimezoneDatePipe],
  standalone: true,
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchivedLocationsComponent implements OnDestroy {
  // INJECTIONS
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  readonly #ArchivedLocationService: ArchivedLocationService = inject(ArchivedLocationService);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);

  // readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService);

  // SIGNALS
  items = signal<archiveLocation[]>([]);

  locationTypesPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);
  isApplyingFilter = signal(false);
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isLoading = signal(true);


  // VIEW CHILDREN
  qrStatusCustomColumn = viewChild<TemplateRef<{ $implicit: archiveLocation }>>('qrStatusCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{ $implicit: archiveLocation }>>('codeCustomColumn');
  districtCustomColumn = viewChild<TemplateRef<{ $implicit: archiveLocation }>>('districtCustomColumn');
  locationTypeCustomColumn = viewChild<TemplateRef<{ $implicit: archiveLocation }>>('locationTypeCustomColumn');
  buildingCustomColumn = viewChild<TemplateRef<{ $implicit: archiveLocation }>>('buildingCustomColumn');
  locationTypeActionsColumn = viewChild<TemplateRef<{ $implicit: archiveLocation }>>('locationTypeActionsColumn');


  protected readonly genericCasting = genericCasting<archiveLocation>;

  init: AfterRenderRef = afterNextRender(() => {
    this.getAssignedLocationTypes();
    // this.items.set([{
    //   id: 1,
    //   district: 'Nasr City',
    //   category: 'Office',
    //   building: 'B1',
    //   floor: '3',
    //   zone: 'Z2',
    //   code: 'LC-001',
    //   qrCode: 'QR-001',
    //   serial: 'SR-001',
    //   typeTitle: 'Archive',
    //   typeCode: 'AR',
    //   isSelected: false
    // }]);
    // this.isLoading.set(false)
  });


  ngOnDestroy(): void {
    this.genericTableCacheService.resetCache();
  }

  getAssignedLocationTypes(): void {
    this.#ArchivedLocationService.getLocationsArchived(this.locationTypesPayload()).pipe(
      tap((locationTypesResponse: CreatedArchivedLocationResponse) => {
        this.isLoading.set(false);
        if (locationTypesResponse) {
          this.genericTableCacheService.totalAvailableItems.set(locationTypesResponse.totalElements);
          this.items.set(locationTypesResponse.content);
          this.clearStates();
        } else {
          this.handleEmptyState();
        }
      }),
      takeUntilDestroyed(this.#destroyRef),
      catchError(() => {
        this.isLoading.set(false);
        this.handleErrorState();
        return EMPTY;
      })
    ).subscribe();
  }


  locationTypeActions(row: archiveLocation): MenuItem[] {
    return [
      {
        label: 'Un-archive',
        command: () => {
          this.openConfirmDialog(row.id)
        },
        alias: 'Un-archive'
      },
    ];
  }


    openConfirmDialog(locationTypeId: number): void {
    this.confirmationService.confirm({
      header: this.#translateService.instant('unArchivedLocationConfirmMessageHeader'),
      message: this.#translateService.instant('unArchivedLocationConfirmMessageBody'),
      closable: false,
      closeOnEscape: true,
      rejectButtonProps: {
        label: this.#translateService.instant('cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.#translateService.instant('confirm'),
        severity: 'secondary',
      },
      acceptVisible: true,
      accept: (): void => {
        this.unArchivedLocation(locationTypeId);
      }
    });
  }

  unArchivedLocation(locationTypeId: number): void {
    this.#ArchivedLocationService.unarchiveLocation([locationTypeId]).pipe(
      tap(() => {
        this.getAssignedLocationTypes();
      }),
      takeUntilDestroyed(this.#destroyRef),
      catchError(() => {
        return EMPTY;
      })
    ).subscribe();
  }

  createTableColumns(): CreatedArchivedLocationColumnType[] {
    return [
      { field: 'district', template: this.districtCustomColumn() },
      { field: 'category' },
      { field: 'building', template: this.buildingCustomColumn() },
      { field: 'floor' },
      { field: 'zone' },
      { field: 'serial' },
      { field: 'type', alias: 'locationTypeCode', template: this.locationTypeCustomColumn() },
      { field: 'code', alias: 'locationCode', template: this.codeCustomColumn(), columnWidth: '15%' },
      { field: '', template: this.locationTypeActionsColumn() },
    ]
  }

  onPageChange(currentPage: number) {
    this.updateFilterPayload({ page: currentPage } as ItemFilter);
    this.getAssignedLocationTypes();
  }


  updateFilterPayload(newFilters: HubFilters | ItemFilter): void {
    this.locationTypesPayload.update((current) => ({ ...current, ...newFilters }));
    console.log(this.locationTypesPayload(), 'UPDATED PAYLOAD');
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({ ...filterValues, page: 0 });
    this.getAssignedLocationTypes();
  }






  handleEmptyState(): void {
    this.isEmptyState.set(true);
    this.isErrorState.set(false);
    this.genericTableCacheService.totalAvailableItems.set(0);
  }

  handleErrorState(): void {
    this.isErrorState.set(true);
    this.isEmptyState.set(false);
    this.genericTableCacheService.totalAvailableItems.set(0);
  }

  clearStates(): void {
    this.isEmptyState.set(false);
    this.isErrorState.set(false);
  }
}
