import {ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, Signal, signal} from '@angular/core';
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
  LocationTypePayload, LocationTypeResponse,
  ServiceDto
} from '../../models/create-location-type.model';
import {Select} from 'primeng/select';
import {FormControlsOf, FormErrorType, ModeType} from '../../models';
import {LOCATION_TYPE_CATEGORIES, MODE} from '../../enums/shared.enum';
import {
  duplicatedTypeCodeValidator,
  noScriptValidator,
  noSqlInjectionValidator, noWhitespaceValidator, ServiceLinkValidator
} from '../../validators/custom-validators';
import {catchError, EMPTY, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {LocationTypeActionsService} from '../../../features/location-types/services/location-type-actions.service';
import {LocationType, LocationTypeDialogData} from '../../../features/location-types/models/location-types.model';
import {SpinnerLoaderComponent} from '../../components/spinner-loader/spinner-loader.component';
import {MessageService} from 'primeng/api';
import {HttpErrorResponse} from '@angular/common/http';
import {DUPLICATE_RECORD_CODE} from '../../constants/common-constants';

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
    SpinnerLoaderComponent,
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
  readonly #messageService: MessageService = inject(MessageService);

  // SIGNALS
  surveyOptions = signal([
    {name: this.#translateService.instant('Feedback'), code: 'Feedback'},
  ]);

  isLoading = signal(false);

  // COMPUTED
  dialogMode: Signal<ModeType> = computed(() => this.#dialogConfig?.data?.mode as ModeType);
  dialogData: Signal<LocationType> = computed(() => (this.#dialogConfig?.data as LocationTypeDialogData)?.locationTypeData as LocationType);
  hasLinkedLocations: Signal<boolean> = computed(() => (this.#dialogConfig?.data as LocationTypeDialogData).locationTypeData?.['has-linked-locations'] ?? false);

  LOCATION_TYPE_CATEGORIES = LOCATION_TYPE_CATEGORIES;
  protected readonly MODE = MODE;

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
      code: new FormControl('', [Validators.required,Validators.minLength(2), Validators.maxLength(10), noScriptValidator, noSqlInjectionValidator, noWhitespaceValidator()]),
      services: new FormArray([serviceFormGroup])
    } as unknown as LocationTypeForm));
  }

  createServiceFormGroup(): FormGroup {
    const serviceFormGroup = new FormGroup({
      serviceType: new FormControl(null),
      internalLink: new FormControl('', {
        validators: [noScriptValidator, noSqlInjectionValidator],
        asyncValidators: [ServiceLinkValidator(this.#locationTypeActionsService)],
      }),
      externalLink: new FormControl('', {
        validators: [noScriptValidator, noSqlInjectionValidator],
        asyncValidators: [ServiceLinkValidator(this.#locationTypeActionsService)],
      }),
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

          // SET ASYNC VALIDATOR
          internalLink?.setAsyncValidators([ServiceLinkValidator(this.#locationTypeActionsService)]);
          externalLink?.setAsyncValidators([ServiceLinkValidator(this.#locationTypeActionsService)]);
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
        const surveyControl = this.getControl('services')?.get('0')?.get('serviceType');
        const internalLinkControl = this.getControl('services')?.get('0')?.get('internalLink');
        const externalLinkControl = this.getControl('services')?.get('0')?.get('externalLink');

        if (categoryValue === LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION) {
          internalLinkControl?.clearAsyncValidators();
          externalLinkControl?.clearAsyncValidators();

          internalLinkControl?.markAsTouched();
          internalLinkControl?.markAsDirty();
          internalLinkControl?.setErrors(null);

          externalLinkControl?.markAsTouched();
          externalLinkControl?.markAsDirty();
          externalLinkControl?.setErrors(null);

          // Update validity
          internalLinkControl?.updateValueAndValidity({ emitEvent: false });
          externalLinkControl?.updateValueAndValidity({ emitEvent: false });
        }

        if (categoryValue === LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION && surveyControl?.value) {
          internalLinkControl?.setValidators([noScriptValidator, noSqlInjectionValidator]);
          externalLinkControl?.setValidators([noScriptValidator, noSqlInjectionValidator]);

          // Update validity
          internalLinkControl?.updateValueAndValidity({ emitEvent: false });
          externalLinkControl?.updateValueAndValidity({ emitEvent: false });
        }

        if (categoryValue === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION && surveyControl?.value) {
          // eslint-disable-next-line max-len
          internalLinkControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);
          // eslint-disable-next-line max-len
          externalLinkControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);

          // SET ASYNC VALIDATOR
          internalLinkControl?.setAsyncValidators([ServiceLinkValidator(this.#locationTypeActionsService)]);
          externalLinkControl?.setAsyncValidators([ServiceLinkValidator(this.#locationTypeActionsService)]);
          // Update validity
          internalLinkControl?.updateValueAndValidity({ emitEvent: false });
          externalLinkControl?.updateValueAndValidity({ emitEvent: false });
        }


        if (this.dialogMode() === MODE.EDIT) {
          this.form.markAsUntouched();
          this.form.markAsPristine();
          this.form.updateValueAndValidity({ emitEvent: false });
        }

        console.log(this.form);
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe();
  }

  saveChanges(): void {
    console.log(this.form.getRawValue(), 'form value');
    const payload = this.handleLocationTypePayload();

    this.isLoading.set(true);
    this.invokeCreateLocationType(payload);
    this.invokeUpdateLocationType(this.dialogData()?.id, payload);
  }

  handleLocationTypePayload() {
    const categoryValue = this.getControl('category').value;
    const {services, ...restPayload} = this.form.getRawValue();

    if (categoryValue === this.LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION) {
      return restPayload as LocationTypePayload;
    }

    return {
      ...this.form.getRawValue(),
      services: this.servicesArray.getRawValue()?.[0].serviceType ? services : [],
    } as LocationTypePayload;
  }

  invokeCreateLocationType(payload: LocationTypePayload): void {
    if (this.dialogMode() === MODE.ADD) {
      this.#locationTypeActionsService.createNewLocationType(payload).pipe(
        tap((createLocationTypeRes: LocationTypeResponse) => {
          this.isLoading.set(false);
          this.#messageService.add({severity: 'success', summary: 'success', detail: this.#translateService.instant('newLocationTypeSuccessMsg', {typeName: createLocationTypeRes.name})});
          this.#dialogRef.close({refresh: true});
        }),
        takeUntilDestroyed(this.#destroyRef),
        catchError((err) => {
          this.handleTypeCodeDuplicationError(err);
          this.isLoading.set(false);
          console.log(err, 'CREATE ERROR');
          return EMPTY;
        })
      ).subscribe();
    }
  }

  invokeUpdateLocationType(id: number, payload: LocationTypePayload): void {
    if (this.dialogMode() === MODE.EDIT) {
      this.#locationTypeActionsService.updateLocationType(id, payload).pipe(
        tap(() => {
          this.closeWithSuccessMsg(this.#translateService.instant('updateLocationTypeSuccessMsg', {typeName: this.form.getRawValue().name}));
        }),
        catchError((error) => {
          console.log(error, 'UPDATE ERROR');
          this.handleTypeCodeDuplicationError(error);
          this.isLoading.set(false);
          return EMPTY;
        }),
      ).subscribe();
    }
  }

  closeWithSuccessMsg(message: string): void {
    this.isLoading.set(false);
    this.#dialogRef.close({refresh: true});
    this.#messageService.add({severity: 'success', summary: 'success', detail: message});
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
    if (this.dialogMode() === MODE.EDIT) {
      const dialogData = (this.#dialogConfig?.data as LocationTypeDialogData);
      console.log(dialogData, 'DIALOG DATA');
      this.form.patchValue(dialogData?.locationTypeData as Partial<LocationType | unknown>);
      this.handleDisableControlsForLinkedLocations();
      console.log(this.hasLinkedLocations(), 'HAS LINKED LOCATIONS');

      this.form.updateValueAndValidity();

      console.log(this.form.getRawValue(), 'EDIT MODE');
    }
  }

  handleDisableControlsForLinkedLocations(): void {
    if (this.hasLinkedLocations()) {
      this.getControl('category').disable();
      this.getControl('code').disable();
      this.getControl('name').disable();
    }
  }

  private handleTypeCodeDuplicationError(err: HttpErrorResponse) {
    const ctrl = this.getControl('code');

    if (err?.error?.message?.[0]?.code === DUPLICATE_RECORD_CODE) {
      ctrl.addValidators(duplicatedTypeCodeValidator(ctrl.value));
    } else {
      ctrl.removeValidators(duplicatedTypeCodeValidator(ctrl.value));
    }

    ctrl.updateValueAndValidity();
  }
}
