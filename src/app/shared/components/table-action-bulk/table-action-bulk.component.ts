import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {GenericTableCacheService} from '../../services';

@Component({
  selector: 'app-table-action-bulk',
  imports: [],
  standalone: true,
  templateUrl: './table-action-bulk.component.html',
  styleUrl: './table-action-bulk.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableActionBulkComponent {
  // INJECTIONS
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);

  applyHugeBulkSelection(): void {
    this.genericTableCacheService.isSelectingBulkAction.set(!this.genericTableCacheService.isSelectingBulkAction());

    if (!this.genericTableCacheService.isSelectingBulkAction()) {
      this.genericTableCacheService.clearUnSelectedCache();
    }
  }
}
