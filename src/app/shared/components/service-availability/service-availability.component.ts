import {ChangeDetectionStrategy, Component, input, InputSignal, output} from '@angular/core';
import {
  LocationService,
  ToggleServiceEvent
} from '../../../features/location-types/models/location-types.model';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';
import {TextWithBgColorComponent} from '../text-with-bg-color/text-with-bg-color.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-service-availability',
  imports: [
    ToggleSwitch,
    FormsModule,
    TextWithBgColorComponent,
    TranslatePipe
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
