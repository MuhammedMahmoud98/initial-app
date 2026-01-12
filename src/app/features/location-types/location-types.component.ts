import {
  afterNextRender,
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component, DestroyRef,
  inject,
  model,
  OnDestroy,
  signal, TemplateRef, viewChild
} from '@angular/core';
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {HubFiltersComponent} from '../../shared/components/hub-filters/hub-filters.component';
import {GenericTableCacheService} from '../../shared/services';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {LocationsService} from '../created-locations/services/locations.service';
import {DialogService} from 'primeng/dynamicdialog';
import {HubFilters} from '../../shared/components/hub-filters/models/hub-filters.model';
import {
  BackendErrorResponse,
  LocationColumnType, LocationServiceBody, LocationServiceEvent, LocationServicePayload, LocationServiceResponse,
  LocationType,
  LocationTypeResponse,
  ToggleServiceEvent
} from './models/location-types.model';
import {ItemFilter, ModeType} from '../../shared';
import {CLAASSIFICATION_FILTER, COMMON_CONSTANTS, INITIAL_FILTER_PAYLOAD} from '../../shared/constants/common-constants';
import {
  catchError,
  debounceTime,
  distinctUntilChanged, EMPTY,
  mergeMap,
  Observable,
  Subject,
  tap
} from 'rxjs';
import {TextWithBgColorComponent} from '../../shared/components/text-with-bg-color/text-with-bg-color.component';
import {genericCasting} from '../../shared/helpers/helpers';
import {TitleWithIconComponent} from '../../shared/components/title-with-icon/title-with-icon.component';
import {
  ServiceAvailabilityComponent
} from '../../shared/components/service-availability/service-availability.component';
import {ComponentStateComponent} from '../../shared/components/component-state/component-state.component';
import {SkeletonLoaderComponent} from '../../shared/components/skeleton-loader/skeleton-loader.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Button} from 'primeng/button';
import {
  CreateLocationTypeDialogComponent
} from '../../shared/dialogs/create-location-type-dialog/create-location-type-dialog.component';
import {MenuModule} from 'primeng/menu';
import {Ripple} from 'primeng/ripple';
import {MODE} from '../../shared/enums/shared.enum';
import { LocationTypeActionsService } from './services/location-type-actions.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { LoadingDialogService } from '../../shared/services/loading-dialog.service';
import { LoadingDialogComponent } from '../../shared/dialogs/loading-dialog/loading-dialog.component';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-location-types',
  imports: [
    GenericTableComponent,
    HubFiltersComponent,
    TextWithBgColorComponent,
    TitleWithIconComponent,
    ServiceAvailabilityComponent,
    ComponentStateComponent,
    SkeletonLoaderComponent,
    Button,
    TranslatePipe,
    // Menu,
    FormsModule,
    MenuModule,
    Ripple,
    MultiSelectModule,
    Dialog,
    LoadingDialogComponent,
  ],
  providers: [DialogService],
  standalone: true,
  templateUrl: './location-types.component.html',
  styleUrl: './location-types.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationTypesComponent implements OnDestroy {
  // INJECTIONS
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  readonly #locationsService: LocationsService = inject(LocationsService);
  readonly #locationTypeActionsService: LocationTypeActionsService = inject(LocationTypeActionsService);
  readonly #dialogService: DialogService = inject(DialogService);
  // readonly loadingDialogService = inject(LoadingDialogService);
  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly loadingDialogService = inject(LoadingDialogService);

  // SIGNALS
  items = signal<LocationType[]>([]);
  locationTypesPayload = signal<ItemFilter>({...INITIAL_FILTER_PAYLOAD});
  isApplyingFilter = signal(false);
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isLoading = signal(true);
  selectedClassification = signal<string>('');
  showLoadingDialog = model(false)
  loadingTitle = signal('');
  classificationOptions = signal([
    {name: this.#translateService.instant('employeeLocation'), code: CLAASSIFICATION_FILTER.EMPLOYEE_LOCATION},
    {name: this.#translateService.instant('generalLocation'), code: CLAASSIFICATION_FILTER.GENERAL_LOCATION},
  ]);

  // SUBJECTS
  private toggle$ = new Subject<LocationServiceEvent>();

  // VIEW CHILDREN
  serviceCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('serviceCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('codeCustomColumn');
  categoryCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('categoryCustomColumn');
  nameCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('nameCustomColumn');
  locationTypeServicesCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('locationTypeServicesCustomColumn');
  locationTypeActionsColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('locationTypeActionsColumn');
  dimentionsCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('dimentionsCustomColumn');


  protected readonly genericCasting = genericCasting<LocationType>;

  init: AfterRenderRef = afterNextRender(() => {
    this.getLocationTypes();
    this.listenToToggleService();
  });


  ngOnDestroy(): void {
    this.genericTableCacheService.resetCache();
  }

  getLocationTypes(): void {
    this.#locationsService.getLocationTypes(this.locationTypesPayload()).pipe(
      tap((locationTypesResponse: LocationTypeResponse) => {
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


  createTableColumns(): LocationColumnType[] {
    return [
      {field: 'name', alias: 'typeName', template: this.nameCustomColumn()},
      {field: 'category', alias: 'classification', template: this.categoryCustomColumn()},
      {field: 'code', alias: 'typeCode', template: this.codeCustomColumn()},
      {field: 'dimentions', alias: 'Printing Dimensions', template: this.dimentionsCustomColumn()},
      {field: 'services', alias: 'availableServices', template: this.serviceCustomColumn()},
      {field: 'availability', template: this.locationTypeServicesCustomColumn()},
      {field: '', template: this.locationTypeActionsColumn()},
    ]
  }

  onFilterValueChanges(filterValues: HubFilters): void {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({...filterValues, page: 0});
    this.genericTableCacheService.resetPagination$.next(true);
    this.getLocationTypes();
  }

onClassificationChange(category: string[] | null): void {
  console.log(category)
  let categoryValue: string | undefined;

  if (!category || category.length === 0 || category.length > 1) {
    categoryValue = '';
  } else {
    categoryValue = category[0];
  }

  this.updateFilterPayload({
    category: categoryValue,
    page: 0
  });

  this.genericTableCacheService.resetPagination$.next(true);
  this.getLocationTypes();
}

  onPageChange(currentPage: number) {
    this.updateFilterPayload({page: currentPage} as ItemFilter);
    this.getLocationTypes();
  }

  listenToToggleService(): void {
    this.toggle$.pipe(
      debounceTime(300),
      // distinctUntilChanged((prev, curr) => prev.isAvailable === curr.isAvailable),
      distinctUntilChanged(),
      mergeMap((locationServiceEvent: LocationServiceEvent): Observable<LocationServiceResponse> => {
        const {
          serviceId,
          id,
          isAvailable
        } = locationServiceEvent;

        const servicePayload = {id, serviceId} as LocationServicePayload;
        const serviceBody = {available: isAvailable} as LocationServiceBody;

        return this.#locationsService.updateLocationService(servicePayload, serviceBody).pipe(
          tap((locationServiceResponse: LocationServiceResponse) => {
            this.#messageService.add({severity:'success', summary: 'Success', detail: this.#translateService.instant(locationServiceResponse.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME});
          })
        );
      })).subscribe();
  }

  updateLocationService(toggleServiceEvent: ToggleServiceEvent, locationType: LocationType) {
    this.toggle$.next({...toggleServiceEvent, id: locationType.id});
  }

  updateFilterPayload(newFilters: HubFilters | ItemFilter): void {
    this.locationTypesPayload.update((current) => ({...current, ...newFilters}));
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

  openAddLocationTypeModal(mode: ModeType = MODE.ADD, locationTypeData?: LocationType): void {
    const dialogRef = this.#dialogService.open(CreateLocationTypeDialogComponent, {
      header: this.#translateService.instant(mode === MODE.ADD ? 'createNewType' : 'editType'),
      width: '580px',
      modal: true,
      closable: true,
      data: {
        mode,
        ...(locationTypeData as LocationType && { locationTypeData})
      }
    });

    dialogRef.onClose.pipe(
      tap((dialogCloseResponse: {refresh: boolean}) => {
        if (dialogCloseResponse?.refresh) {
          this.getLocationTypes();
        }
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe()
  }

  locationTypeActions(row: LocationType): MenuItem[] {
    return [
      {
        label: 'edit',
        command: () => {
          this.openAddLocationTypeModal(MODE.EDIT, row);
        },
        alias: 'edit'
      },
       {
        label: 'archive',
        command: () => {
          this.openArchiveConfirmDialog(row.id);
        },
        alias: 'archive',
        visible: row['has-linked-locations']
      },
      {
        label: 'delete',
        command: () => {
          this.openDeleteConfirmDialog(row.id);
        },
        alias: 'delete',
        visible: !row['has-linked-locations']
      }
    ];
  }

  openDeleteConfirmDialog(locationTypeId: number): void {
    this.confirmationService.confirm({
      header: this.#translateService.instant('deleteLocationTypeConfirmMessageHeader'),
      message: this.#translateService.instant('deleteLocationTypeConfirmMessageBody'),
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
        this.deleteLocationType(locationTypeId);
      }
    });
  }

  openArchiveConfirmDialog(locationTypeId: number): void {
    this.startLoading('validating archive...');
    this.#locationTypeActionsService.validateArchivingLocationTypes(locationTypeId).pipe(
      tap((res) => {
       this.stopLoading();
        if(res.isValid){
           this.confirmationService.confirm({
            header: this.#translateService.instant('archiveWarning'),
            message: this.#translateService.instant('archivingTheLocationTypeWillRemove'),
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
              this.archiveLocationType(locationTypeId);
            }
          });
        }
        else {
         this.#messageService.add({
          severity: 'warn',
          detail: this.#translateService.instant(res.message || 'something went wrong'),
        });
      }
    }),
     catchError((e) => {
         this.stopLoading();
        this.#messageService.add({
          severity: 'error',
          detail: this.getBackendErrorMessage(e.error),
        });

        return EMPTY;
      }),
      takeUntilDestroyed(this.#destroyRef),
  ).
  subscribe()
  }

  private getBackendErrorMessage(error: BackendErrorResponse): string {
    return (
      error?.message?.[0]?.source?.message || error?.message ||
      this.#translateService.instant('something went wrong')
    );
  }


  deleteLocationType(locationTypeId: number): void {
    this.#locationTypeActionsService.deleteLocationType(locationTypeId).pipe(
      tap(() => {
        this.#messageService.add({severity:'success', summary: 'Success', detail: this.#translateService.instant('locationTypeDeletedSuccessfully'), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME});
        this.getLocationTypes();
      }),
      catchError((e) => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: this.getBackendErrorMessage(e.error) , life: COMMON_CONSTANTS.TOASTER_LIFE_TIME});
        return EMPTY;
      })
    ).subscribe();
  }


  archiveLocationType(locationTypeId: number): void {
    this.#locationTypeActionsService.archiveLocationType(locationTypeId).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.#messageService.add({severity:'success', summary: 'Success', detail: this.#translateService.instant(res.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME});
        this.getLocationTypes();
      }),
      catchError((e) => {
        this.isLoading.set(false);
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: this.getBackendErrorMessage(e.error) , life: COMMON_CONSTANTS.TOASTER_LIFE_TIME});
        return EMPTY;
      })
    ).subscribe();
  }

   startLoading(title: string): void {
    this.showLoadingDialog.set(true);
    this.loadingTitle.set(title);

    this.loadingDialogService.startFakeProgress();
  }

   stopLoading(): void {
    setTimeout(() => {
      this.showLoadingDialog.set(false);
    }, 1500);
    this.loadingDialogService.completeProgress();
  }
}
