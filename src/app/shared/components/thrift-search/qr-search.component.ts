import {ChangeDetectionStrategy, Component, DestroyRef, forwardRef, inject, input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';
import {debounceTime, filter, map, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {InputText} from 'primeng/inputtext';
import {COMMON_CONSTANTS, XSS_PATTERNS} from '../../constants/common-constants';
import {TranslatePipe} from '@ngx-translate/core';
import {noScriptValidator, noSqlInjectionValidator} from '../../validators/custom-validators';

@Component({
  selector: 'app-qr-search',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    InputText,
    TranslatePipe
  ],
  standalone: true,
  templateUrl: './qr-search.component.html',
  styleUrl: './qr-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QrSearchComponent),
      multi: true,
    }
  ],
})
export class QrSearchComponent implements ControlValueAccessor, OnInit {
  searchControl: FormControl = new FormControl('', [
    Validators.maxLength(COMMON_CONSTANTS.SEARCH_MAX_LENGTH),
    noSqlInjectionValidator,
    noScriptValidator,
  ]);

  destroyed$: DestroyRef = inject(DestroyRef);
  private lastEmittedValue: string | null = '';

  placeHolder = input<string>('searchPlaceholder');
  ngOnInit(): void {
    this.handleSearchControl();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  onChange = (value: string) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = () => {};

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    this.searchControl.setValue(value, { emitEvent: false });
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  handleSearchControl(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      map(value => {
        const searchValue = value?.toString()?.trim() ?? '';
        return this.sanitizeInput(searchValue);
      }),
      filter(trimmed => {
        this.searchControl.updateValueAndValidity({ emitEvent: false });
        return this.searchControl.valid && trimmed !== this.lastEmittedValue;
      }),
      tap((searchValue: string) => {
        this.handleSearchLogic(searchValue);
      }),
      takeUntilDestroyed(this.destroyed$)
    ).subscribe();
  }

  private sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input;

    // Remove HTML tags and script content
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove potential SQL injection patterns (be careful not to be too aggressive)
    sanitized = sanitized
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();

    // Limit length as additional protection
    return sanitized.substring(0, COMMON_CONSTANTS.SEARCH_MAX_LENGTH);
  }

  resetSearch() {
    this.searchControl.setValue('', { emitEvent: true });
    this.searchControl.markAsPristine();
    this.searchControl.markAsUntouched();
    this.searchControl.updateValueAndValidity({ emitEvent: true });
    this.lastEmittedValue = null; // Reset to allow re-emitting ''
    this.handleSearchLogic(''); // Ensure event is triggered
  }

  private handleSearchLogic(searchValue: string): void {
    if (searchValue?.length >= COMMON_CONSTANTS.SEARCH_TYPING_LENGTH) {
      this.lastEmittedValue = searchValue;
      this.onChange(searchValue);
    }

    if (searchValue?.length === COMMON_CONSTANTS.SEARCH_RESET_LENGTH) {
      this.lastEmittedValue = null;
      this.onChange(searchValue);
    }
  }

  onPaste(): void {
    setTimeout(() => {
      const currentValue = this.searchControl.value?.toString()?.trim() ?? '';
      const sanitizedValue = this.sanitizeInput(currentValue);

      if (this.searchControl.valid) {
        this.handleSearchLogic(sanitizedValue);
      }
    }, 10);
  }
}
