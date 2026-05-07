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
  CategoryTypes, FormLocationType,
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
import {DUPLICATE_LOCATION_TYPE_CODE_MSG, DUPLICATE_LOCATION_TYPE_NAME_MSG, DUPLICATE_RECORD_CODE} from '../../constants/common-constants';

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
    {name: this.#translateService.instant('createTicket'), code: 'CREATE_TICKET'},
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
  isFormHadChanges = signal(false);

  initialFormValue = signal({} as FormLocationType);

  init = effect(() => {
    this.createLocationTypeForm();
    this.activateEditMode();
    this.listenToCategoryChanges();
    this.listenToFormChanges();
  });

  createLocationTypeForm(): void {
    const serviceFormGroup = this.createServiceFormGroup();

    this.form = new FormGroup(({
      category: new FormControl<LocationTypePayload['category']>(LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION),
      size: new FormControl<LocationTypePayload['size']>('A6'),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), noScriptValidator, noSqlInjectionValidator]),
      code: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(10), noScriptValidator, noSqlInjectionValidator, noWhitespaceValidator()]),
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
          // CREATE_TICKET or null — no link validation needed
          internalLink?.clearValidators();
          internalLink?.clearAsyncValidators();
          externalLink?.clearValidators();
          externalLink?.clearAsyncValidators();
          internalLink?.reset('');
          externalLink?.reset('');
        }

        // Update validity
        internalLink?.updateValueAndValidity();
        externalLink?.updateValueAndValidity();
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe();

    return serviceFormGroup;
  }

  /**
   * Returns the max number of service rows allowed = total survey options count.
   */
  get maxServicesCount(): number {
    return this.surveyOptions().length;
  }

  /**
   * Returns true if a new service row can be added.
   */
  get canAddService(): boolean {
    return this.servicesArray.length < this.maxServicesCount;
  }

  /**
   * Returns the list of survey options that are NOT yet selected in OTHER rows,
   * for the given row index. The currently selected value of this row is always included
   * so the dropdown doesn't lose its displayed value.
   */
  getAvailableOptionsForIndex(index: number): { name: string; code: string }[] {
    const selectedCodes: string[] = this.servicesArray.controls
      .map((ctrl, i) => i !== index ? (ctrl.get('serviceType')?.value as string | null) : null)
      .filter((code): code is string => !!code);

    return this.surveyOptions().filter(opt => !selectedCodes.includes(opt.code as string));
  }

  /**
   * Adds a new empty service row to the FormArray.
   */
  addService(): void {
    if (!this.canAddService) return;
    this.servicesArray.push(this.createServiceFormGroup());
    this.form.markAsDirty();
    this.isFormHadChanges.set(true);
  }

  /**
   * Removes a service row at the given index.
   */
  removeService(index: number): void {
    if (this.servicesArray.length <= 1) {
      // If only one row left, just clear the serviceType so the row stays empty
      const group = this.servicesArray.at(0);
      (group.get('serviceType') as FormControl)?.setValue(null, { emitEvent: true });
      this.form.markAsDirty();
      this.isFormHadChanges.set(true);
      return;
    }
    this.servicesArray.removeAt(index);
    this.form.markAsDirty();
    this.isFormHadChanges.set(true);
  }

  listenToCategoryChanges(): void {
    this.getControl('category').valueChanges.pipe(
      tap((categoryValue: CategoryTypes) => {
        const surveyControl = this.getControl('services')?.get('0')?.get('serviceType');
        const internalLinkControl = this.getControl('services')?.get('0')?.get('internalLink');
        const externalLinkControl = this.getControl('services')?.get('0')?.get('externalLink');

      // AUTOMATICALLY UPDATE PRINT SIZE BASED ON CATEGORY
        if (categoryValue === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
          this.getControl('size').setValue('A6');
        } else if (categoryValue === LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION) {
          this.getControl('size').setValue('6x9');
        }

        if (categoryValue === LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION) {
        // internalLinkControl?.clearAsyncValidators();
        // externalLinkControl?.clearAsyncValidators();

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
      // if (categoryValue === LOCATION_TYPE_CATEGORIES.EMPLOYEE_LOCATION && surveyControl?.value) {
      //   internalLinkControl?.setValidators([noScriptValidator, noSqlInjectionValidator]);
      //   externalLinkControl?.setValidators([noScriptValidator, noSqlInjectionValidator]);
      //
      //   // Update validity
      //   internalLinkControl?.updateValueAndValidity({ emitEvent: false });
      //   externalLinkControl?.updateValueAndValidity({ emitEvent: false });
      // }
        if (categoryValue === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION && surveyControl?.value) {
          internalLinkControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);

          externalLinkControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(500), noScriptValidator, noSqlInjectionValidator]);

        // SET ASYNC VALIDATOR
          internalLinkControl?.setAsyncValidators([ServiceLinkValidator(this.#locationTypeActionsService)]);
          externalLinkControl?.setAsyncValidators([ServiceLinkValidator(this.#locationTypeActionsService)]);
        // Update validity
          internalLinkControl?.updateValueAndValidity({ emitEvent: false });
          externalLinkControl?.updateValueAndValidity({ emitEvent: false });
        }
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe();
  }

  saveChanges(): void {
    const payload = this.handleLocationTypePayload();

    this.isLoading.set(true);
    this.invokeCreateLocationType(payload);
    this.invokeUpdateLocationType(this.dialogData()?.id, payload);
  }

  handleLocationTypePayload(): LocationTypePayload {
    const { services, ...restForm } = this.form.getRawValue();

    // Map each service to its correct shape based on serviceType
    const mappedServices = services
      .filter(s => !!s.serviceType) // skip rows with no type selected
      .map(s => {
        if (s.serviceType === 'Feedback') {
          return {
            available: true,
            serviceType: s.serviceType,
            internalLink: s.internalLink ?? '',
            externalLink: s.externalLink ?? '',
          };
        } else {
          // CREATE_TICKET — only available + serviceType
          return {
            available: true,
            serviceType: s.serviceType,
          };
        }
      });

    return {
      ...restForm,
      services: mappedServices,
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

  getServicesControlError(serviceControl: AbstractControl | null, errorCode: FormErrorType): boolean {
    if (serviceControl && errorCode) {
      return serviceControl.hasError(errorCode) && !serviceControl?.pristine;
    }

    return false;
  }

  getServiceErrorRequiredLength(serviceControl: AbstractControl<unknown> | null, errorCode: FormErrorType): number {
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
      const locationTypeData = dialogData?.locationTypeData as LocationType & { services?: ServiceDto[] };

      const savedServices: ServiceDto[] = locationTypeData?.services ?? [];
      this.rebuildServicesArray(savedServices);

      this.form.patchValue(locationTypeData as Partial<LocationType | unknown>);

      savedServices.forEach((service, i) => {
        const group = this.servicesArray.at(i);
        if (!group) return;

        const normalizedType = service.serviceType
          ? this.surveyOptions().find(
              opt => opt.code.toLowerCase() === service.serviceType!.toLowerCase()
            )?.code ?? service.serviceType
          : null;
        group.get('serviceType')?.setValue(normalizedType as null, { emitEvent: true });

        if (service.serviceType === 'Feedback') {
          group.get('internalLink')?.setValue(service.internalLink ?? '');
          group.get('externalLink')?.setValue(service.externalLink ?? '');
        }

        group.get('available')?.setValue(service.available ?? true);
      });

      this.handleDisableControlsForLinkedLocations();

      this.initialFormValue.set(this.form.getRawValue());
      this.form.updateValueAndValidity();
    }
  }

  private rebuildServicesArray(savedServices: ServiceDto[]): void {
    this.servicesArray.clear({ emitEvent: false });
    const rowCount = savedServices.length > 0 ? savedServices.length : 1;
    for (let i = 0; i < rowCount; i++) {
      this.servicesArray.push(this.createServiceFormGroup(), { emitEvent: false });
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
    const typeName = this.getControl('name');

    if (err?.error?.message?.[0]?.code === DUPLICATE_RECORD_CODE) {
      if (err?.error.message?.[0].source.message.includes(DUPLICATE_LOCATION_TYPE_NAME_MSG)) {
        typeName.addValidators(duplicatedTypeCodeValidator(typeName.value));
        typeName.updateValueAndValidity();
      }
      if (err?.error.message?.[0].source.message.includes(DUPLICATE_LOCATION_TYPE_CODE_MSG)) {
        ctrl.addValidators(duplicatedTypeCodeValidator(ctrl.value));
      }
    } else {
      ctrl.removeValidators(duplicatedTypeCodeValidator(ctrl.value));
    }

    ctrl.updateValueAndValidity();
  }

  private listenToFormChanges(): void {
    this.form.valueChanges.pipe(
      tap(() => {
        this.isFormHadChanges.set(JSON.stringify(this.initialFormValue()) !== JSON.stringify(this.form.getRawValue()));
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe();
  }
}
