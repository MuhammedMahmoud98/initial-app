import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { QrSearchComponent } from '../thrift-search/qr-search.component';
import { FilterForm, HubFilters } from './models/hub-filters.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hub-filters',
  standalone: true,
  imports: [QrSearchComponent, ReactiveFormsModule,CommonModule],
  templateUrl: './hub-filters.component.html',
  styleUrl: './hub-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HubFiltersComponent {
  // INPUT
  type = input<'search' | 'filter'>('filter'); // default to filter
  placeHolder = input<string>('searchPlaceholder');

  // OUTPUT
  filterValues: OutputEmitterRef<HubFilters> = output<HubFilters>();

  // VARIABLES
  form!: FormGroup<FilterForm>;
  destroyRef: DestroyRef = inject(DestroyRef);

  init = effect(() => {
    // create a form with both fields but only one will be used
    this.form = new FormGroup<FilterForm>({
      filter: new FormControl<string>(''),
      search: new FormControl<string>(''),
    });

    this.listenToFormChanges();
  });

  listenToFormChanges(): void {
    this.form.valueChanges
      .pipe(
        tap((formValues) => {
          const key = this.type();
          const value = formValues[key] ?? '';
          this.filterValues.emit({
            filter: key === 'filter' ? value : '',
            ...(key === 'search' ? { search: value } : {})
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
