import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {Button} from 'primeng/button';
import {LocationTypeCategoryComponent} from '../../components/location-type-category/location-type-category.component';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  PrintingSizeDimensionsComponent
} from '../../components/printing-size-dimensions/printing-size-dimensions.component';
import {InputLabelComponent} from '../../components/input-label/input-label.component';
import {InputText} from 'primeng/inputtext';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  CategoryTypes,
  LocationTypeForm,
  LocationTypeKeys,
  LocationTypePayload,
  ServiceDto
} from '../../models/create-location-type.model';
import {Select} from 'primeng/select';
import {FormControlsOf} from '../../models';
import {LOCATION_TYPE_CATEGORIES} from '../../enums/shared.enum';
import {noScriptValidator, noSqlInjectionValidator} from '../../validators/custom-validators';
import {tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-location-type-dialog',
  imports: [
    Button,
    LocationTypeCategoryComponent,
    ReactiveFormsModule,
    PrintingSizeDimensionsComponent,
    InputLabelComponent,
    InputText,
    TranslatePipe,
    Select
  ],
  standalone: true,
  templateUrl: './create-location-type-dialog.component.html',
  styleUrl: './create-location-type-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLocationTypeDialogComponent {
  // INJECTIONS
  readonly #translateService: TranslateService = inject(TranslateService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);
  // SIGNALS
  surveyOptions = signal([
    {name: this.#translateService.instant('survey'), code: 'SURVEY'},
  ]);

  LOCATION_TYPE_CATEGORIES = LOCATION_TYPE_CATEGORIES;

  // FORM
  form!: FormGroup<LocationTypeForm>;

  init = effect(() => {
    const serviceFormGroup = this.createServiceFormGroup();

    this.form = new FormGroup(({
      category: new FormControl<LocationTypePayload['category']>(LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION),
      size: new FormControl<LocationTypePayload['size']>('A4'),
      name: new FormControl('', [Validators.minLength(3), noScriptValidator, noSqlInjectionValidator]),
      code: new FormControl('', [Validators.required, noScriptValidator, noSqlInjectionValidator]),
      services: new FormArray([serviceFormGroup])
    } as unknown as LocationTypeForm));

    this.listenToCategoryChanges();
  });

  createServiceFormGroup(): FormGroup {
    const serviceFormGroup = new FormGroup({
      serviceType: new FormControl(null),
      internalLink: new FormControl('', [noScriptValidator, noSqlInjectionValidator]),
      externalLink: new FormControl('', [noScriptValidator, noSqlInjectionValidator]),
      available: new FormControl(true)
    });

    // Subscribe to serviceType changes
    serviceFormGroup.get('serviceType')?.valueChanges.pipe(
      tap((serviceType) => {
        const internalLink = serviceFormGroup.get('internalLink');
        const externalLink = serviceFormGroup.get('externalLink');

        if (serviceType === 'SURVEY') {
          // Add required validator when service type is SURVEY
          internalLink?.setValidators([Validators.required, noScriptValidator, noSqlInjectionValidator]);
          externalLink?.setValidators([Validators.required, noScriptValidator, noSqlInjectionValidator]);
        } else {
          // Remove required validator for other service types
          internalLink?.setValidators([noScriptValidator, noSqlInjectionValidator]);
          externalLink?.setValidators([noScriptValidator, noSqlInjectionValidator]);
        }

        // Update validity
        internalLink?.updateValueAndValidity();
        externalLink?.updateValueAndValidity();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();

    return serviceFormGroup;
  }

  listenToCategoryChanges(): void {
    this.getControl('category').valueChanges.pipe(
      tap((categoryValue: CategoryTypes) => {
        const surveyControl = this.getControl('services').get('0')?.get('serviceType');
        const internalLinkControl = this.getControl('services').get('0')?.get('internalLink');
        const externalLinkControl = this.getControl('services').get('0')?.get('externalLink');
        if (categoryValue === LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION && surveyControl?.value) {
          internalLinkControl?.setValidators([noScriptValidator, noSqlInjectionValidator]);
          externalLinkControl?.setValidators([noScriptValidator, noSqlInjectionValidator]);

          // Update validity
          internalLinkControl?.updateValueAndValidity();
          externalLinkControl?.updateValueAndValidity();
        }

        if (categoryValue === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION && surveyControl?.value) {
          internalLinkControl?.setValidators([Validators.required, noScriptValidator, noSqlInjectionValidator]);
          externalLinkControl?.setValidators([Validators.required, noScriptValidator, noSqlInjectionValidator]);

          // Update validity
          internalLinkControl?.updateValueAndValidity();
          externalLinkControl?.updateValueAndValidity();
        }
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  saveChanges(): void {
    console.log(this.form.getRawValue(), 'form value');
  }

  getControl(controlName: LocationTypeKeys): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  get servicesArray(): FormArray<FormGroup<FormControlsOf<ServiceDto>>> {
    return this.form.get('services') as FormArray<FormGroup<FormControlsOf<ServiceDto>>>;
  }
}
