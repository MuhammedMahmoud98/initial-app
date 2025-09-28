import { Routes } from '@angular/router';
import {MAIN_ROUTES} from './shared/enums/shared.enum';
import {thriftGuard} from './core/guards/thrift.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [thriftGuard],
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
      {
        path: MAIN_ROUTES.LOCATION_TYPES,
        loadComponent: () =>
          import(
            './features/location-types/location-types.component'
          ).then((m) => m.LocationTypesComponent)
      }
    ],
  },
  {
    path: 'un-authorized',
    loadComponent: () =>
      import(
        './features/auth/components/not-authorized/not-authorized.component'
        ).then((m) => m.NotAuthorizedComponent),
  },
  { path: '**', redirectTo: '/' },
];
