import { environment } from '../../environment/environment';

export const API_CONSTANTS = {
  loginAPI: '/auth/login', // TODO REPLACE WITH YOUR LOGIN API

  IMAGE_HOST: 'https://igateapp.stc.com.sa',
  MYGATE_HOST: environment.mygateHost,
  IGATE_HOST: environment.igateHost,
    NAVIGATION_ITEMS:
    environment.mygateHost + '/header/employees/{email}/nav/items',
  USERS_SEARCH: environment.host + '/v2/private/users/find',
  USER_SERVICE: environment.host + '/v2/private/users/{id}',
  REFRESH_TOKEN: `${environment.host}/v3/public/auth/refresh_token`,
  VALIDATE_TOKEN: `${environment.host}/v3/public/auth/validate`,
};
