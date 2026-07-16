import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import {AppComponent} from './app.component';

(async () => {
  const app = await createApplication({
    providers: [
      // any providers your component needs: HttpClient, routing, etc.
    ],
  });

  const element = createCustomElement(AppComponent, { injector: app.injector });
  customElements.define('app-widget', element);
})();
