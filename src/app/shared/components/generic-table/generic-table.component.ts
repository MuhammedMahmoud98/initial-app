import {
  ChangeDetectionStrategy,
  Component, computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  output, signal
} from '@angular/core';
import {TableHeaderCheckboxToggleEvent, TableModule, TablePageEvent} from 'primeng/table';
import {TableColumn} from '../../models';
import {NgTemplateOutlet} from '@angular/common';
import {COMMON_CONSTANTS} from '../../constants/common-constants';
import {GenericTableCacheService} from '../../services';
import {TranslatePipe} from '@ngx-translate/core';
import {tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {LocalizationService} from '../../../core/services';


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
  readonly destroyRef: DestroyRef = inject(DestroyRef);
  readonly localizationService = inject(LocalizationService);
  // INPUTS
  columns: InputSignal<TableColumn<T>[]> = input.required();
  items: InputSignal<T[]> = input.required();
  totalRecords: InputSignal<number> = input(0);
  showRecordInfo: InputSignal<boolean> = input(false);
  hasCheckBoxes: InputSignal<boolean> = input(false);
  first = signal(0);

  // COMPUTED
  currentLocale = computed(() => {
    if (this.localizationService.isRTL()) {
      return 'ar-EG'
    }

    return 'en-US'
  });

  cachedSelectionEffect = effect(() => {
    const cached = this.genericTableCacheService.selectedRecordsCache();
    const pageItems = this.items();
    this.selectedLocations = cached.filter(sel =>
      pageItems.some(item => item.id === sel.id)
    ) as T[];
  });

  // EFFECTS
  onApplyingBulkSelection = effect(() => {
    this.listenToResetBulkActionsChanges();

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
  cachedSelections: T[] = [];
  rowsCounter: number = COMMON_CONSTANTS.ROWS_PER_PAGE;
  isHeaderCheckboxChanged = false;

  // METHODS
  trackByCode(index: number, item: T) {
    return item.id;
  }

  onSelectionChange(selectedItems: T[]) {
    const selectedItemsEmitter: number[] = selectedItems.map((item: T): number => item?.id);
    console.log('%cIS HEADER CHANGED', 'color: purple', this.isHeaderCheckboxChanged);
    // console.log('%cSELECTED ITEMS PURE', 'color: yellow', selectedItemsEmitter);
    if (this.hasCheckBoxes()) {
      this.genericTableCacheService.updateSelectedItems(this.items(), selectedItems);
      console.log(this.genericTableCacheService.selectedRecordsCache() as T[], 'T[] CACHE');
      this.selectedItems.emit(this.genericTableCacheService.selectedRecordsCache().map((item) => item.id));

      if (this.genericTableCacheService.isSelectingBulkAction()) {
        this.genericTableCacheService.updateUnSelected(this.items(), selectedItemsEmitter);
        console.log(this.genericTableCacheService.unSelectedItemsCache(), 'unSelectedItemsCache');
      }

      this.genericTableCacheService.handleSelectedItemsCounter(this.genericTableCacheService.selectedRecordsCache().length);
    }
  }

  onPageChange($event: TablePageEvent) {
    const {rows, first} = $event;
    const currentPage = (first / rows);
    this.currentPage.emit(currentPage);
    console.log(this.genericTableCacheService.selectedRecordsCache() as T[], 'T[] CACHE');
  }

  listenToResetBulkActionsChanges(): void {
    this.genericTableCacheService.resetBulkActions$.pipe(
      tap((isResetBulkActions: boolean) => {
        if (isResetBulkActions) {
          this.selectedLocations = [];
          this.genericTableCacheService.resetBulkActions();
          this.first.set(0);
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  onMainCheckboxChanged($event: TableHeaderCheckboxToggleEvent) {
    this.isHeaderCheckboxChanged = $event.checked;

    this.updateCacheValues($event.checked);
    console.log($event, 'HEADER CHECKBOX');
  }

  updateCacheValues(isChecked = false): void {
    const currentPageItems = this.items();

    this.genericTableCacheService.selectedRecordsCache.update(prevSelections => {
      if (isChecked) {
        const newSelections = [...prevSelections];
        currentPageItems.forEach(item => {
          if (!newSelections.some(sel => sel.id === item.id)) {
            newSelections.push(item);
          }
        });
        return newSelections;
      } else {
        return prevSelections.filter(
          sel => !currentPageItems.some(item => item.id === sel.id)
        );
      }
    });
  }
}
