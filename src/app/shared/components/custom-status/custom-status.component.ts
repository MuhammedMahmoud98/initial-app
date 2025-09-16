import {ChangeDetectionStrategy, Component, input} from '@angular/core';
type CustomStatus = 'success' | 'danger';

@Component({
  selector: 'app-custom-status',
  imports: [],
  standalone: true,
  templateUrl: './custom-status.component.html',
  styleUrl: './custom-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CustomStatusComponent {
  status = input.required<CustomStatus>();
}
