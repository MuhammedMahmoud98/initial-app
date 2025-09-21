import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import {ComponentStateComponent} from '../../../../shared/components/component-state/component-state.component';

@Component({
  selector: 'app-not-authorized',
  imports: [ComponentStateComponent],
  templateUrl: './not-authorized.component.html',
  styleUrl: './not-authorized.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotAuthorizedComponent {
  router = inject(Router);
  authService: AuthenticationService = inject(AuthenticationService);
}
