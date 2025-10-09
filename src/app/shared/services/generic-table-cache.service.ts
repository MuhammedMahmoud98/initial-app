import {Injectable, signal} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericTableCacheService {
  // SIGNALS
  selectedItemsCounter = signal(0);
  totalAvailableItems = signal(0);
  hasMorePages = signal(false);
  unSelectedItemsCache = signal<number[]>([]);
  selectedItemsCache = signal<number[]>([]);
  selectedRecordsCache = signal<{id: number}[]>([]);

  // SUBJECTS
  resetBulkActions$: Subject<boolean> = new Subject<boolean>();

  // CHECK IF USER SELECT ALL RECORDS IN DB
  isSelectingBulkAction = signal(false);


  resetSelectedItems(): void {
    this.selectedItemsCounter.set(0);
  }

  resetCache(): void {
    this.selectedItemsCounter.set(0);
    this.totalAvailableItems.set(0);
    this.unSelectedItemsCache.set([]);
    this.selectedItemsCache.set([]);
    this.isSelectingBulkAction.set(false);
  }

  resetBulkActions(): void {
    this.selectedItemsCounter.set(0);
    this.unSelectedItemsCache.set([]);
    this.selectedItemsCache.set([]);
    this.selectedRecordsCache.set([]);
    this.isSelectingBulkAction.set(false);
  }

  handleSelectedItemsCounter(selectedItemsLength = 0): void {
    if (this.isSelectingBulkAction()) {
      const recordsEquation: number = this.totalAvailableItems() - this.unSelectedItemsCache().length;
      return this.selectedItemsCounter.set(recordsEquation);
    }

    return this.selectedItemsCounter.set(selectedItemsLength);
  }

  updateUnSelected(items: { id: number }[], selectedIds: number[]) {
    const itemIds = items.map(item => item.id);

    // normal case: add unselected ids
    const selectedSet = new Set(selectedIds);

    const unselected: number[] = itemIds.filter(id => !selectedSet.has(id));

    const isReselectedIds =   unselected.length === 0 || this.unSelectedItemsCache().some(id => selectedIds.includes(id));
    if (isReselectedIds) {
      // remove re-selected ids from cache
      const filtered = this.unSelectedItemsCache().filter(
        id => !selectedIds.includes(id)
      );
      this.unSelectedItemsCache.set(filtered);
      this.handleSelectedItemsCounter();
      return;
    }

    const merged = new Set([...this.unSelectedItemsCache(), ...unselected]);
    this.unSelectedItemsCache.set([...merged]);
    this.handleSelectedItemsCounter();
  }

  updateSelectedItems(currentPageItems: { id: number }[], selectedItems: { id: number }[]) {
    const updatedCache = this.selectedRecordsCache()
      // Keep items from other pages
      .filter(cached => !currentPageItems.some(pageItem => pageItem.id === cached.id))
      // Add currently selected ones
      .concat(selectedItems);

    this.selectedRecordsCache.set(updatedCache);
  }

  clearUnSelectedCache(): void {
    this.unSelectedItemsCache.set([]);
  }
}
