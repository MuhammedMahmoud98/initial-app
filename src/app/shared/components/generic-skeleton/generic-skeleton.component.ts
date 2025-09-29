import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-generic-skeleton',
  imports: [],
  standalone: true,
  templateUrl: './generic-skeleton.component.html',
  styleUrl: './generic-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericSkeletonComponent {

}
