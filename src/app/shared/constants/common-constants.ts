import {TokenLessUrls} from '../types/common-types.model';

export const COMMON_CONSTANTS = {
    TOASTER_LIFE_TIME: 5000,
    SEARCH_TYPING_LENGTH: 3,
    SEARCH_RESET_LENGTH: 0,
    SEARCH_MAX_LENGTH: 20,
    TOKEN_LESS_URLS: ['validate', 'refresh_token'] as TokenLessUrls[],
}



export const SQL_INJECTION_PATTERNS: RegExp[] = [
  /('|(\\')|(;)|(\\;)|(--|#|\/\*|\*\/))/gi,
  /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi
];

export const XSS_PATTERNS: RegExp[] = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<[^>]+>/g,
  /&lt;script/gi,
  /&lt;iframe/gi
];
