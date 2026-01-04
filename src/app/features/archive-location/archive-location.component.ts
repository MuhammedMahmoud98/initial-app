import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DialogService } from 'primeng/dynamicdialog';

import { TranslatePipe } from '@ngx-translate/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-archive-location',
  imports: [TranslatePipe, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [DialogService],
  standalone: true,
  templateUrl: './archive-location.component.html',
  styleUrl: './archive-location.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class archiveLocationComponent {}
