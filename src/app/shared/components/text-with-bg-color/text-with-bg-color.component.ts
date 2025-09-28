import {ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal} from '@angular/core';
import {genericCasting} from '../../helpers/helpers';

@Component({
  selector: 'app-text-with-bg-color',
  imports: [],
  standalone: true,
  templateUrl: './text-with-bg-color.component.html',
  styleUrl: './text-with-bg-color.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextWithBgColorComponent<T> {
  // INPUTS
  textItems: InputSignal<T | T[]> = input.required();
  mapTextKey = input<keyof T>('' as keyof T);
  textColor: InputSignal<string | unknown> = input.required();
  bgColor: InputSignal<string | unknown> = input.required();

  genericCasting = genericCasting<T[]>

  // SIGNALS
  isArray: Signal<boolean> = computed(() => Array.isArray(this.textItems()));
  isObject: (item: unknown) => boolean = (item: unknown) => typeof item === 'object' && item !== null && !Array.isArray(item);
}
