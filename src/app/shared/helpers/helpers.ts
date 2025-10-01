import {COMMON_CONSTANTS} from '../constants/common-constants';
import {PrintQRCodeDto} from '../../features/created-locations/models/created-location.model';


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

export const handlePDFSize = (items: PrintQRCodeDto[], isFileName?: boolean) => {
  if (!items.length) return 'A4';

  const currentItemSize = items[0]?.size;
  if (currentItemSize?.includes('A')) {
    return currentItemSize;
  }

  if (currentItemSize?.includes('*') && !isFileName) {
    const dimensions: string[] = currentItemSize?.split('*');

    return {
      width: +dimensions[0] * 72,
      height: +dimensions[1] * 72,
    }
  } else {
    return currentItemSize?.replace('*', 'x');
  }
}

export const displayQrDimension = (pdfSize: string | {width: number; height: number}) => {
  if ((pdfSize as {width: number; height: number})?.width) {
    return 120;
  }

  if ((pdfSize as string).includes('A4')) {
    return 250;
  }

  if ((pdfSize as string).includes('A5')) {
    return 300;
  }

  return 120;
}
