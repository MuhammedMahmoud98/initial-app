import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GenericTableCacheService {
  selectedItemsCounter = signal(0);
  totalAvailableItems = signal(3400);
  unSelectedItemsCache = signal<number[]>([]);

  // CHECK IF USER SELECT ALL RECORDS IN DB
  isSelectingBulkAction = signal(false);


  resetSelectedItems(): void {
    this.selectedItemsCounter.set(0);
  }

  handleSelectedItemsCounter(selectedItemsLength: number, pageTotalRecordsLength: number): void {
    if (this.isSelectingBulkAction()) {
      const recordsEquation: number = this.totalAvailableItems() - (pageTotalRecordsLength - selectedItemsLength);
      return this.selectedItemsCounter.set(recordsEquation);
    }

    return this.selectedItemsCounter.set(selectedItemsLength);
  }

  updateUnSelected(items: { id: number }[], selectedIds: number[]) {
    const itemIds = items.map(item => item.id);

    // normal case: add unselected ids
    const selectedSet = new Set(selectedIds);

    const unselected: number[] = itemIds.filter(id => !selectedSet.has(id));

    const isReselectedIds =   unselected.length === 0 && this.unSelectedItemsCache().some(id => selectedIds.includes(id));
    if (isReselectedIds) {
      // remove re-selected ids from cache
      const filtered = this.unSelectedItemsCache().filter(
        id => !selectedIds.includes(id)
      );
      this.unSelectedItemsCache.set(filtered);
      return;
    }

    const merged = new Set([...this.unSelectedItemsCache(), ...unselected]);
    this.unSelectedItemsCache.set([...merged]);
  }

  clearUnSelectedCache(): void {
    this.unSelectedItemsCache.set([]);
  }
}
