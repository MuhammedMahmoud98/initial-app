import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';



@Component({
  selector: 'app-upload-file',
  imports: [
    ButtonModule,
    FileUploadModule,
    ProgressBarModule,
    CommonModule
  ],
  providers: [],
  standalone: true,
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFileComponent  {

  constructor(private cdr: ChangeDetectorRef) { }

  uploadProgress = 0;
  isUploading = false;
  fileName = '';
  fileUploaded = false;
  uploadInterval: any;

  onFileSelect(event: any) {

    const file = event.files?.[0];
    if (file) {
      this.fileName = file.name;
      this.isUploading = true;
      this.startFakeUpload();
    }
  }

  startFakeUpload() {
    this.uploadProgress = 0;
    this.uploadInterval = setInterval(() => {
      if (this.uploadProgress < 100) {
        this.uploadProgress += 5;
      } else {
        clearInterval(this.uploadInterval);
        this.fileUploaded = true;
        this.isUploading = false;
      }
    }, 200);
  }

  cancelUpload() {
    clearInterval(this.uploadInterval);
    this.isUploading = false;
    this.uploadProgress = 0;
    this.fileName = '';
    this.fileUploaded = false;  
  }
}
