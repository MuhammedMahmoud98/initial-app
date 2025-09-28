import {ChangeDetectionStrategy, Component, effect, inject, input, InputSignal, output} from '@angular/core';
import {TableModule, TablePageEvent} from 'primeng/table';
import {TableColumn} from '../../models';
import {NgTemplateOutlet} from '@angular/common';
import {COMMON_CONSTANTS} from '../../constants/common-constants';
import {GenericTableCacheService} from '../../services';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  selector: 'app-generic-table',
  imports: [
    TableModule,
    NgTemplateOutlet,
    TranslatePipe
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
  totalRecords: InputSignal<number> = input(0);
  hasCheckBoxes: InputSignal<boolean> = input(false);

  // EFFECTS
  onApplyingBulkSelection = effect(() => {
    if (this.genericTableCacheService.isSelectingBulkAction()) {
      this.selectedLocations = this.items().filter((item): boolean => !this.genericTableCacheService.unSelectedItemsCache().includes(item.id));
      // this.genericTableCacheService.selectedItemsCounter.set(this.genericTableCacheService.totalAvailableItems());
      this.genericTableCacheService.handleSelectedItemsCounter();
    } else {
      this.selectedLocations = [];
      this.genericTableCacheService.selectedItemsCounter.set(0);
    }
  });

  // OUTPUTS
  selectedItems = output<number[]>();
  currentPage = output<number>();

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
      if (this.genericTableCacheService.isSelectingBulkAction()) {
        this.genericTableCacheService.updateUnSelected(this.items(), selectedItemsEmitter);
        console.log(this.genericTableCacheService.unSelectedItemsCache(), 'unSelectedItemsCache');
      }

      this.genericTableCacheService.handleSelectedItemsCounter(selectedItemsEmitter.length);
    }
  }

  onPageChange($event: TablePageEvent) {
    const {rows, first} = $event;
    const currentPage = (first / rows);
    console.log(currentPage);
    this.currentPage.emit(currentPage);
  }

  onMainCheckboxChanged($event: Event) {
    console.log($event);
  }
}
