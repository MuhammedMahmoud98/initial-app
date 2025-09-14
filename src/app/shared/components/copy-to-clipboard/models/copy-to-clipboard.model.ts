import {InputSignal} from '@angular/core';

export interface CopyToClipboardInterface {
  textToBeCopied: InputSignal<string>;
  copyToClipboard: () => void;
}
