import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {GenericTableCacheService} from '../../services';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-table-action-bulk',
  imports: [
    TranslatePipe
  ],
  standalone: true,
  templateUrl: './table-action-bulk.component.html',
  styleUrl: './table-action-bulk.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableActionBulkComponent {
  // INJECTIONS
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);

  // INPUTS
  showBulkSelection = input(false);

  applyHugeBulkSelection(): void {
    this.genericTableCacheService.isSelectingBulkAction.set(!this.genericTableCacheService.isSelectingBulkAction());

    if (!this.genericTableCacheService.isSelectingBulkAction()) {
      this.genericTableCacheService.clearUnSelectedCache();
      this.genericTableCacheService.selectedRecordsCache.set([]);
    }
  }
}
