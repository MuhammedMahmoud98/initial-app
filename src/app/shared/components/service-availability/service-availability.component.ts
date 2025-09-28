import {ChangeDetectionStrategy, Component, input, InputSignal, output} from '@angular/core';
import {
  LocationService,
  ToggleServiceEvent
} from '../../../features/location-types/models/location-types.model';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-service-availability',
  imports: [
    ToggleSwitch,
    FormsModule
  ],
  standalone: true,
  templateUrl: './service-availability.component.html',
  styleUrl: './service-availability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceAvailabilityComponent {
  // INPUTS
  readonly services: InputSignal<LocationService[]> = input.required<LocationService[]>();

  // OUTPUTS
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  readonly onToggleService = output<ToggleServiceEvent>();
}
