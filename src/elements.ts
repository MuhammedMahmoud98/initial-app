import { enableProdMode } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';

import { appConfig } from './app/app.config';
import { environment } from './app/environment/environment';

if (environment.production) {
  enableProdMode();
}

(async () => {
  try {
    // Spins up an Angular application context (DI, zone, etc.) without any NgModule.
    const app = await createApplication(appConfig);

    const { AppComponent } = await import('./app/app.component');

    const tagName = 'app-root';
    if (!customElements.get(tagName)) {
      const element = createCustomElement(AppComponent, { injector: app.injector });
      customElements.define(tagName, element);
      console.log(`Registered custom element: ${tagName}`);
    }

    // Optional: register additional standalone components the same way
    // const { WidgetComponent } = await import('./app/widget/widget.component');
    // if (!customElements.get('app-widget')) {
    //   customElements.define('app-widget', createCustomElement(WidgetComponent, { injector: app.injector }));
    // }
  } catch (err) {
    console.error('Failed to bootstrap Angular Elements:', err);
  }
})();
