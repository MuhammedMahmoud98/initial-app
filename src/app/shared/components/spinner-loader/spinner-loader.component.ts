import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-spinner-loader',
  imports: [
    ProgressSpinner
  ],
  standalone: true,
  templateUrl: './spinner-loader.component.html',
  styleUrl: './spinner-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerLoaderComponent {

}
