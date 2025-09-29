import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ProgressCircleComponent} from '../../components/progress-circle/progress-circle.component';
import {LoadingDialogService} from '../../services/loading-dialog.service';

@Component({
  selector: 'app-loading-dialog',
  imports: [
    FormsModule,
    ProgressCircleComponent
  ],
  standalone: true,
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingDialogComponent {
  // INJECTIONS
  readonly loadingDialogService = inject(LoadingDialogService);

  // INPUTS
  loadingTitle = input<string>('');
}
