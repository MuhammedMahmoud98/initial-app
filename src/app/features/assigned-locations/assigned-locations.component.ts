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
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {GenericTableCacheService} from '../../shared/services';
import {LocationsService} from '../created-locations/services/locations.service';
import {DialogService} from 'primeng/dynamicdialog';
import {HubFilters} from '../../shared/components/hub-filters/models/hub-filters.model';

import {ItemFilter} from '../../shared';
import {
  catchError,
  EMPTY,

  tap
} from 'rxjs';
import {genericCasting} from '../../shared/helpers/helpers';

import {ComponentStateComponent} from '../../shared/components/component-state/component-state.component';
import {SkeletonLoaderComponent} from '../../shared/components/skeleton-loader/skeleton-loader.component';
import {
  AssignedLocationColumnType,
  AssignedLocationType,
  AssignedLocationTypesResponse,
  LinkAssignedLocation
} from './models/assigned-location.model';
import { TitleWithIconComponent } from '../../shared/components/title-with-icon/title-with-icon.component';
import { INITIAL_FILTER_PAYLOAD } from '../../shared/constants/common-constants';
import { HubFiltersComponent } from '../../shared/components/hub-filters/hub-filters.component';
import { CopyToClipboardComponent } from '../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TimezoneDatePipe } from '../../shared/pipes/timezone-date.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-assigned-qr',
  imports: [
    GenericTableComponent,
    ComponentStateComponent,
    SkeletonLoaderComponent,
    TitleWithIconComponent,
    HubFiltersComponent,
    CopyToClipboardComponent,
    TranslatePipe,
    TimezoneDatePipe,
    CommonModule

  ],
  providers: [DialogService, TimezoneDatePipe],
  standalone: true,
  templateUrl: './assigned-locations.component.html',
  styleUrl: './assigned-locations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignedLocationsComponent implements OnDestroy {
  // INJECTIONS
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  readonly #locationsService: LocationsService = inject(LocationsService);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);

  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService);

  // SIGNALS
  items = signal<AssignedLocationType[]>([]);
  locationTypesPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);
  isApplyingFilter = signal(false);
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isLoading = signal(true);


  // VIEW CHILDREN
  emailCustomColumn = viewChild<TemplateRef<{ $implicit: AssignedLocationType }>>('emailCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{ $implicit: AssignedLocationType }>>('codeCustomColumn');
  unlinkCustomColumn = viewChild<TemplateRef<{ $implicit: AssignedLocationType }>>('unlinkCustomColumn');
  nameCustomColumn = viewChild<TemplateRef<{ $implicit: AssignedLocationType }>>('nameCustomColumn');
  assignedLocationLinkAction = viewChild<TemplateRef<{ $implicit: AssignedLocationType }>>('assignedLocationLinkAction');


  protected readonly genericCasting = genericCasting<AssignedLocationType>;

  init: AfterRenderRef = afterNextRender(() => {
    this.getAssignedLocationTypes();
  });


  ngOnDestroy(): void {
    this.genericTableCacheService.resetCache();
  }

  getAssignedLocationTypes(): void {
    this.#locationsService.getAssignedLocation(this.locationTypesPayload()).pipe(
      tap((locationTypesResponse: AssignedLocationTypesResponse) => {
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


  createTableColumns(): AssignedLocationColumnType[] {
    return [
      { field: '', alias: 'Employee Name', template: this.nameCustomColumn()},
      { field: '', alias: 'Employee Email', template: this.emailCustomColumn() },
      { field: '', alias: 'Location Code', template: this.codeCustomColumn()},
      { field: '', alias: 'Date of Linking', template: this.unlinkCustomColumn()},
      { field: '', template: this.assignedLocationLinkAction()},
    ]
  }


  onPageChange(currentPage: number) {
    this.updateFilterPayload({page: currentPage} as ItemFilter);
    this.getAssignedLocationTypes();
  }


  updateFilterPayload(newFilters: HubFilters | ItemFilter): void {
    this.locationTypesPayload.update((current) => ({...current, ...newFilters}));
    console.log(this.locationTypesPayload(), 'UPDATED PAYLOAD');
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({ ...filterValues, page: 0 });
    this.getAssignedLocationTypes();
  }


  openUnlinkAssignedLocationDialog(assignedLocationId: number): void {
      this.confirmationService.confirm({
        header: this.#translateService.instant('unlinkConfirmMessageHeader'),
        message: this.#translateService.instant('unlinkConfirmMessageBody'),
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
          this.unLinkAssignedLocation(assignedLocationId);
        }
      });
  }

  unLinkAssignedLocation(assignedLocationId: number): void {
    this.#locationsService.unLinkAssignedLocation(assignedLocationId).pipe(
      tap((res: LinkAssignedLocation) => {
        this.#messageService.add({ severity: 'success', summary: 'Success', detail: res?.message , life: 3000});
        this.getAssignedLocationTypes();
      }),
      catchError((e) => {
        this.#messageService.add({severity:'error', summary: 'Error', detail: e.error.message[0].source.message , life: 3000});
        return EMPTY;
      })
    ).subscribe();
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
