import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {Skeleton} from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-loader',
  imports: [
    Skeleton
  ],
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent {
  protected readonly randomHeight = signal([6, 5, 3, 7, 4, 3])

  randomWidth(maxWidth: number): string {
    const min = 3;
    const width = Math.random() * (maxWidth - min) + min;
    return `${Math.round(width * 10) / 10}rem`;
  }

  protected readonly Array = Array;
}
