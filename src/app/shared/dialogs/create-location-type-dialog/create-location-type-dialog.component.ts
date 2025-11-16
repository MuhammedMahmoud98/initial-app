import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {Button} from 'primeng/button';
import {LocationTypeCategoryComponent} from '../../components/location-type-category/location-type-category.component';
import {AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {FormControlsOf, FormErrorType} from '../../models';
import {LOCATION_TYPE_CATEGORIES, MODE} from '../../enums/shared.enum';
import {noScriptValidator, noSqlInjectionValidator} from '../../validators/custom-validators';
import {catchError, EMPTY, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {LocationTypeActionsService} from '../../../features/location-types/services/location-type-actions.service';
import {LocationType, LocationTypeDialogData} from '../../../features/location-types/models/location-types.model';

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
    Select,
  ],
  standalone: true,
  templateUrl: './create-location-type-dialog.component.html',
  styleUrl: './create-location-type-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLocationTypeDialogComponent {
  // INJECTIONS
  readonly #translateService: TranslateService = inject(TranslateService);
  readonly #dialogRef: DynamicDialogRef = inject(DynamicDialogRef);
  readonly #dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #locationTypeActionsService: LocationTypeActionsService = inject(LocationTypeActionsService);
  // SIGNALS
  surveyOptions = signal([
    {name: this.#translateService.instant('Feedback'), code: 'Feedback'},
  ]);

  LOCATION_TYPE_CATEGORIES = LOCATION_TYPE_CATEGORIES;

  // FORM
  form!: FormGroup<LocationTypeForm>;

  init = effect(() => {
    this.createLocationTypeForm();
    this.activateEditMode();
    this.listenToCategoryChanges();
  });

  createLocationTypeForm(): void {
    const serviceFormGroup = this.createServiceFormGroup();

    this.form = new FormGroup(({
      category: new FormControl<LocationTypePayload['category']>(LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION),
      size: new FormControl<LocationTypePayload['size']>('A4'),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20), noScriptValidator, noSqlInjectionValidator]),
      code: new FormControl('', [Validators.required,Validators.minLength(2), Validators.maxLength(10), noScriptValidator, noSqlInjectionValidator]),
      services: new FormArray([serviceFormGroup])
    } as unknown as LocationTypeForm));
  }

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

        if (serviceType === 'Feedback') {
          // Add required validator when service type is SURVEY
          internalLink?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);
          externalLink?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);
        } else {
          // Remove required validator for other service types
          internalLink?.setValidators([noScriptValidator, noSqlInjectionValidator]);
          externalLink?.setValidators([noScriptValidator, noSqlInjectionValidator]);
        }

        // Update validity
        internalLink?.updateValueAndValidity();
        externalLink?.updateValueAndValidity();
      }),
      takeUntilDestroyed(this.#destroyRef),
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
          internalLinkControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);
          externalLinkControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);

          // Update validity
          internalLinkControl?.updateValueAndValidity();
          externalLinkControl?.updateValueAndValidity();
        }
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe();
  }

  saveChanges(): void {
    console.log(this.form.getRawValue(), 'form value');
    const payload = this.form.getRawValue();
    this.#locationTypeActionsService.createNewLocationType(payload).pipe(
      tap((createLocationTypeRes) => {
        console.log('%cCreateLocationType create location type', 'color: green', createLocationTypeRes);
      }),
      takeUntilDestroyed(this.#destroyRef),
      catchError((err) => {
        console.log(err, 'ERR');
        return EMPTY;
      })
    ).subscribe();
  }

  getControl(controlName: LocationTypeKeys): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  get servicesArray(): FormArray<FormGroup<FormControlsOf<ServiceDto>>> {
    return this.form.get('services') as FormArray<FormGroup<FormControlsOf<ServiceDto>>>;
  }

  getControlError(controlName: LocationTypeKeys, errorCode: FormErrorType): boolean {
    if (controlName && errorCode) {
      return this.getControl(controlName).hasError(errorCode) && !this.getControl(controlName).pristine;
    }

    return false;
  }

  getErrorRequiredLength(controlName: LocationTypeKeys, errorCode: FormErrorType): number {
    if (controlName && errorCode) {
      return this.getControl(controlName)?.errors?.[errorCode]?.requiredLength;
    }

    return 0;
  }

  getServicesControlError(serviceControl: AbstractControl<string, string> | null, errorCode: FormErrorType): boolean {
    if (serviceControl && errorCode) {
      return serviceControl.hasError(errorCode) && !serviceControl?.pristine;
    }

    return false;
  }

  getServiceErrorRequiredLength(serviceControl: AbstractControl<string, string> | null, errorCode: FormErrorType): number {
    if (serviceControl && errorCode) {
      return serviceControl.errors?.[errorCode]?.requiredLength;
    }

    return 0;
  }

  protected closeDialog(): void {
    this.#dialogRef.close();
  }

  private activateEditMode(): void {
    const dialogData = (this.#dialogConfig?.data as LocationTypeDialogData);

    if (dialogData.mode === MODE.EDIT) {
      this.form.patchValue(dialogData?.locationTypeData as Partial<LocationType | unknown>);
      this.form.updateValueAndValidity();

      console.log(this.form.getRawValue(), 'EDIT MODE');
    }
  }
}
