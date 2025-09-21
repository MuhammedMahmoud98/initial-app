import {ChangeDetectionStrategy, Component, input, signal} from '@angular/core';

@Component({
  selector: 'app-progress-circle',
  imports: [],
  standalone: true,
  templateUrl: './progress-circle.component.html',
  styleUrl: './progress-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressCircleComponent {
  // INPUTS
  percentage = input(0); // start at 0%
  // SIGNALS
  radius = signal(45);
  circumference = signal(2 * Math.PI * this.radius());
}
