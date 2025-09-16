import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GenericTableCacheService {
  selectedItemsCounter = signal(0);
  totalAvailableItems = signal(3400);

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
}
