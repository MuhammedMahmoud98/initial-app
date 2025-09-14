import {ChangeDetectionStrategy, Component, input, InputSignal} from '@angular/core';
import {TableModule} from 'primeng/table';
import {TableColumn} from '../../models';
import {NgTemplateOutlet} from '@angular/common';
import {CreatedLocation} from '../../../features/created-locations/models/created-location.model';


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
export class GenericTableComponent<T> {
  columns: InputSignal<TableColumn<T>[]> = input.required();
  items: InputSignal<T[]> = input.required();
  hasCheckBoxes: InputSignal<boolean> = input(false);
  selectedLocations!: T[];

  trackByCode(index: number, item: CreatedLocation) {
    return item.id; // ✅ unique, stable identifier
  }
}
