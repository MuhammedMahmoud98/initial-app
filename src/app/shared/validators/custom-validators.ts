import {AbstractControl, ValidationErrors} from '@angular/forms';
import {SQL_INJECTION_PATTERNS, XSS_PATTERNS} from '../constants/common-constants';

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
