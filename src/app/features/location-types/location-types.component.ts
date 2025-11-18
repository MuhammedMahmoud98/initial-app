import {
  afterNextRender,
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal, TemplateRef, viewChild
} from '@angular/core';
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {HubFiltersComponent} from '../../shared/components/hub-filters/hub-filters.component';
import {GenericTableCacheService} from '../../shared/services';
import {MenuItem, MessageService} from 'primeng/api';
import {LocationsService} from '../created-locations/services/locations.service';
import {DialogService} from 'primeng/dynamicdialog';
import {HubFilters} from '../../shared/components/hub-filters/models/hub-filters.model';
import {
  LocationColumnType, LocationServiceBody, LocationServiceEvent, LocationServicePayload, LocationServiceResponse,
  LocationType,
  LocationTypeResponse,
  ToggleServiceEvent
} from './models/location-types.model';
import {ItemFilter, ModeType} from '../../shared';
import {COMMON_CONSTANTS, INITIAL_FILTER_PAYLOAD} from '../../shared/constants/common-constants';
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
    MenuModule,
    Ripple
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
  // protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  readonly #locationsService: LocationsService = inject(LocationsService);
  readonly #dialogService: DialogService = inject(DialogService);
  // readonly loadingDialogService = inject(LoadingDialogService);
  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService);

  // SIGNALS
  items = signal<LocationType[]>([]);
  locationTypesPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);
  isApplyingFilter = signal(false);
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isLoading = signal(true);

  // SUBJECTS
  private toggle$ = new Subject<LocationServiceEvent>();

  // VIEW CHILDREN
  serviceCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('serviceCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('codeCustomColumn');
  categoryCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('categoryCustomColumn');
  nameCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('nameCustomColumn');
  locationTypeServicesCustomColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('locationTypeServicesCustomColumn');
  locationTypeActionsColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('locationTypeActionsColumn');


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
          console.log(locationTypesResponse, 'locationTypesResponse');
        } else {
          this.handleEmptyState();
        }
      }),
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
      {field: 'services', alias: 'availableServices', template: this.serviceCustomColumn()},
      {field: 'availability', template: this.locationTypeServicesCustomColumn()},
      {field: '', template: this.locationTypeActionsColumn()},
    ]
  }

  onFilterValueChanges(filterValues: HubFilters): void {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({...filterValues, page: 0});
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
    console.log(this.locationTypesPayload(), 'UPDATED PAYLOAD');
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
    console.log(locationTypeData, 'INSIDE MAIN TABLE')
    this.#dialogService.open(CreateLocationTypeDialogComponent, {
      header: this.#translateService.instant(mode === MODE.ADD ? 'createNewType' : 'editType'),
      width: '580px',
      modal: true,
      closable: true,
      data: {
        mode,
        ...(locationTypeData as LocationType && { locationTypeData})
      }
    });
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
        label: 'delete',
        command: () => {
          // TODO:: APPLY DELETE FUNCTION HERE..
          console.log('DELETE');
        },
        alias: 'delete'
      }
    ];
  }
}
