import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, output, OutputEmitterRef} from '@angular/core';
import {QrSearchComponent} from '../thrift-search/qr-search.component';
import {FilterForm, HubFilters} from './models/hub-filters.model';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-hub-filters',
  imports: [
    QrSearchComponent,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './hub-filters.component.html',
  styleUrl: './hub-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubFiltersComponent {
  // VARIABLES
  form!: FormGroup<FilterForm>;
  destroyRef: DestroyRef = inject(DestroyRef);
  // OUTPUTS
  filterValues: OutputEmitterRef<HubFilters> = output<HubFilters>();

  init = effect(() => {
    this.form = new FormGroup({
      filter: new FormControl<HubFilters['filter']>('')
    } as FilterForm);

    this.listenToFormChanges();
  });

  listenToFormChanges(): void {
    this.form.valueChanges.pipe(
      tap((formValues) => {
        this.filterValues.emit(formValues as HubFilters);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
