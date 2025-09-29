import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingDialogService {
  protected progressValueSignal: WritableSignal<number> = signal(0);

  progressValue: Signal<number> = computed(() => this.progressValueSignal());

  private fakeInterval?: ReturnType<typeof setInterval>;


  setProgressValue(value: number): void {
    this.progressValueSignal.set(value);
  }

  resetProgressValue(): void {
    this.progressValueSignal.set(0);
  }

  startFakeProgress(): void {
    this.resetProgressValue();
    this.progressValueSignal.set(10);

    this.fakeInterval = setInterval(() => {
      const current = this.progressValueSignal();
      if (current < 90) {
        this.progressValueSignal.set(current + Math.floor(Math.random() * 5 + 1)); // +1–5%
      }
    }, 300); // update every 300ms
  }

  completeProgress(): void {
    this.progressValueSignal.set(100);
    if (this.fakeInterval) {
      clearInterval(this.fakeInterval);
      this.fakeInterval = undefined;
    }
  }
}
