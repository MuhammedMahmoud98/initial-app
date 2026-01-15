import {ChangeDetectionStrategy, Component} from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-error-message-template',
  imports: [],
  standalone: true,
  templateUrl: './error-message-template.component.html',
  styleUrl: './error-message-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ErrorMessageTemplateComponent {
    constructor(public dialogConfig: DynamicDialogConfig) {
    }
}
