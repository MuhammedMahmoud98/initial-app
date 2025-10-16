import {COMMON_CONSTANTS} from '../constants/common-constants';
import {PrintQRCodeDto} from '../../features/created-locations/models/created-location.model';


export const isTokenLessUrl: (url: string) => Readonly<boolean> = (url: string): boolean => {
  return COMMON_CONSTANTS.TOKEN_LESS_URLS.some(tokenLessUrl => url.endsWith(tokenLessUrl));
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
    return 150;
  }

  if ((pdfSize as string).includes('A4')) {
    return 370;
  }

  if ((pdfSize as string).includes('A5')) {
    return 280;
  }

  return 120;
}

export const UTCDate = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export const getPdfSize = (items: PrintQRCodeDto[]) => {
  return items[0]?.size ?? '-';
}

export const handleSTCLogoDimension = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return {
      width: 84,
      height: 42,
    }
  }

  if (currentSize?.includes('A5')) {
    return {
      width: 65,
      height: 35,
    }
  }

  if (currentSize.includes('*')) {
    return {
      width: 60,
      height: 30,
    }
  }

  return {
    width: 60,
    height: 30,
  }
}

export const handleQRTopMargin = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 10;
  }

  if (currentSize?.includes('A5')) {
    return 35;
  }

  if (currentSize.includes('*')) {
    return 0;
  }

  return 0;
}

export const handleTextFontSize = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
      return 40;
  }

  if (currentSize?.includes('A5')) {
    return 20;
  }

  if (currentSize.includes('*')) {
    return 12;
  }

  return 12;
}

export const handleFooterFontSize= (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 30;
  }

  if (currentSize?.includes('A5')) {
    return 18;
  }

  if (currentSize.includes('*')) {
    return 12;
  }

  return 12;
}

export const handleLineSeparatorWidth = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 500;
  }

  if (currentSize?.includes('A5')) {
    return 350;
  }

  if (currentSize.includes('*')) {
    return 300;
  }

  return 300;
}

export const handleIconsWidth = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 25;
  }

  if (currentSize?.includes('A5')) {
    return 20;
  }

  if (currentSize.includes('*')) {
    return 12;
  }

  return 12;
}


export const handleIconTopMargin = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 17;
  }

  if (currentSize?.includes('A5')) {
    return 8;
  }

  if (currentSize.includes('*')) {
    return 4;
  }

  return 4;
}
