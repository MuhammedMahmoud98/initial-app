import { Routes } from '@angular/router';
import {MAIN_ROUTES} from './shared/enums/shared.enum';
import {thriftGuard} from './core/guards/thrift.guard';
import {  UploadLeaveGuard } from './core/guards/upload-leave.guard';

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
      },
      {
        path: MAIN_ROUTES.ASSIGNED_LOCATION,
        loadComponent: () =>
          import('./features/assigned-locations/assigned-locations.component').then((m) => m.AssignedLocationsComponent)
      },
      {
        path: `${MAIN_ROUTES.CREATED_LOCATIONS}/${MAIN_ROUTES.UPLOAD_FILE}`,
        loadComponent: () => import('./features/upload-file/upload-file.component').then((m) => m.UploadFileComponent),
        canDeactivate: [UploadLeaveGuard],
        data: {
          hideSubHeader: true,
        },
      },
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
