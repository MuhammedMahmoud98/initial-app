import {
  afterNextRender, AfterRenderRef,
  ChangeDetectionStrategy,
  Component, DestroyRef,
  inject, model, OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import {PdfMakerService} from '../../core/services';
import {COMMON_CONSTANTS, INITIAL_FILTER_PAYLOAD, mockPDFRecords} from '../../shared/constants/common-constants';
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {ItemFilter, TableColumn} from '../../shared';
import {
  CreatedLocation,
  CreatedLocationColumnType,
  CreatedLocationResponse,
  GenerateQrPayload, GenerateQrResponse
} from './models/created-location.model';
import {genericCasting} from '../../shared/helpers/helpers';
import {CustomStatusComponent} from '../../shared/components/custom-status/custom-status.component';
import {CopyToClipboardComponent} from '../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import {TableActionBulkComponent} from '../../shared/components/table-action-bulk/table-action-bulk.component';
import {Button} from 'primeng/button';
import {GenericTableCacheService} from '../../shared/services';
import {HubFiltersComponent} from '../../shared/components/hub-filters/hub-filters.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {HubFilters} from '../../shared/components/hub-filters/models/hub-filters.model';
import {DialogService} from 'primeng/dynamicdialog';
import {LoadingDialogComponent} from '../../shared/dialogs/loading-dialog/loading-dialog.component';
import {LoadingDialogService} from '../../shared/services/loading-dialog.service';
import {catchError, EMPTY, Observable, tap} from 'rxjs';
import {LocationsService} from './services/locations.service';
import {TitleWithIconComponent} from '../../shared/components/title-with-icon/title-with-icon.component';
import {ComponentStateComponent} from '../../shared/components/component-state/component-state.component';
import {TranslateService} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Dialog} from 'primeng/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {SkeletonLoaderComponent} from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-created-locations',
  imports: [
    GenericTableComponent,
    CustomStatusComponent,
    CopyToClipboardComponent,
    TableActionBulkComponent,
    Button,
    HubFiltersComponent,
    TitleWithIconComponent,
    ComponentStateComponent,
    Dialog,
    LoadingDialogComponent,
    SkeletonLoaderComponent,
  ],
  providers: [DialogService],
  standalone: true,
  templateUrl: './created-locations.component.html',
  styleUrl: './created-locations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatedLocationsComponent implements OnDestroy {
  // INJECTIONS
  readonly #pdfMakerService: PdfMakerService = inject(PdfMakerService);
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  readonly #locationsService: LocationsService = inject(LocationsService);
  readonly #dialogService: DialogService = inject(DialogService);
  readonly loadingDialogService = inject(LoadingDialogService);
  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService)
  readonly #destroyRef: DestroyRef = inject(DestroyRef);

  // SIGNALS
  columns: WritableSignal<TableColumn<CreatedLocation>[]> = signal([]);
  selectedItemsCounter = signal(0);
  items = signal<CreatedLocation[]>([]);
  locationsPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);
  // SIGNAL STATES
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isApplyingFilter = signal(false);
  showLoadingDialog = model(false);
  loadingTitle = signal('');
  isLoading = signal(true);

  // VIEW CHILDREN
  qrStatusCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('qrStatusCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('codeCustomColumn');
  districtCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('districtCustomColumn');
  locationTypeCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('locationTypeCustomColumn');

  // CASTING
  protected readonly genericCasting = genericCasting<CreatedLocation>;

  init: AfterRenderRef = afterNextRender(() => {
    this.getCreatedLocations();
  });

  ngOnDestroy(): void {
    this.genericTableCacheService.resetCache();
  }

  createTableColumns(): CreatedLocationColumnType[] {
    return [
      {field: 'district', template: this.districtCustomColumn()},
      {field: 'category'},
      {field: 'building'},
      {field: 'floor'},
      {field: 'zone'},
      {field: 'serial'},
      {field: 'type', template: this.locationTypeCustomColumn()},
      {field: 'code', template: this.codeCustomColumn()},
      {field: '', template: this.qrStatusCustomColumn(), columnWidth: '200px'},
    ]
  }

  getCreatedLocations(): void {
    this.#locationsService.getCreatedLocations(this.locationsPayload()).pipe(
      tap((createdLocations: CreatedLocationResponse) => {
        console.log(createdLocations, 'CREATED LOCATIONS FROM API');
        this.isLoading.set(false);
        if (createdLocations) {
          this.genericTableCacheService.totalAvailableItems.set(createdLocations.totalElements);
          this.items.set(createdLocations.content);
          this.isEmptyState.set(false);
          this.isErrorState.set(false);
        } else {
          this.handleEmptyState();
        }
      }),
      takeUntilDestroyed(this.#destroyRef),
      catchError(() => {
        this.isLoading.set(false);
        this.handleErrorState();
        return EMPTY;
      }),
    ).subscribe();
  }

  updateFilterPayload(newFilters: HubFilters | ItemFilter): void {
    this.locationsPayload.update((current) => ({...current, ...newFilters}));
    console.log(this.locationsPayload(), 'UPDATED PAYLOAD');
  }

  async printMock() {
    try {
      await this.#pdfMakerService.generatePdfSingleColumn(mockPDFRecords, mockPDFRecords.length);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  onSelectedItemsChange(selectedItemsIds: number[]) {
    this.selectedItemsCounter.set(selectedItemsIds.length);
    this.genericTableCacheService.selectedItemsCache.set(selectedItemsIds);
    console.log(selectedItemsIds, 'FROM CREATED LOCATIONS');
  }

  testtt() {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      header: 'Confirmation',
      closable: false,
      closeOnEscape: true,
    })
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({...filterValues, page: 0});
    this.getCreatedLocations();
  }

  openDialog(): void {
    const dialogRef = this.#dialogService.open(LoadingDialogComponent, {
      showHeader: false,
      modal: true,
      width: '400px',
      height: '400px'
    });

    this.loadingDialogService.setProgressValue(this.loadingDialogService.progressValue() + 20);

    setTimeout(() => {
      dialogRef.close();
    }, 3000);

    dialogRef.onClose.pipe(
      tap(() => this.openToaster())
    ).subscribe();
  }

  openToaster(): void {
    this.#messageService.add({severity:'success', summary: 'Success', detail: 'Message Content', life: 30000000});
  }

  onPageChange(currentPage: number) {
    console.log(currentPage, 'CURRENT PAGE FROM CREATED LOCATIONS');
    this.updateFilterPayload({page: currentPage} as ItemFilter);
    this.getCreatedLocations();
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

  confirmQrGeneration(): void {
   this.confirmationService.confirm({
      header: this.#translateService.instant('qrConfirmMessageHeader'),
      message: this.#translateService.instant('qrConfirmMessageBody'),
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
      accept: (): void => {
        this.generateLocationsQR();
      }
    });
  }

  generateLocationsQR(): void {
    const payload = {
      all: this.genericTableCacheService.isSelectingBulkAction(),
      selectedLocationIds: this.genericTableCacheService.selectedItemsCache(),
      excludedLocationIds: this.genericTableCacheService.unSelectedItemsCache(),
      filter: this.locationsPayload().filter,
    } as GenerateQrPayload;

    this.startLoading('generating QR code...');

    this.#locationsService.generateQRCode(payload).pipe(
      tap((generateQrResponse: GenerateQrResponse): void => {
        this.stopLoading();

        this.#messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.#translateService.instant(generateQrResponse.message),
          life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
        });

        // LOAD LOCATIONS IN CASE OF NEWLY GENERATED QR CODES..
        if (generateQrResponse.message !== 'No Location Ids to Generate QR') {
          this.updateFilterPayload(INITIAL_FILTER_PAYLOAD);
          this.getCreatedLocations();
        }
      }),
      takeUntilDestroyed(this.#destroyRef),
      catchError((err): Observable<never> => {
        this.stopLoading();

        this.#messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: this.#translateService.instant(err.error.message),
          life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
        });
        return EMPTY;
      })
    ).subscribe();
  }

  deleteLocationQR(): void {
    const payload = {
      all: this.genericTableCacheService.isSelectingBulkAction(),
      selectedLocationIds: this.genericTableCacheService.selectedItemsCache(),
      excludedLocationIds: this.genericTableCacheService.unSelectedItemsCache(),
      filter: this.locationsPayload().filter,
    } as GenerateQrPayload;

    this.startLoading('deleting QR code...');

    this.#locationsService.deleteQRCode(payload).pipe(
      tap(() => {
        console.log('%cIS DELETE SUCCESS', 'color: yellow');
        this.stopLoading();

        this.#messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.#translateService.instant('location deleted successfully'),
          life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
        });

        this.updateFilterPayload(INITIAL_FILTER_PAYLOAD);
        this.getCreatedLocations();
      }),
      takeUntilDestroyed(this.#destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.stopLoading();
        const isQrCannotDeleteMessage = err?.error?.message?.[0]?.source?.message;

        if (isQrCannotDeleteMessage) {
          this.#messageService.add({
            severity: 'error',
            summary: 'Rejected',
            detail: this.#translateService.instant(err?.error?.message?.[0]?.source?.message ?? 'something went wrong'),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
          });
        } else {
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.#translateService.instant(isQrCannotDeleteMessage),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
          });

          this.updateFilterPayload(INITIAL_FILTER_PAYLOAD);
          this.getCreatedLocations();
        }
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
