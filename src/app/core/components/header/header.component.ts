import { Component, inject, signal } from '@angular/core';
import { HubSearchComponent } from '../hub-search/hub-search.component';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { HubInboxComponent } from '../hub-inbox/hub-inbox.component';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    HubSearchComponent,
    ProfileMenuComponent,
    HubInboxComponent,
    DividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly userService = inject(UserService);
  readonly cookie = inject(CookieService);
  menuOpen = signal(false);
  currentUser = signal(null);

  // getCurrentUserInfo() {
  //   this.userService
  //     .getUserById(ApiConstants.USER_SERVICE, this.getCurrentUserId())
  //     .subscribe();
  //   this.currentUser.set(this.userService.currentUser);
  // }
}
