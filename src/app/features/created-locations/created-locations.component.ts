import {
  afterNextRender, AfterRenderRef,
  ChangeDetectionStrategy,
  Component, computed, DestroyRef,
  inject, model, OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import {LocalizationService, PdfMakerService} from '../../core/services';
import {COMMON_CONSTANTS, INITIAL_FILTER_PAYLOAD} from '../../shared/constants/common-constants';
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {ItemFilter, TableColumn} from '../../shared';
import {
  CreatedLocation,
  CreatedLocationColumnType,
  CreatedLocationResponse,
  GenerateQrPayload, GenerateQrResponse, PrintQRCodeDto, PrintQrCodeResponse, ValidateQrResponse
} from './models/created-location.model';
import {genericCasting} from '../../shared/helpers/helpers';
import {CustomStatusComponent} from '../../shared/components/custom-status/custom-status.component';
import {CopyToClipboardComponent} from '../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import {TableActionBulkComponent} from '../../shared/components/table-action-bulk/table-action-bulk.component';
import {Button} from 'primeng/button';
import {GenericTableCacheService} from '../../shared/services';
import {HubFiltersComponent} from '../../shared/components/hub-filters/hub-filters.component';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {HubFilters} from '../../shared/components/hub-filters/models/hub-filters.model';
import {DialogService} from 'primeng/dynamicdialog';
import {LoadingDialogComponent} from '../../shared/dialogs/loading-dialog/loading-dialog.component';
import {LoadingDialogService} from '../../shared/services/loading-dialog.service';
import {catchError, concatMap, EMPTY, generate, Observable, Subject, switchMap, tap} from 'rxjs';
import {LocationsService} from './services/locations.service';
import {TitleWithIconComponent} from '../../shared/components/title-with-icon/title-with-icon.component';
import {ComponentStateComponent} from '../../shared/components/component-state/component-state.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Dialog} from 'primeng/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {SkeletonLoaderComponent} from '../../shared/components/skeleton-loader/skeleton-loader.component';
import {TextWithBgColorComponent} from '../../shared/components/text-with-bg-color/text-with-bg-color.component';
import {DatePipe} from '@angular/common';
import { LocationType } from './models/location-types.model';
import { Menu } from 'primeng/menu';
import { BackendErrorResponse } from '../location-types/models/location-types.model';
import { LocationTypeActionsService } from '../location-types/services/location-type-actions.service';
import { DrawerModule } from 'primeng/drawer';
import { ViewLocationDetailsComponent } from './components/header/view-location-details.component';
import { locationTypeDetails } from '../assigned-locations/models/assigned-location.model';
import { archiveResponse, ValidateLocationTypeResponse } from '../../shared/models/create-location-type.model';
import { FormsModule } from '@angular/forms';
import { ErrorMessageTemplateComponent } from '../../shared/components/error-message-template/error-message-template.component';


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
    TextWithBgColorComponent,
    TranslatePipe,
    Menu,
    DrawerModule,
    ViewLocationDetailsComponent,
    FormsModule,
  ],
  providers: [DialogService, DatePipe, PdfMakerService],
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
  readonly loadingDialogService = inject(LoadingDialogService);
  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService)
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #localizaitionService: LocalizationService = inject(LocalizationService);
  readonly #locationTypeActionsService = inject(LocationTypeActionsService);
  readonly localizationService = inject(LocalizationService);
  readonly dialogService = inject(DialogService);
  // ref: DynamicDialogRef | undefined;

  // SIGNALS
  columns: WritableSignal<TableColumn<CreatedLocation>[]> = signal([]);
  selectedItemsCounter = signal(0);
  items = signal<CreatedLocation[]>([]);
  locationsPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);
  isValidatingQr = signal(false);
  isValidatingArchive = signal(false);
  showBulkSelection = computed(() => this.genericTableCacheService.hasMorePages());
  // SIGNAL STATES
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isApplyingFilter = signal(false);
  showLoadingDialog = model(false);
  loadingTitle = signal('');
  isLoading = signal(true);
  isViewLocationDetailsVisible = signal(false);
  locationDetails = signal<locationTypeDetails >({} as locationTypeDetails);
  isDialogVisible =signal(false);
  errorMessage = signal('');

  // VIEW CHILDREN
  qrStatusCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('qrStatusCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('codeCustomColumn');
  districtCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('districtCustomColumn');
  locationTypeCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('locationTypeCustomColumn');
  buildingCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('buildingCustomColumn');
  locationTypeActionsColumn = viewChild<TemplateRef<{$implicit: LocationType}>>('locationTypeActionsColumn');

  // CASTING
  protected readonly genericCasting = genericCasting<CreatedLocation>;
 // SUBJECTS
  private viewDetails$ = new Subject<number>();

  init: AfterRenderRef = afterNextRender(() => {
    this.getCreatedLocations();
    this.initViewDetailsListener();
  });

  ngOnDestroy(): void {
    this.genericTableCacheService.resetCache();
  }

  createTableColumns(): CreatedLocationColumnType[] {
    return [
      {field: 'district', template: this.districtCustomColumn()},
      {field: 'category'},
      {field: 'building', template: this.buildingCustomColumn()},
      {field: 'floor'},
      {field: 'zone'},
      {field: 'serial'},
      {field: 'type', alias: 'locationTypeCode', template: this.locationTypeCustomColumn()},
      {field: 'code', alias: 'locationCode', template: this.codeCustomColumn(), columnWidth: '15%'},
      {field: '', template: this.qrStatusCustomColumn(), columnWidth: '15%'},
      {field: '', template: this.locationTypeActionsColumn()},
    ]
  }

  getCreatedLocations(): void {
    this.#locationsService.getCreatedLocations(this.locationsPayload()).pipe(
        tap((createdLocations: CreatedLocationResponse) => {
          this.isLoading.set(false);
          if (createdLocations) {
          this.genericTableCacheService.totalAvailableItems.set(createdLocations.totalElements);
          this.genericTableCacheService.hasMorePages.set(createdLocations.totalPages > 1);
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
  }

  async downloadAndPrintPDF(records: PrintQRCodeDto[]) {
    try {
      await this.#pdfMakerService.generatePdfTwoColumns(records);
    } catch (error) {
      console.error('Error generating or printing PDF:', error);
    }
  }


  onSelectedItemsChange(selectedItemsIds: number[]) {
    this.selectedItemsCounter.set(selectedItemsIds.length);
    this.genericTableCacheService.selectedItemsCache.set(selectedItemsIds);
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({...filterValues, page: 0});
    this.genericTableCacheService.resetPagination$.next(true);
    this.getCreatedLocations();
  }

  onPageChange(currentPage: number) {
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
      acceptVisible: true,
      accept: (): void => {
        this.generateLocationsQR();
      },
    });
  }

  validateQRPrint(): void {
    const payload = {
      all: this.genericTableCacheService.isSelectingBulkAction(),
      selectedLocationIds: this.genericTableCacheService.selectedItemsCache(),
      excludedLocationIds: this.genericTableCacheService.unSelectedItemsCache(),
      filter: this.locationsPayload().filter,
    } as GenerateQrPayload;

    this.isValidatingQr.set(true);
    this.#locationsService.validateQRPrint(payload).pipe(
        tap((validateQrResponse: ValidateQrResponse): void => {
          this.isValidatingQr.set(false);
          this.showQrPrintWarningDialog(validateQrResponse);
        }),
        catchError(() => {
          this.isValidatingQr.set(false);
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.#translateService.instant('something went wrong'),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
          });
          return EMPTY;
        }),
        takeUntilDestroyed(this.#destroyRef),
    ).subscribe();
  }

  handleWarningMessage(message: string, type: 'header' | 'body'): string {
    if (!message) return '-';

    const splitMessage: string[] = message.split(/[،,.]\s*/);

    return (type === 'header' ? splitMessage[0] : splitMessage[1])?.trim() ?? '-';
  }

  showQrPrintWarningDialog(validateQrResponse: ValidateQrResponse): void {
    switch (validateQrResponse['validation-status']) {
      case 'NONE_HAVE_QR_CODES':
        this.confirmationService.confirm({
          header: this.handleWarningMessage(validateQrResponse.message, 'header'),
          message: this.handleWarningMessage(validateQrResponse.message, 'body'),
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
          acceptVisible: false,
        });
        break;
      case 'PARTIAL_QR_CODES':
        this.confirmationService.confirm({
          header: this.handleWarningMessage(validateQrResponse.message, 'header'),
          message: this.handleWarningMessage(validateQrResponse.message, 'body'),
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
          accept: () => {
            this.printQRCode().then();
          }
        });
        break;
      case 'ALL_HAVE_QR_CODES':
        this.printQRCode().then();
        break;
      case 'INVALID_REQUEST':
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: validateQrResponse.message,
          life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
        });
        break;
    }
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

          // LOAD LOCATIONS IN CASE OF NEWLY GENERATED QR CODES..
        const warningResponseMsg: string = this.#localizaitionService.isRTL() ? 'لا توجد معرفات موقع لإنشاء رمز الاستجابة السريعة' : 'No Location Ids to Generate QR';
          if (generateQrResponse.message !== warningResponseMsg) {
            this.#messageService.add({
              severity: 'success',
              summary: 'Success',
            detail: this.#translateService.instant(generateQrResponse.message),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
            });

            this.genericTableCacheService.resetBulkActions$.next(true);
            // this.updateFilterPayload(INITIAL_FILTER_PAYLOAD);
            this.getCreatedLocations();
          } else {
            this.#messageService.add({
              severity: 'warn',
              summary: 'Warn',
            detail: this.#translateService.instant(generateQrResponse.message),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
            });
          }
        }),
        takeUntilDestroyed(this.#destroyRef),
        catchError((err): Observable<never> => {
          this.stopLoading();

          this.#messageService.add({
            severity: 'error',
            summary: 'Rejected',
          detail: this.#translateService.instant(err.error.message ?? 'something went wrong'),
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
          this.stopLoading();
          this.genericTableCacheService.resetBulkActions$.next(true);
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
              severity: 'warn',
              summary: 'Warn',
            detail: this.#translateService.instant(isQrCannotDeleteMessage ?? 'something went wrong'),
              life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
            });
          } else {
            this.genericTableCacheService.resetBulkActions$.next(true);
            this.#messageService.add({
              severity: 'error',
              summary: 'Error',
            detail: this.#translateService.instant(isQrCannotDeleteMessage ?? 'something went wrong'),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
            });

            // this.updateFilterPayload(INITIAL_FILTER_PAYLOAD);
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

  async printQRCode(): Promise<void> {
    const payload = {
      all: this.genericTableCacheService.isSelectingBulkAction(),
      selectedLocationIds: this.genericTableCacheService.selectedItemsCache(),
      excludedLocationIds: this.genericTableCacheService.unSelectedItemsCache(),
      filter: this.locationsPayload().filter,
    } as GenerateQrPayload;

    const queryParams = {
      page: 0,
      size: 200,
    } as ItemFilter;

    this.startLoading('printing QR code...');

    this.#locationsService.printQRCode(payload, queryParams).pipe(
        switchMap((printResponse: PrintQrCodeResponse) => {
          this.downloadAndPrintPDF(printResponse.content);

          if (printResponse.totalPages > 1) {
            const totalPages: number = printResponse.totalPages;

            return generate({
              initialState: 1,
              condition: (page) => page < totalPages,
              iterate: (page) => page + 1,
            }).pipe(
            concatMap((page: number): Observable<PrintQrCodeResponse> => this.#locationsService.printQRCode(payload , {...queryParams, page}).pipe(
                      tap((nestedPrintResponse) => {
                        this.downloadAndPrintPDF(nestedPrintResponse.content);
                        if (page === totalPages - 1) {
                          this.stopLoading();
                        }
                      }),
                      takeUntilDestroyed(this.#destroyRef),
            ))
          )
          }

          this.stopLoading();
          return EMPTY;
        }),
        catchError((err: HttpErrorResponse) => {
        const hasNonGeneratedQRMsg = err?.error?.message?.[0]?.source?.message;

          if (hasNonGeneratedQRMsg) {
            this.#messageService.add({
              severity: 'warn',
              summary: 'Warn',
              detail: this.#translateService.instant(hasNonGeneratedQRMsg),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
            });
          } else {
            this.#messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.#translateService.instant('something went wrong'),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME
            });
          }

          this.stopLoading();
          return EMPTY;
      })
    ).subscribe();
  }

  locationTypeActions(row: CreatedLocation): MenuItem[] {
    return [
      {
        label: 'archive',
        command: () => {
          this.openArchiveConfirmDialog(row.id);
        },
        alias: 'archive',
      },
    ];
  }

  openArchiveConfirmDialog(locationTypeId: number): void {
    const payload = {
      all: false,
      selectedLocationIds: [locationTypeId],
      excludedLocationIds: [0],
      filter: '',
    };
    this.startLoading('validating archive...');
    this.#locationTypeActionsService
      .validateArchiveLocation(payload)
      .pipe(
        tap((res:ValidateLocationTypeResponse) => {
          this.stopLoading();
          if(res.isValid){
            setTimeout(() => {
              this.confirmationService.confirm({
                header: this.#translateService.instant('archiveWarning'),
                message: this.#translateService.instant(
                  'archivelocationConfirmationMessage',
                ),
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
                  this.archiveLocation(locationTypeId);
                },
            });
           }, 1500);
          } else {
            const dialogRef = this.dialogService.open(ErrorMessageTemplateComponent, {
              header:  '',
              width: '580px',
              modal: true,
              closable: false,
              data: {
                message: res.message
              }
            });
            dialogRef.onClose.pipe(
                takeUntilDestroyed(this.#destroyRef),
              ).subscribe()
            // this.isDialogVisible.set(true)
            // this.errorMessage.set(res.message  || this.#translateService.instant ('something went wrong'))

            // this.#messageService.add({
            //   severity: 'warn',
            //   detail:this.#translateService.instant(res.message || 'something went wrong'),
            // });
          }
      }),
      catchError((e) => {
        this.isValidatingArchive.set(false);
        this.stopLoading();
        this.#messageService.add({
          severity: 'error',
          detail: this.getBackendErrorMessage(e.error),
        });

        return EMPTY;
      }),
      takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  openArchiveLocationsConfirmDialog(): void {
    const payload = {
      all: this.genericTableCacheService.isSelectingBulkAction(),
      selectedLocationIds: this.genericTableCacheService.selectedItemsCache(),
      excludedLocationIds: this.genericTableCacheService.unSelectedItemsCache(),
      filter: this.locationsPayload().filter,
    } as GenerateQrPayload;
    this.isValidatingArchive.set(true);

    this.#locationTypeActionsService
      .validateArchiveLocation(payload)
      .pipe(
        tap((res:ValidateLocationTypeResponse) => {
          this.isValidatingArchive.set(false);
          if(res.isValid){
              this.confirmationService.confirm({
                header: this.#translateService.instant('archiveWarning'),
                message: this.#translateService.instant(
                  'archivelocationConfirmationMessage',
                ),
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
                  this.archiveLocations();
                },
            });
          } else {
              const dialogRef = this.dialogService.open(ErrorMessageTemplateComponent, {
                header:  '',
                width: '580px',
                modal: true,
                closable: false,
                data: {
                  message: res.message
                }
              });
              dialogRef.onClose.pipe(
                takeUntilDestroyed(this.#destroyRef),
              ).subscribe()
            //  this.#messageService.add({
            //   severity: 'warn',
            //   detail:this.#translateService.instant(res.message || 'something went wrong'),
            // });
          }
        }),
        catchError((e) => {
          this.isValidatingArchive.set(false);
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:this.getBackendErrorMessage(e.error),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
          });
          return EMPTY;
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe({
        complete: () =>    this.isLoading.set(false)
      });
  }

  archiveLocations(): void {
    const payload = {
      all: this.genericTableCacheService.isSelectingBulkAction(),
      selectedLocationIds: this.genericTableCacheService.selectedItemsCache(),
      excludedLocationIds: this.genericTableCacheService.unSelectedItemsCache(),
      filter: this.locationsPayload().filter,
    } as GenerateQrPayload;
    // this.isLoading.set(true)
    this.#locationTypeActionsService
      .archiveLocation(payload)
      .pipe(
        tap((archiveResponse: archiveResponse): void => {
          this.isLoading.set(false);
          this.resetEmptyStateAfterArchive(payload);
          this.genericTableCacheService.resetBulkActions$.next(true);
          this.genericTableCacheService.resetBulkActions()
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: archiveResponse.message?.toLowerCase(),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
          });
          this.getCreatedLocations();
        }),
        catchError(() => {
          this.isLoading.set(false)
          this.genericTableCacheService.resetBulkActions$.next(true);
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.#translateService.instant('something went wrong'),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
          });
          return EMPTY;
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  archiveLocation(locationTypeId: number): void {
    this.#locationTypeActionsService
      .archiveLocation({
        all: false,
        selectedLocationIds: [locationTypeId],
        excludedLocationIds: [0],
        filter: '',
      })
      .pipe(
        tap((res:archiveResponse) => {
          this.isLoading.set(false)
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.#translateService.instant(
             res.message,
            ),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
          });

          if(this.genericTableCacheService.selectedItemsCounter()>0){
            this.genericTableCacheService.selectedItemsCache.update(items =>
              items.filter(item => item !== locationTypeId)
            );
            this.selectedItemsCounter.set(this.genericTableCacheService.selectedItemsCache().length)
            this.genericTableCacheService.selectedItemsCounter.set(this.genericTableCacheService.selectedItemsCache().length)
          }
          this.getCreatedLocations();
        }),
        catchError((e) => {
          this.isLoading.set(false)
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.getBackendErrorMessage(e.error),
            life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
          });
          return EMPTY;
        }),
      )
      .subscribe();
  }

  private getBackendErrorMessage(error: BackendErrorResponse): string {
    return (
      error?.message?.[0]?.source?.message ||
      this.#translateService.instant('something went wrong')
    );
  }

  onRowClick(row: CreatedLocation): void {
    this.viewDetails$.next(row.id);
  }


  viewDetails(locationTypeId: number): void {
    this.#locationsService.locationTypeDetails(locationTypeId).pipe(
      tap((locationDetails: locationTypeDetails) => {
        this.locationDetails.set(locationDetails);
         this.isViewLocationDetailsVisible.set(true);
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe();
  }

 private initViewDetailsListener(): void {
  this.viewDetails$
    .pipe(
      switchMap((locationId) =>
        this.#locationsService.locationTypeDetails(locationId)
      ),
      tap((locationDetails) => {
        this.locationDetails.set(locationDetails);
        this.isViewLocationDetailsVisible.set(true);
      }),
      takeUntilDestroyed(this.#destroyRef),
    )
    .subscribe();
 }

  private resetEmptyStateAfterArchive(payload: GenerateQrPayload): void {
    if (payload.all) {
      this.genericTableCacheService.selectedItemsCache.set([]);
      this.selectedItemsCounter.set(0);
      this.genericTableCacheService.selectedItemsCounter.set(0);
      this.isApplyingFilter.set(false);
      this.isEmptyState.set(true);
    }
  }
}
