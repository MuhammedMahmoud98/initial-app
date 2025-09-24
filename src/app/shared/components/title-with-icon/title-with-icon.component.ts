import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-title-with-icon',
  imports: [
    NgOptimizedImage
  ],
  standalone: true,
  templateUrl: './title-with-icon.component.html',
  styleUrl: './title-with-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleWithIconComponent {
  itemTitle = input<string | undefined>();
}
