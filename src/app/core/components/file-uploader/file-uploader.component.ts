import { Component, inject, output, signal, viewChild } from '@angular/core';
import {
  FileUploadModule,
  FileSelectEvent,
  FileUpload,
} from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UploadStatus } from '../../models/upload-statues.model';
import {FileUploadService, UploadResponse} from '../../services/file-upload.service';
import { DocTemplateService } from '../../../shared/services';
import {catchError, EMPTY, finalize} from 'rxjs';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [FileUploadModule, ProgressBarModule, ButtonModule, TranslatePipe],
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent {
  readonly translateService = inject(TranslateService);
  readonly fileUploadService = inject(FileUploadService);
  readonly docTemplateService = inject(DocTemplateService);
  files = signal<File[]>([]);
  fileUpload = viewChild<FileUpload>('fileUpload');
  uploadStatus = output<UploadStatus>();
  isUplading = signal<boolean>(false);

  checkSelectedFile(file: File): void {
    const fileValidationStatus =
      this.fileUploadService.fileUploadLocalValidation(file);
    if (fileValidationStatus.isSucceded) {
      this.isUplading.set(true);
    } else {
      this.fileUpload()?.clear();
      this.uploadStatus.emit(fileValidationStatus);
    }
  }

  uploadHandler(event: { files: File[] }): void {
    const file = event.files[0];
    if (file) {
      this.isUplading.set(true);
      this.fileUploadService
        .uploadFile(file)
        .pipe(
          catchError((err) => {
            this.uploadStatus.emit({
              isSucceded: false,
              message: err?.error?.errors ?? []
            })
            return EMPTY;
          }),
          finalize(() => this.isUplading.set(false))
        )
        .subscribe({
          next: (uploadResponse: UploadResponse) => {
            this.uploadStatus.emit({
              isSucceded: true,
              message: [this.translateService.instant('uploadFileSuccessMsg')],
              rowCount: uploadResponse?.['row-count'] ?? 0,
            });
          },
        });
    }
  }

  onSelect(event: FileSelectEvent): void {
    this.files.set(event.files);
    this.checkSelectedFile(this.files()[0]);
  }

  triggerFileInput(): void {
    this.fileUpload()?.choose();
  }

  dataTemplateDownload(): void {
    this.docTemplateService.downloadDocTemplate();
  }
}
