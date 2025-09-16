import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
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
  // INPUTS
  selectedItemsCounter = input(0);
  totalAvailableItems = input(0);

  // OUTPUTS
  isApplyingBulkSelection = output<boolean>();

  // SIGNALS


  applyHugeBulkSelection(): void {
    this.genericTableCacheService.isSelectingBulkAction.set(!this.genericTableCacheService.isSelectingBulkAction());
  }
}
