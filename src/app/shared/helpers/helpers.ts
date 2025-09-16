import {COMMON_CONSTANTS} from '../constants/common-constants';


export const isTokenLessUrl: (url: string) => Readonly<boolean> = (url: string): boolean => {
  return COMMON_CONSTANTS.TOKEN_LESS_URLS.some(tokenLessUrl => url.includes(tokenLessUrl));
}

export const genericCasting = <T>(item: unknown): T => item as T;
