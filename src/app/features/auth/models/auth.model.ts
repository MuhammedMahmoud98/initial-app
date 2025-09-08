export interface AuthCredentials {
  'access-token'?: string;
  'refresh-token'?: string;
  'user-id'?: number;
  email?: string;
  'expiry-date'?: string | Date
  'token-type'?: string;
  'bi-enabled'?: boolean;
  authorization?: string;
  'igate-refresh-token'?: string;
}

export interface ValidatePayload {
  'access-token': string;
}

export interface ValidateResponse {
  scope:       string;
  username:    string;
  name:        string;
  'expire-at': string;
  'user-id':   string;
}

export interface RefreshTokenPayload {
  'refresh-token': string;
  'igate-refresh-token': string;
}

export interface RefreshTokenResponse {
  'access-token': string;
  'refresh-token': string;
  'igate-refresh-token': string;
  authorization: string;
}

