import { ChangeDetectionStrategy, Component } from '@angular/core';
import {QrSearchComponent} from '../thrift-search/qr-search.component';

@Component({
  selector: 'app-hub-filters',
  imports: [
    QrSearchComponent
  ],
  standalone: true,
  templateUrl: './hub-filters.component.html',
  styleUrl: './hub-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubFiltersComponent {

}
