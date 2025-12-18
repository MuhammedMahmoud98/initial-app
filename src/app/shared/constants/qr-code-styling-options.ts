import { QRCodeOptions } from '../models/qr-code-styling.model';
import { PDF_BG_COLOR } from './common-constants';

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

// Purple background with pink dots and stc logo in center
export const pinkBgPurpleDotsWithLogoOptions = {
  image: 'assets/images/svg-logo.svg',
  backgroundOptions: {
    color: PDF_BG_COLOR, // Purple background (#512B84) - matches page background
  } as never,
  dotsOptions: {
    color: '#FF375E', // Pink/coral dots
    type: 'square' as const
  },
  cornersSquareOptions: {
    color: '#FF375E', // Pink/coral corner squares
    type: 'square' as const
  },
  cornersDotOptions: {
    color: '#FF375E', // Pink/coral corner dots
    type: 'square' as const
  },
  qrOptions: {
    margin: 0,
    typeNumber: 0, // Auto-calculate based on data length
    mode: 'Byte',
    errorCorrectionLevel: 'H' as const, // Highest error correction (30%) for logo overlay
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 0, // Space around logo
    imageSize: 0.25 // Logo size (25% of QR code) - safe size for scannability
  },
  margin: 0,
} as Partial<QRCodeOptions>;
