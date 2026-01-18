import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-error-message-template',
  imports: [],
  standalone: true,
  templateUrl: './error-message-template.component.html',
  styleUrl: './error-message-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageTemplateComponent {
  errorMessage = signal('');
  constructor(
    public dialogConfig: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
  ) {
    this.errorMessage.set(dialogConfig.data.message);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
