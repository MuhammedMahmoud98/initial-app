import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-title-with-icon',
  imports: [],
  standalone: true,
  templateUrl: './title-with-icon.component.html',
  styleUrl: './title-with-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleWithIconComponent {
  itemTitle = input<string | undefined>();
  iconUrl = input.required<string>();
}
