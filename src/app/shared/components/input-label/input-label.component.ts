import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {Tooltip} from 'primeng/tooltip';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-input-label',
  imports: [
    Tooltip,
    TranslatePipe
  ],
  standalone: true,
  templateUrl: './input-label.component.html',
  styleUrl: './input-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputLabelComponent {
  // SIGNAL INPUTS
  label = input.required<string>();
  labelTooltip = input<string>('');
  helperText = input<string>('');
  isRequired = input<boolean>(false);
  hasError = input<boolean>(false);
}
