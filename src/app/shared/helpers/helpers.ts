import {COMMON_CONSTANTS} from '../constants/common-constants';
import {PrintQRCodeDto} from '../../features/created-locations/models/created-location.model';
import {LOCATION_TYPE_CATEGORIES} from '../enums/shared.enum';


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

function cmToPt(cm: number): number {
  return cm * 28.3464567;
}

export const handlePDFSize = (items: PrintQRCodeDto[], isFileName?: boolean) => {
  if (!items.length) return 'A4';

  const currentItemSize = items[0]?.size;
  console.log(currentItemSize, 'currentItemSize');
  if (currentItemSize?.includes('A')) {
    return currentItemSize;
  }

  if (currentItemSize?.includes('x') && !isFileName) {
    const dimensions: string[] = currentItemSize?.split('x');

    return {
      width: cmToPt(+dimensions[0]),
      height: cmToPt(+dimensions[1]),


    }
  } else {
    return currentItemSize?.replace('*', 'x');
  }
}

export const displayQrDimension = (pdfSize: string | {width: number; height: number}) => {
  if ((pdfSize as {width: number; height: number})?.width) {
    return 60;
  }

  if ((pdfSize as string).includes('A4')) {
    return 370;
  }

  if ((pdfSize as string).includes('A5')) {
    return 280;
  }

  if ((pdfSize as string).includes('A6')) {
    return 100;
  }

  if ((pdfSize as string).includes('6x9')) {
    return 60;
  }

  return 20;
}

export const displayTypeNumber = (pdfSize: string | {width: number; height: number}) => {
  if ((pdfSize as {width: number; height: number})?.width) {
    return 12;
  }

  if ((pdfSize as string).includes('A4')) {
    return 7;
  }

  if ((pdfSize as string).includes('A5')) {
    return 7;
  }

  if ((pdfSize as string).includes('A6')) {
    return 7;
  }

  return 7;
}

export const UTCDate = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export const getPdfSize = (items: PrintQRCodeDto[]) => {
  return items[0]?.size ?? '-';
}

export const getPdfCategory = (items: PrintQRCodeDto[]) => {
  return items[0]?.category ?? '';
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

  if (currentSize?.includes('A6')) {
    return {
      width: 55,
      height: 27,
    }
  }

  if (currentSize.includes('6x9')) {
    return {
      width: 30,
      height: 16,
    }
  }

  if (currentSize.includes('*')) {
    return {
      width: 20,
      height: 10,
    }
  }

  return {
    width: 20,
    height: 10,
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

  if (currentSize?.includes('A6')) {
    return 35;
  }

  if (currentSize.includes('6x9')) {
    return 35;
  }

  if (currentSize.includes('*')) {
    return 2;
  }

  return 0;
}

export const handleQRBottomMargin = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 25;
  }

  if (currentSize?.includes('A5')) {
    return 25;
  }

  if (currentSize?.includes('A6')) {
    return 15;
  }

  if (currentSize.includes('6x9')) {
    return 25;
  }

  if (currentSize.includes('*')) {
    return 4;
  }

  return 4;
}

export const handleTextFontSize = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
      return 40;
  }

  if (currentSize?.includes('A5')) {
    return 20;
  }

  if (currentSize?.includes('A6')) {
    return 13;
  }

  if (currentSize.includes('6x9')) {
    return 12;
  }

  if (currentSize.includes('*')) {
    return 5;
  }

  return 5;
}

export const handleFooterFontSize= (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);


  if (currentSize?.includes('A4')) {
    return 30;
  }

  if (currentSize?.includes('A5')) {
    return 18;
  }

  if (category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return 9;
    }
    if (currentSize?.includes('6x9') ) {
      return 5;
    }
  }


  if (currentSize.includes('6x9')) {
    return 5;
  }

  if (currentSize.includes('*')) {
    return 5;
  }

  return 5;
}

export const handleLineSeparatorWidth = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 500;
  }

  if (currentSize?.includes('A5')) {
    return 350;
  }

  if (currentSize?.includes('A6')) {
    return 250;
  }

  if (currentSize.includes('6x9')) {
    return 75;
  }

  if (currentSize.includes('*')) {
    return 110;
  }

  return 110;
}

export const handleIconsWidth = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);

  if (currentSize?.includes('A4')) {
    return 25;
  }

  if (currentSize?.includes('A5')) {
    return 20;
  }

  if(category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return 14;
    }
    if (currentSize?.includes('6x9') ) {
      return 10;
    }
  }

  if (currentSize.includes('6x9')) {
    return 6;
  }

  if (currentSize.includes('*')) {
    return 5;
  }

  return 5;
}


export const handleIconTopMargin = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);



  if (currentSize?.includes('A4')) {
    return 17;
  }

  if (currentSize?.includes('A5')) {
    return 8;
  }

  if (category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return 0;
    }
    if (currentSize?.includes('6x9') ) {
      return 0;
    }
  }

  if (currentSize.includes('6x9')) {
    return 2;
  }

  if (currentSize.includes('*')) {
    return 3;
  }

  return 3;
}

export const handlePhoneIconTopMargin = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 17;
  }

  if (currentSize?.includes('A5')) {
    return 8;
  }

  if (currentSize?.includes('A6')) {
    return 8;
  }

  if (currentSize.includes('6x9')) {
    return 3;
  }

  if (currentSize.includes('*')) {
    return 3;
  }

  return 3;
}

export const handlePDFMargins  = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return [40, 60, 10, 0];
  }

  if (currentSize?.includes('A5')) {
    return [40, 60, 10, 0];
  }

  if (currentSize?.includes('A6')) {
    return [20, 55, 10, 0];
  }

  if (currentSize.includes('6x9')) {
    return [10, 40, 10, 30];
  }

  if (currentSize.includes('*')) {
    return [15, 20, 10, 0];
  }

  return [15, 20, 10, 0];
}

export const handleLogoMargins  = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return [40, 10, 0, 0];
  }

  if (currentSize?.includes('A5')) {
    return [40, 10, 0, 0];
  }

  if (currentSize?.includes('A6')) {
    return [20, 15, 0, 0];
  }

  if (currentSize.includes('6x9')) {
    return [10, 10, 0, 0];
  }

  if (currentSize.includes('*')) {
    return [15, 5, 0, 0];
  }

  return [15, 5, 0, 0];
}

export const handleLineWidth= (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 2;
  }

  if (currentSize?.includes('A5')) {
    return 2;
  }

  if (currentSize.includes('6x9')) {
    return 0.3;
  }

  if (currentSize.includes('*')) {
    return 0.3;
  }

  return 1;
}

export const handleLineMargins= (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return [0, 10, 0, 10];
  }

  if (currentSize?.includes('A5')) {
    return [0, 10, 0, 10];
  }

  if (currentSize.includes('6x9')) {
    return [0, 10, 0, 10];
  }

  if (currentSize.includes('*')) {
    return [0, 4, 0, 4];
  }

  return [0, 4, 0, 4];
}


export const getUniqueServiceBottomMargin= (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 15;
  }

  if (currentSize?.includes('A5')) {
    return 15;
  }

  if (currentSize.includes('6x9')) {
    return 5;
  }

  if (currentSize.includes('*')) {
    return 2;
  }

  return 2;
}

export const handleFooterTextRightMargin= (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);

  if (currentSize?.includes('A4')) {
    return 10;
  }

  if (currentSize?.includes('A5')) {
    return 10;
  }

  if(category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return 0;
    }
    if (currentSize?.includes('6x9') ) {
      return 0;
    }
  }

  if (currentSize.includes('6x9')) {
    return -4;
  }

  if (currentSize.includes('*')) {
    return 4;
  }

  return 4;
}

export const handleTextMarginBottom = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);

  if (currentSize?.includes('A4')) {
    return 5;
  }

  if (currentSize?.includes('A5')) {
    return 5;
  }

  if (currentSize?.includes('A6')) {
    return 2;
  }

  if (currentSize.includes('6x9')) {
    return 4;
  }

  if (currentSize.includes('*')) {
    return 1;
  }

  return 1;
}

export const handleMiddleSpacing = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);

  if (currentSize?.includes('A4')) {
    return 50;
  }

  if (currentSize?.includes('A5')) {
    return 30;
  }

  if(category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return 50;
    }
    if (currentSize?.includes('6x9') ) {
      return 40;
    }
  }



  if (currentSize.includes('6x9')) {
    return 27;
  }

  if (currentSize.includes('*')) {
    return 10;
  }

  return 10;
}

export const handleEmployeeIconWidth = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);


  if (currentSize?.includes('A4')) {
    return 120;
  }

  if (currentSize?.includes('A5')) {
    return 80;
  }

  if (category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return 70;
    }
    if (currentSize?.includes('6x9') ) {
      return 45;
    }
  }

  if (currentSize.includes('6x9')) {
    return 80;
  }

  if (currentSize.includes('*')) {
    return 40;
  }

  return 40;
}

export const handleEmployeeIconPosition = (items: PrintQRCodeDto[]) => {
  const currentSize = getPdfSize(items);
  const category = getPdfCategory(items);


  if (currentSize?.includes('A4')) {
    return { x: 300, y: 550 };
  }

  if (currentSize?.includes('A5')) {
    return { x: 200, y: 380 };
  }

  if (category === LOCATION_TYPE_CATEGORIES.GENERAL_LOCATION) {
    if (currentSize?.includes('A6') ) {
      return { x: 205, y: 280 };
    }
    if (currentSize?.includes('6x9') ) {
      return { x: 110, y: 165 };
    }
  }

  if (currentSize.includes('6x9')) {
    return { x: 80, y: 170 };
  }

  if (currentSize.includes('*')) {
    return { x: 50, y: 100 };
  }

  return { x: 50, y: 100 };
}
