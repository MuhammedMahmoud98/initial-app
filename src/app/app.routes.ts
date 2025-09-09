import { Routes } from '@angular/router';
import {MAIN_ROUTES} from './shared/enums/shared.enum';

export const routes: Routes = [
  {
    path: '',
    canActivate: [],
    children: [
      {
        path: '',
        redirectTo: MAIN_ROUTES.CREATED_LOCATIONS,
        pathMatch: 'full',
      },
      {
        path: MAIN_ROUTES.CREATED_LOCATIONS,
        loadComponent: () =>
          import(
            './features/created-locations/created-locations.component'
          ).then((m) => m.CreatedLocationsComponent),
      },


    ],
  },

  { path: '**', redirectTo: '/' },
];
