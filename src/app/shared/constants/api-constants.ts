import { environment } from '../../environment/environment';

const serverUrl = environment.host + '/v1/private/hub-locations'

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
  // LOCATIONS
  CREATED_LOCATIONS: serverUrl + '/locations',
  DELETE_LOCATIONS: serverUrl + '/locations/delete',
  BULK_UPLOAD_LOCATIONS: serverUrl + '/locations/bulk-upload',
  UPDATE_LOCATIONS: serverUrl + '/locations/{id}',
  // LOCATION TYPES
  LOCATION_TYPES: serverUrl + '/location-types',
  LOCATION_TYPE_SERVICES: serverUrl + '/location-types/{id}/service/{serviceId}',
  CREATE_LOCATION_TYPE: serverUrl + '/location-types',
  UPDATE_LOCATION_TYPE: serverUrl + '/location-types/{id}',
  DELETE_LOCATION_TYPE: serverUrl + '/location-types/{id}',
  // assignedLocation
  ASSIGNED_LOCATIONS: serverUrl + '/user-locations',
  ASSIGNED_LOCATIONS_UNLINK: serverUrl + '/user-locations/{id}/unlink',
  // QR
  GENERATE_QR: serverUrl + '/qr/generate-qr',
  PRINT_QR: serverUrl + '/qr/print-qr',
  VALIDATE_QR_PRINT: serverUrl + '/qr/validate-print',
  LINK_VALIDATE_QR: `${environment.host}/v1/private/eforms/validate/qr-code-link`,
  //Download Template
  DOWNLOAD_TEMPLATE: serverUrl + '/locations/upload/template',
  UPLOAD_TEMPLATE: serverUrl + '/locations/upload',
  CREATE_LOCATION_BY_FILEID: serverUrl + '/locations/upload/preview',
  DISCARD_LOCATION_BY_FILEID: serverUrl + '/locations/upload/discard',
  SAVE_LOCATION_BY_FILEID: serverUrl + '/locations/upload/save',

};
