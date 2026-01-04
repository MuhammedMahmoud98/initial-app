import { Component, inject, input, InputSignal } from '@angular/core';
import { CopyToClipboardComponent } from '../../../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import { TitleWithIconComponent } from '../../../../shared/components/title-with-icon/title-with-icon.component';
import { CustomStatusComponent } from '../../../../shared/components/custom-status/custom-status.component';
import { TextWithBgColorComponent } from '../../../../shared/components/text-with-bg-color/text-with-bg-color.component';
import { locationTypeDetails } from '../../../assigned-locations/models/assigned-location.model';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageModule } from 'primeng/message';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { LocalizationService } from '../../../../core/services';

@Component({
  selector: 'app-view-location-details',
  standalone: true,
  imports: [
    CopyToClipboardComponent,
    CustomStatusComponent,
    TextWithBgColorComponent,
    TitleWithIconComponent,
    TranslatePipe,
    MessageModule,
    ToggleSwitchModule
  ],
  templateUrl: './view-location-details.component.html',
  styleUrls: ['./view-location-details.component.scss'],
})
export class ViewLocationDetailsComponent {
 locationDetails: InputSignal<locationTypeDetails>= input.required();
 readonly localizationService = inject(LocalizationService);
}
