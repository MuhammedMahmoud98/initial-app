import {COMMON_CONSTANTS} from '../constants/common-constants';


export const isTokenLessUrl: (url: string) => Readonly<boolean> = (url: string): boolean => {
  return COMMON_CONSTANTS.TOKEN_LESS_URLS.some(tokenLessUrl => url.includes(tokenLessUrl));
}

export const genericCasting = <T>(item: unknown): T => item as T;

export const isEqualObjects = (obj1: never, obj2: never): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(k => obj1[k] === obj2[k]);
}
