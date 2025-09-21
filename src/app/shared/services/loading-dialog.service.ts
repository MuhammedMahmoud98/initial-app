import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingDialogService {
  protected progressValueSignal: WritableSignal<number> = signal(20);

  progressValue: Signal<number> = computed(() => this.progressValueSignal());

  setProgressValue(value: number): void {
    this.progressValueSignal.set(value);
  }

  resetProgressValue(): void {
    this.progressValueSignal.set(0);
  }
}
