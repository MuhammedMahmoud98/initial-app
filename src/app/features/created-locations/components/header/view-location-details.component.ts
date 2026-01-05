import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { CopyToClipboardComponent } from '../../../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import { TitleWithIconComponent } from '../../../../shared/components/title-with-icon/title-with-icon.component';
import { CustomStatusComponent } from '../../../../shared/components/custom-status/custom-status.component';
import { TextWithBgColorComponent } from '../../../../shared/components/text-with-bg-color/text-with-bg-color.component';
import {
  InheritedService,
  locationTypeDetails,
} from '../../../assigned-locations/models/assigned-location.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageModule } from 'primeng/message';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { LocalizationService } from '../../../../core/services';
import { LocationsService } from '../../services/locations.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { BackendErrorResponse } from '../../../location-types/models/location-types.model';
import { LowerCasePipe } from '@angular/common';

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
    ToggleSwitchModule,
    FormsModule,
    LowerCasePipe
  ],
  templateUrl: './view-location-details.component.html',
  styleUrls: ['./view-location-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ViewLocationDetailsComponent {
  locationDetails: InputSignal<locationTypeDetails> = input.required();

  readonly localizationService = inject(LocalizationService);
  readonly #locationsService: LocationsService = inject(LocationsService);
  readonly #messageService: MessageService = inject(MessageService);
  readonly #translateService: TranslateService = inject(TranslateService);

  toggleLocationServiceStatus(service: InheritedService): void {
    const locationId = this.locationDetails().id;
    const locationServiceId = service.locationServiceId;

    const previousState = service.enabled;

  

    this.#locationsService
      .toggleLocationTypeStatus(locationId, locationServiceId, service.enabled)
      .pipe()
      .subscribe({
        next: (response) => {
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message,
          });
        },
        error: (error) => {
          const serviceToRevert = this.locationDetails().inheritedServices.find(
            (s) => s.locationServiceId === locationServiceId,
          );

          if (serviceToRevert) {
            serviceToRevert.enabled = previousState;
            serviceToRevert.overridden = !previousState;
          }

          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.getBackendErrorMessage(error),
          });
        },
      });
  }

  private getBackendErrorMessage(error: BackendErrorResponse): string {
    return (
      error?.message?.[0]?.source?.message ||
      this.#translateService.instant('something went wrong')
    );
  }
}
