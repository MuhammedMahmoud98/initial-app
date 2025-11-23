import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  signal,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import {LocationTypeCategory} from './models/location-type-category.model';
import {TranslatePipe} from '@ngx-translate/core';
import {LOCATION_TYPE_CATEGORIES} from '../../enums/shared.enum';

@Component({
  selector: 'app-location-type-category',
  imports: [CommonModule, FormsModule, TranslatePipe],
  standalone: true,
  templateUrl: './location-type-category.component.html',
  styleUrl: './location-type-category.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationTypeCategoryComponent),
      multi: true,
    },
  ],
})
export class LocationTypeCategoryComponent implements ControlValueAccessor {
  // INJECTIONS
  readonly #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  // SIGNALS
  locationTypeCategories: WritableSignal<LocationTypeCategory[]> = signal([
    {label: 'generalLocation', value: LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION, isSelected: true},
    {label: 'employeeLocation', value: LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION, isSelected: false},
  ]);

  private _value = 'General Location';
  disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this._value = value;
    // ensure view updates for OnPush
    this.#cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.#cdr.markForCheck();
  }

  select(value: string) {
    if (this.disabled) return;
    this._value = value;

    this.locationTypeCategories.update((categories: LocationTypeCategory[]) =>
      categories.map((category: LocationTypeCategory) => ({
        ...category,
        isSelected: category.value === value
      }))
    );

    console.log(this._value);
    this.onChange(this._value);
    this.onTouched();
    this.#cdr.markForCheck();
  }

  get selectedCategory(): string {
    return this._value;
  }
}
