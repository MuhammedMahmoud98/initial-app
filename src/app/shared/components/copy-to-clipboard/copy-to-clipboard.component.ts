import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  signal,
} from '@angular/core';
import {CopyToClipboardInterface} from './models/copy-to-clipboard.model';
import {COMMON_CONSTANTS} from '../../constants/common-constants';
import {animate, style, transition, trigger} from '@angular/animations';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-copy-to-clipboard',
  imports: [
    TranslatePipe
  ],
  standalone: true,
  templateUrl: './copy-to-clipboard.component.html',
  styleUrl: './copy-to-clipboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class CopyToClipboardComponent implements CopyToClipboardInterface {
  // INPUTS
  textToBeCopied: InputSignal<string> = input.required<string>();

  // SIGNALS
  copiedMessageSignal = signal('copied!');
  isCopiedSignal = signal(false);


  copyToClipboard(): void {
    navigator.clipboard.writeText(this.textToBeCopied()).then(() => {
      this.isCopiedSignal.set(true);

      setTimeout(() => {
        this.isCopiedSignal.set(false);
      }, COMMON_CONSTANTS.CLIPBOARD_LIFETIME);
    }).catch(() => {
      this.isCopiedSignal.set(false);
    });
  }
}
