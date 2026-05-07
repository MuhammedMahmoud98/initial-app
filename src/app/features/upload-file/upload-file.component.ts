import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
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
import { DiscardUploadResponse, SaveUploadResponse, TemplateError } from './models/upload-file.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Message } from 'primeng/message';



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
    TextWithBgColorComponent,
    CustomStatusComponent,
    CopyToClipboardComponent,
    TranslatePipe,
    Message

  ],
  providers: [],
  standalone: true,
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFileComponent {
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
  isTemplateFileHasErrors = signal(false);
  templateErrors = signal<TemplateError[]>([]);


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

    // Reset errors
    this.templateErrors.set([]);
    this.isTemplateFileHasErrors.set(false);

    this.#locationsUploadService.uploadLocations(file).pipe(
      tap(() => {
        this.isUploading = false;
        this.fileUploaded = true;
        this.uploadProgress = 100;
        this.getCreatedLocations();
      }),
      catchError((err) => {
        this.isUploading = false;
        this.fileUploaded = false;
        this.cancelUpload();
        this.reUpload.set(true);

        const newErrors: string[] = [];

        // Validation errors from backend
        if (err.error?.type === 'validation' && Array.isArray(err.error.message)) {
          newErrors.push(...err.error.message);
        }
        // Normal errors array
        else if (Array.isArray(err?.error?.errors)) {
          newErrors.push(...err.error.errors);
        }
        // Fallback message
        else {
          const fallback =
            err?.error?.errors?.[0]?.message ||
            err?.error?.errors?.[0] ||
            err?.error?.message?.[0]?.source?.message ||
            err?.error?.message ||
            'Upload failed. Please try again.';
          newErrors.push(fallback);
        }

        //  Add first 10 backend errors
        newErrors.slice(0, 10).forEach(msg => this.showError(msg));

        //  If backend has more than 10 errors → push translated limit-message
        if (newErrors.length > 10) {
          this.showError('errorLimitMessage'); // translation happens inside showError()
        }

        this.cdr.detectChanges();
      return EMPTY;
    })).subscribe();
  }





  private resetErrorVisibility() {
    // Reset errors
    this.templateErrors.set([]);
    this.isTemplateFileHasErrors.set(false);
  }

  private isValidExtension(fileName: string): boolean {
    return ['.xls', '.xlsx'].some(ext => fileName.toLowerCase().endsWith(ext));
  }

  private showError(key: string) {
    const message = this.#translateService.instant(key);
    const existing = this.templateErrors().find(e => e.message === message);

    if (existing) {
      existing.isVisible = true;
      this.templateErrors.set([...this.templateErrors()]);
    } else {
      this.templateErrors.set([
        ...this.templateErrors(),
        { message, isVisible: true }
      ]);
    }

    this.isTemplateFileHasErrors.set(true);
  }

  removeError(errorIndex: number) {
    setTimeout(() => {
      this.templateErrors().splice(errorIndex, 1);
    }, 100);
  }

  onFileSelect(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (!file) return;

    this.resetErrorVisibility();

    const errors = [
      { condition: !this.isValidExtension(file.name), key: 'excelFileExtension' },
      { condition: file.size > 5 * 1024 * 1024, key: 'fileSizeExceedMsg' }
    ];

    let hasError = false;

    errors.forEach(err => {
      if (err.condition) {
        this.showError(err.key);
        hasError = true;
      }
    });

    if (hasError) {
      this.cancelUpload();
      this.reUpload.set(true);

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


  getCreatedLocations(): void {
    this.isUploadedScreen.set(true);
    this.#locationsUploadService.getCreatedLocationsByFileID(this.locationsPayload()).pipe(
      tap((createdLocations: CreatedLocationResponse) => {
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
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload({ ...filterValues, page: 0 });
    this.getCreatedLocations();
  }

  onPageChange(currentPage: number) {
    this.updateFilterPayload({ page: currentPage } as ItemFilter);
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

  saveUpload() {
    this.#locationsUploadService.saveUpload().subscribe({
      next: (res: SaveUploadResponse) => {
        this.#messageService.add({ severity: 'success', summary: 'Success', detail: this.#translateService.instant(res.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
        this.isUploadedScreen.set(false);
        this.cancelUpload();
        this.userActionTaken = true;

        this.router.navigate(['/created-locations']);
      },
      error: (err: HttpErrorResponse) => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: this.#translateService.instant(err.error.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
      },
    });
  }

  discardUpload() {
    // this.fileUploadId = localStorage.getItem('fileUploadId');
    this.#locationsUploadService.discardUpload().subscribe({
      next: (res: DiscardUploadResponse) => {
        this.#messageService.add({ severity: 'success', summary: 'Success', detail: this.#translateService.instant(res.message), life: COMMON_CONSTANTS.TOASTER_LIFE_TIME });
        this.isUploadedScreen.set(false);
        this.cancelUpload();
        this.userActionTaken = true;

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
    this.router.navigate(['/created-locations']);
  }
}
