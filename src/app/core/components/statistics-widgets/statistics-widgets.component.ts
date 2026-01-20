import {ChangeDetectionStrategy, Component, afterNextRender, AfterRenderRef, inject} from '@angular/core';
import {Skeleton} from 'primeng/skeleton';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {StatisticMainCardsService} from './services/statistic-main-cards.service';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-statistics-widgets',
  imports: [
    Skeleton,
    NgOptimizedImage
  ],
  standalone: true,
  templateUrl: './statistics-widgets.component.html',
  styleUrl: './statistics-widgets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        // find entering children and apply staggered animation
        query('*', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(200, [
            animate('500ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])]),
    trigger('valueAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('920ms 800ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])])
  ]
})
export class StatisticsWidgetsComponent {
  // INJECTIONS
  readonly statisticMainCardsService: StatisticMainCardsService = inject(StatisticMainCardsService);
  // SIGNALS
  mainCardsVM = this.statisticMainCardsService.mainCardsVM;
  isLoading = this.statisticMainCardsService.isLoading;

  init: AfterRenderRef = afterNextRender(() => {
    this.statisticMainCardsService.loadMainCardsStatistics();
  });
}
