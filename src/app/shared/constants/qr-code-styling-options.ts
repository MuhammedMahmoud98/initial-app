import {QRCodeOptions} from '../models/qr-code-styling.model';
import {PDF_BG_COLOR} from './common-constants';

export const whiteQRwithSharpCornersOptions = {
  image: '',
  backgroundOptions: {
    color: PDF_BG_COLOR,
  } as never,
  dotsOptions: {
    color: '#fff',
    type: 'square' as const
  },
  cornersSquareOptions: {
    color: '#fff',
    type: 'square' as const
  },
  cornersDotOptions: {
    color: '#fff',
    type: 'square' as const
  },
  qrOptions: {
    margin: 0,
    typeNumber: 12,
    mode: 'Byte',
    errorCorrectionLevel: 'Q' as const,
    quietZone: 0,
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 0, // Space around logo
    imageSize: 0 // Logo size (40% of QR code)
  },
  margin: 0,
} as Partial<QRCodeOptions>;
