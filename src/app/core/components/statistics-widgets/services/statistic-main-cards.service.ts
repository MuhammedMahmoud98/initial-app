import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, finalize, Observable, shareReplay, tap, throwError} from 'rxjs';
import {API_CONSTANTS} from '../../../../shared';
import {
  MainWidgetCard,
  MainWidgetCardsResponse,
  MainWidgetCardType,
  MainWidgetCardVM
} from '../models/main-widget-card.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticMainCardsService {
  // HTTP Client Injection
  readonly #http = inject(HttpClient);
  // SIGNALS
  mainCardsStatistics = signal<MainWidgetCard[]>([] as MainWidgetCard[]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  // COMPUTED
  mainCardsVM: Signal<MainWidgetCardVM[]> = computed((): MainWidgetCardVM[] => {
    return this.mainCardsStatistics().map((card: MainWidgetCard): MainWidgetCardVM => ({
      ...card,
      iconBgColor: MainWidgetCardType[card.iconName]
    }));
  });

  private getMainCardsStatistics(): Observable<MainWidgetCardsResponse> {
    return this.#http.get<MainWidgetCardsResponse>(API_CONSTANTS.DASHBOARD_MAIN_CARDS);
  }

  loadMainCardsStatistics(): void {
    this.hasError.set(false);

    this.getMainCardsStatistics().pipe(
      tap((response: MainWidgetCardsResponse) => {
        this.mainCardsStatistics.set(response.mainWidgets);
      }),
      shareReplay(),
      catchError((error: HttpErrorResponse) => {
        this.hasError.set(true);
        return throwError((): HttpErrorResponse => error);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })).subscribe();
  }
}
