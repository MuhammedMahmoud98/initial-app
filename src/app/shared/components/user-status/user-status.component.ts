import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-status',
  imports: [TranslatePipe],
  standalone: true,
  templateUrl: './user-status.component.html',
  styleUrl: './user-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserStatusComponent {
  readonly translateService = inject(TranslateService);
  iconUrl = input.required<string>();  
  titleKey = input.required<string>();
  descriptionKey = input.required<string>();
}
