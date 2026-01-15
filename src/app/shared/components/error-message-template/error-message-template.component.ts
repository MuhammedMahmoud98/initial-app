import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-error-message-template',
  imports: [],
  standalone: true,
  templateUrl: './error-message-template.component.html',
  styleUrl: './error-message-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ErrorMessageTemplateComponent {
  // readonly #dialogRef: DynamicDialogRef = inject(DynamicDialogRef);
  // readonly #dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
    // constructor(public dialogConfig: DynamicDialogConfig) {
    // }
}
