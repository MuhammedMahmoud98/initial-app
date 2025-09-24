import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  input,
  InputSignal, Signal
} from '@angular/core';
import {LowerCasePipe, NgOptimizedImage} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-component-state',
  imports: [
    NgOptimizedImage,
    LowerCasePipe,
    TranslatePipe,
    Button
  ],
  standalone: true,
  templateUrl: './component-state.component.html',
  styleUrl: './component-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentStateComponent implements AfterContentInit {
  /** NOTE: USE ICON URL OR EITHER A PROJECTION CONTENT WITH TEMPLATE REFERENCE #projectedIcon, OTHERWISE COMPONENT WILL FAIL.. **/
  iconUrl: InputSignal<string> = input<string>('');
  mainTitle: InputSignal<string> = input.required<string>();
  subTitle: InputSignal<string> = input.required<string>();
  showReloadButton: InputSignal<boolean> = input<boolean>(false);
  projectionContent: Signal<ElementRef | undefined> = contentChild('projectedIcon');

  ngAfterContentInit(): void {
    if (!this.iconUrl() && !this.projectionContent()) {
      throw new Error('You must provide either an iconUrl or projected content with the template reference #projectedIcon');
    }
  }

  protected reloadPage(): void {
    window.location.reload();
  }
}
