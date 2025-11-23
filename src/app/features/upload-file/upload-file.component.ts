import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { LocationsUploadService } from './services/locations-upload.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { COMMON_CONSTANTS, INITIAL_FILTER_PAYLOAD } from '../../shared/constants/common-constants';
import { GenericTableComponent } from '../../shared/components/generic-table/generic-table.component';
import { ComponentStateComponent } from '../../shared/components/component-state/component-state.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { TitleWithIconComponent } from '../../shared/components/title-with-icon/title-with-icon.component';
import { HubFiltersComponent } from '../../shared/components/hub-filters/hub-filters.component';
import { GenericTableCacheService } from '../../shared/services';
import { CreatedLocation, CreatedLocationColumnType, CreatedLocationResponse } from '../created-locations/models/created-location.model';
import { ItemFilter, TableColumn } from '../../shared';
import { genericCasting } from '../../shared/helpers/helpers';
import { HubFilters } from '../../shared/components/hub-filters/models/hub-filters.model';
import { catchError, EMPTY, Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TextWithBgColorComponent } from '../../shared/components/text-with-bg-color/text-with-bg-color.component';
import { CustomStatusComponent } from '../../shared/components/custom-status/custom-status.component';
import { CopyToClipboardComponent } from '../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import { Router } from '@angular/router';
import { CanLeaveUploadPage } from '../../core/guards/upload-leave.guard';
import { DiscardUploadResponse, SaveUploadResponse, UploadLocationsResponse } from './models/upload-file.model';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-upload-file',
  imports: [
    ButtonModule,
    FileUploadModule,
    ProgressBarModule,
    CommonModule,
    GenericTableComponent,
    ComponentStateComponent,
    SkeletonLoaderComponent,
    TitleWithIconComponent,
    HubFiltersComponent,
    TextWithBgColorComponent,
    CustomStatusComponent,
    CopyToClipboardComponent,
    TranslatePipe,

  ],
  providers: [],
  standalone: true,
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFileComponent implements OnInit, CanLeaveUploadPage {
  readonly #locationsUploadService: LocationsUploadService = inject(LocationsUploadService);
  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  private router = inject(Router);

  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  columns: WritableSignal<TableColumn<CreatedLocation>[]> = signal([]);

  selectedItemsCounter = signal(0);
  items = signal<CreatedLocation[]>([]);
  locationsPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);

  // SIGNAL STATES
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isApplyingFilter = signal(false);
  isLoading = signal(true);
  isUploadedScreen = signal(false);
  reUpload = signal(false);


  // VIEW CHILDREN
  qrStatusCustomColumn = viewChild<TemplateRef<{ $implicit: CreatedLocation }>>('qrStatusCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{ $implicit: CreatedLocation }>>('codeCustomColumn');
  districtCustomColumn = viewChild<TemplateRef<{ $implicit: CreatedLocation }>>('districtCustomColumn');
  locationTypeCustomColumn = viewChild<TemplateRef<{ $implicit: CreatedLocation }>>('locationTypeCustomColumn');
  buildingCustomColumn = viewChild<TemplateRef<{ $implicit: CreatedLocation }>>('buildingCustomColumn');

  // CASTING
  protected readonly genericCasting = genericCasting<CreatedLocation>;
  fileUploadId!: string;


  createTableColumns(): CreatedLocationColumnType[] {
    return [
      { field: 'district', template: this.districtCustomColumn() },
      { field: 'category' },
      { field: 'building', template: this.buildingCustomColumn() },
      { field: 'floor' },
      { field: 'zone' },
      { field: 'serial' },
      { field: 'type', alias: 'locationTypeCode', template: this.locationTypeCustomColumn() },
      { field: 'code', alias: 'locationCode', template: this.codeCustomColumn(), columnWidth: '15%' },
      { field: '', template: this.qrStatusCustomColumn(), columnWidth: '15%' },
    ]
  }

  uploadProgress = 0;
  isUploading = false;
  fileName = '';
  fileUploaded = false;
  previewLoaded = false;
  userActionTaken = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const discarded = localStorage.getItem('discardOnReload');
    if (discarded) {
      const { uploadId } = JSON.parse(discarded);
      this.fileUploadId = uploadId;
      localStorage.removeItem('discardOnReload');
      this.discardUpload(); // call your real discard() logic here
    }
  }

  confirmLeavePage(): Observable<boolean> | boolean {
    if (!this.previewLoaded || this.userActionTaken) return true;
    return new Observable<boolean>(() => {
      this.confirmationService.confirm({
        header: this.#translateService.instant('unsavedChangesTitle'),
        message: this.#translateService.instant('unsavedChangesMessage'),
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
          this.discardUpload();
        }
      });
    });
  }




  downloadTemplate() {
    this.#locationsUploadService.downloadTemplate().subscribe({

      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'location_template.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.#messageService.add({ severity: 'success', summary: 'Success', detail: this.#translateService.instant(err.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
      },
    });
  }


  uploadFile(file: File) {
    this.isUploading = true;
    this.uploadProgress = 0;

    this.#locationsUploadService.uploadLocations(file).subscribe({
      next: (res: UploadLocationsResponse) => {
        this.isUploading = false;
        this.fileUploaded = true;
        this.uploadProgress = 100;

        this.#messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.#translateService.instant('Bulk upload completed successfully!'),
          life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
        });
        this.fileUploadId = res.uploadId;
        // localStorage.setItem('fileUploadId', this.fileUploadId);
        this.getCreatedLocations(res.uploadId);

        console.log('✅ Upload success:', res);
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading = false;
        this.fileUploaded = false;
        this.cancelUpload();
        if (err.error.type === 'validation' && err.error.message?.length) {
          // Show each validation error
          err.error.message.forEach((msg: string) => {
            this.#messageService.add({
              severity: 'error',
              summary: 'Validation error',
              detail: this.#translateService.instant(msg),
              life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
            });
          });
        } else {
          const errors = err?.error?.errors;
          
          if (Array.isArray(errors)) {
            const limitedErrors = errors.slice(0, 10);

            limitedErrors.forEach((message: string ,i :number ) => {
              this.#messageService.add({
                severity: 'error',
                summary: this.#translateService.instant('Error'),
                detail: this.#translateService.instant(message),
                life: COMMON_CONSTANTS.TOASTER_LIFE_TIME + i * 500,
              });
            });

            if (errors.length > 10) {
              this.#messageService.add({
                severity: 'error',
                summary: this.#translateService.instant('Error'),
                detail: this.#translateService.instant('errorLimitMessage'),
                life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
              });
            }
          } else {
            this.#messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.#translateService.instant(
                err?.error?.errors?.[0]?.message ||
                err?.error?.errors?.[0] ||
                err?.error?.message?.[0]?.source?.message ||
                err?.error?.message ||
                'Upload failed. Please try again.'
              ),
              life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
            });
          }
        }
        this.cancelUpload();
        this.reUpload.set(true);
        this.cdr.detectChanges();
      },
    });
  }

  onFileSelect(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (!file) return;

    const errors: string[] = [];

    const fileName = file.name.toLowerCase();
    const fileSize = file.size;
    const maxFileSize = 5 * 1024 * 1024;

    const validExtensions = ['.xls', '.xlsx'];
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      errors.push(this.#translateService.instant('excelFileExtension'));
    }

    if (fileSize > maxFileSize) {
      errors.push(this.#translateService.instant('fileSizeExceedMsg'));
    }

    if (errors.length > 0) {
      errors.forEach(err => {
        this.#messageService.add({
          severity: 'error',
          summary: this.#translateService.instant('Error'),
          detail: err,
          life: COMMON_CONSTANTS.TOASTER_LIFE_TIME,
        });
      });

      this.cancelUpload();
      return;
    }

    this.fileName = file.name;
    this.previewLoaded = false;
    this.userActionTaken = false;
    this.uploadFile(file);
  }




  cancelUpload() {
    this.isUploading = false;
    this.uploadProgress = 0;
    this.fileName = '';
    this.fileUploaded = false;
    this.cdr.detectChanges();
  }


  getCreatedLocations(fileID: string): void {
    this.isUploadedScreen.set(true);
    this.#locationsUploadService.getCreatedLocationsByFileID(this.locationsPayload(), fileID).pipe(
      tap((createdLocations: CreatedLocationResponse) => {
        console.log(createdLocations, 'CREATED LOCATIONS FROM API');
        this.isLoading.set(false);
        if (createdLocations) {
          this.genericTableCacheService.totalAvailableItems.set(createdLocations.totalElements);
          this.genericTableCacheService.hasMorePages.set(createdLocations.totalPages > 1);
          this.items.set(createdLocations.content);
          this.isEmptyState.set(false);
          this.isErrorState.set(false);
          this.previewLoaded = true;
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
    this.locationsPayload.update((current) => ({ ...current, ...newFilters }));
    console.log(this.locationsPayload(), 'UPDATED PAYLOAD');
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({ ...filterValues, page: 0 });
    this.getCreatedLocations(this.fileUploadId);
  }

  onPageChange(currentPage: number) {
    console.log(currentPage, 'CURRENT PAGE FROM CREATED LOCATIONS');
    this.updateFilterPayload({ page: currentPage } as ItemFilter);
    this.getCreatedLocations(this.fileUploadId);
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

  saveUpload() {
    this.#locationsUploadService.saveUpload(this.fileUploadId).subscribe({
      next: (res: SaveUploadResponse) => {
        this.#messageService.add({ severity: 'success', summary: 'Success', detail: this.#translateService.instant(res.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
        this.isUploadedScreen.set(false);
        this.cancelUpload();
        this.userActionTaken = true;
        localStorage.removeItem('discardOnReload');

        this.router.navigate(['/created-locations']);
      },
      error: (err: HttpErrorResponse) => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: this.#translateService.instant(err.error.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
      },
    });
  }

  discardUpload() {
    // this.fileUploadId = localStorage.getItem('fileUploadId');
    this.#locationsUploadService.discardUpload(this.fileUploadId).subscribe({
      next: (res: DiscardUploadResponse) => {
        this.#messageService.add({ severity: 'success', summary: 'Success', detail: this.#translateService.instant(res.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
        this.isUploadedScreen.set(false);
        this.cancelUpload();
        this.userActionTaken = true;
        localStorage.removeItem('discardOnReload');

        this.router.navigate(['/created-locations']);
      },
      error: (err: HttpErrorResponse) => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: this.#translateService.instant(err.error.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
      },
    });
  }


  backward() {
    this.isUploadedScreen.set(false);
    this.cancelUpload();
    this.userActionTaken = true;
    localStorage.removeItem('discardOnReload');
    this.router.navigate(['/created-locations']);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): string | void {
    if (this.previewLoaded && !this.userActionTaken) {
      localStorage.setItem('discardOnReload', JSON.stringify({ uploadId: this.fileUploadId }));
      event.preventDefault();
      return '';
    }
  }
}
