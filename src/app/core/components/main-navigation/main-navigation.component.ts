import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MainNavigationRoute } from '../../models/main-navigation.model';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-main-navigation',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  standalone: true,
  templateUrl: './main-navigation.component.html',
  styleUrl: './main-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavigationComponent {
  mainRoutes = signal<MainNavigationRoute[]>([
    { title: 'draftManagement', path: '/draft-management' },
    { title: 'live', path: '/live' },
    { title: 'customizeColumns', path: '/customize-columns' },
  ]);
}
