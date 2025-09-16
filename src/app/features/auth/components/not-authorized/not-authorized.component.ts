import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserStatusComponent } from '../../../../shared/components/user-status/user-status.component';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-not-authorized',
  imports: [UserStatusComponent],
  templateUrl: './not-authorized.component.html',
  styleUrl: './not-authorized.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotAuthorizedComponent {
  router = inject(Router);
  authService: AuthenticationService = inject(AuthenticationService);
}
