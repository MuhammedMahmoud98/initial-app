import {ChangeDetectionStrategy, Component, effect, inject, input, InputSignal, output} from '@angular/core';
import {TableModule} from 'primeng/table';
import {TableColumn} from '../../models';
import {NgTemplateOutlet} from '@angular/common';
import {COMMON_CONSTANTS} from '../../constants/common-constants';
import {GenericTableCacheService} from '../../services';


@Component({
  selector: 'app-generic-table',
  imports: [
    TableModule,
    NgTemplateOutlet
  ],
  standalone: true,
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent<T extends {id: number}> {
  // INJECTIONS
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  // INPUTS
  columns: InputSignal<TableColumn<T>[]> = input.required();
  items: InputSignal<T[]> = input.required();
  hasCheckBoxes: InputSignal<boolean> = input(false);

  // EFFECTS
  onApplyingBulkSelection = effect(() => {
    if (this.genericTableCacheService.isSelectingBulkAction()) {
      this.selectedLocations = this.items();
      this.genericTableCacheService.selectedItemsCounter.set(this.genericTableCacheService.totalAvailableItems());
    } else {
      this.selectedLocations = [];
      this.genericTableCacheService.selectedItemsCounter.set(0);
    }
  });

  // OUTPUTS
  selectedItems = output<number[]>();

  // VARIABLES
  selectedLocations!: T[];
  rowsCounter: number = COMMON_CONSTANTS.ROWS_PER_PAGE;

  // METHODS
  trackByCode(index: number, item: T) {
    return item.id;
  }

  onSelectionChange(selectedItems: T[]) {
    const selectedItemsEmitter: number[] = selectedItems.map((item: T): number => item?.id);

    if (this.hasCheckBoxes()) {
      this.selectedItems.emit(selectedItemsEmitter);
      this.genericTableCacheService.handleSelectedItemsCounter(selectedItemsEmitter.length, this.items().length);
    }
  }
}
