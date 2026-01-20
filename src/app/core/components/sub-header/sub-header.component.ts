import { ChangeDetectionStrategy, Component } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-sub-header',
  imports: [
    TranslatePipe,
  ],
  standalone: true,
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubHeaderComponent {

}
