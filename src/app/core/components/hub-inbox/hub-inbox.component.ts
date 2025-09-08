import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-hub-inbox',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './hub-inbox.component.html',
  styleUrls: ['./hub-inbox.component.scss'],
})
export class HubInboxComponent {
  readonly userService = inject(UserService);
  showBackDrop = signal(false);
  inboxItems = signal([]);

  goToLink(url: string) {
    window.open(url, '_self');
  }
}
