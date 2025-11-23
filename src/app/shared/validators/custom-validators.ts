import {AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {SQL_INJECTION_PATTERNS, XSS_PATTERNS} from '../constants/common-constants';
import {LocationTypeActionsService} from '../../features/location-types/services/location-type-actions.service';
import {catchError, map, Observable, of, switchMap, timer} from 'rxjs';
import {ServiceLinkKeys, ServiceLinkResponse} from '../models/create-location-type.model';

export const noSqlInjectionValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const containsSQLInjection = SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
  return containsSQLInjection ? { sqlInjectionDetected: true } : null;
}

export const noScriptValidator = (control: AbstractControl): ValidationErrors | null =>  {
  const value = control.value;
  if (!value) return null;

  const containsXSS = XSS_PATTERNS.some(pattern => pattern.test(value));
  return containsXSS ? { xssDetected: true } : null;
}

export const noWhitespaceValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) return null;

    // Reject if there is ANY whitespace (beginning, middle or end)
    const hasWhitespace = /\s/.test(value);

    if (hasWhitespace) {
      control.markAsUntouched();
      control.markAsDirty();
    }

    return hasWhitespace ? { whitespace: true } : null;
  };
}

export const duplicatedTypeCodeValidator = (duplicatedValue: string) => {
  return (control: AbstractControl): ValidationErrors | null => {
    return (control.value === duplicatedValue)
      ? { duplicatedTypeCode: true }
      : null;
  };
};

function getControlName(control: AbstractControl): string | null {
  if (!control.parent) return null;

  const parent = control.parent as FormGroup;
  return Object.keys(parent.controls).find(name => control === parent.controls[name]) || null;
}

export const ServiceLinkValidator = (service: LocationTypeActionsService): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value as string;
    const key = getControlName(control) as ServiceLinkKeys;

    if (!value) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() =>
        service.validateServiceLink({ [key]: value }).pipe(
          map((res: ServiceLinkResponse) => {
            const isValid = res?.data?.[key]?.valid;

            if (!isValid) {
              control.markAsTouched();
              control.markAsDirty();
              return { invalidServiceLink: res?.data?.[key]?.message };
            }

            return null;
          }),
          catchError(() =>
            of({ invalidServiceLink: 'something went wrong' })
          )
        )
      )
    );
  };
};
