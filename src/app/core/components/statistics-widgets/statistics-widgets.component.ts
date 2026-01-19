import {ChangeDetectionStrategy, Component, signal, afterNextRender, AfterRenderRef} from '@angular/core';
import {Skeleton} from 'primeng/skeleton';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-statistics-widgets',
  imports: [
    Skeleton
  ],
  standalone: true,
  templateUrl: './statistics-widgets.component.html',
  styleUrl: './statistics-widgets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition(':enter, * => *', [
        // find entering children and apply staggered animation
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(200, [
            animate('920ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])]),
    trigger('valueAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('920ms 400ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])])
  ]
})
export class StatisticsWidgetsComponent {
  isLoading = signal(true);

  init: AfterRenderRef = afterNextRender(() => {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  });
}
