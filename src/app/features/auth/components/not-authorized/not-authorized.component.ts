import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import {ComponentStateComponent} from '../../../../shared/components/component-state/component-state.component';
import {UserService} from '../../../../core/services';
import {switchMap, take} from 'rxjs';

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
  userService = inject(UserService);

  init = afterNextRender(() => {
    this.checkIfUserIsThriftAdmin();
  });

  checkIfUserIsThriftAdmin() {
    if (!this.authService.unAuthorizedChecked()) {
      this.authService.unAuthorizedChecked.set(false);
      const userId = +this.userService.getUserId();
      if (userId) {
        this.userService.isUserLoading.set(true);
        this.authService
          .validateToken()
          .pipe(
            switchMap(() => this.userService.getUserById(userId).pipe(take(1))),
          )
          .subscribe({
            next: (user) => {
              if (user && user['is-qr-code-admin']) {
                this.authService.skipThriftGuard.set(true);
                this.userService.isUserLoading.set(false);
                this.router.navigate(['/']);
              }
            },
          });
      }
    }
  }
}
