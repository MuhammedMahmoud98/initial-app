import {FormControl} from '@angular/forms';

export type FormControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
}

export type TokenLessUrls = 'validate' | 'refresh_token';
