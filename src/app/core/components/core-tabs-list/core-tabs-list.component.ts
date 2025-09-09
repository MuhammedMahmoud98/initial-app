import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CORE_APP_ROUTES} from '../../../shared/constants/common-constants';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-core-tabs-list',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],
  templateUrl: './core-tabs-list.component.html',
  styleUrl: './core-tabs-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreTabsListComponent {
  tabsList = signal(CORE_APP_ROUTES);
}
