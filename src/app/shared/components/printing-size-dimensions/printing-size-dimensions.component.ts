import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, effect,
  forwardRef,
  inject,
  signal,
  WritableSignal
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {PrintingSizeDimension} from './models/printing-size-dimensions.model';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-printing-size-dimensions',
  imports: [
    TranslatePipe
  ],
  standalone: true,
  templateUrl: './printing-size-dimensions.component.html',
  styleUrl: './printing-size-dimensions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PrintingSizeDimensionsComponent),
      multi: true,
    },
  ],
})
export class PrintingSizeDimensionsComponent implements ControlValueAccessor{
  // INJECTIONS
  readonly #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  // SIGNALS
  printingSizeOptions: WritableSignal<PrintingSizeDimension[]> = signal([
    { label: 'A4', value: 'A4', isSelected: true },
    { label: 'A5', value: 'A5', isSelected: false },
    { label: 'A6', value: 'A6', isSelected: false },
    { label: '5x5', value: '5x5', isSelected: false },
  ]);

  private _value = 'A4';
  disabled = false;

  init = effect(() => {
    this.printingSizeOptions.update(options =>
      options.map(option => ({ ...option, isSelected: option.value === this._value }))
    );
  });

  // placeholders for the callbacks which are later provided
  // by the forms API
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  // Called by the forms API to write to the view when programmatic changes from model to view are requested
  writeValue(value: string): void {
    this._value = value;
    // ensure view updates for OnPush
    this.#cdr.markForCheck();
  }

  // Called by the forms API to register a handler that should be called when something in the view has changed
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  // Called by the forms API to register a handler that should be called when the control receives a touch event
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Called by the forms API when the control status changes to or from "DISABLED"
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.#cdr.markForCheck();
  }

  // Public API: call this when the user selects/changes the category in the template
  // Templates should call this method (e.g. (click)="select(category)")
  select(value: string) {
    if (this.disabled) return;
    this._value = value;

    this.printingSizeOptions.update((options: PrintingSizeDimension[]) => {
      return options.map((option: PrintingSizeDimension) => ({
        ...option,
        isSelected: option.value === this._value,
      }));
    });

    this.onChange(this._value);
    this.onTouched();
    this.#cdr.markForCheck();
  }
}
