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
  image: '', // Logo will be provided as base64 at runtime to avoid multiple network requests
  backgroundOptions: {
    color: PDF_BG_COLOR, // Purple background (#512B84) - matches page background
  } as never,
  dotsOptions: {
    color: '#EB4B62', // Pink/coral dots
    type: 'square' as const
  },
  cornersSquareOptions: {
    color: '#EB4B62', // Pink/coral corner squares
    type: 'square' as const
  },
  cornersDotOptions: {
    color: '#EB4B62', // Pink/coral corner dots
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
    margin: -3, // Space around logo
    imageSize: 0.25, // Logo size (25% of QR code) - safe size for scannability
    hideBackgroundDots: true // Remove border around logo
  },
  margin: 0,
} as Partial<QRCodeOptions>;

// Mauve/light purple background with purple dots and stc logo in center (for A6 size)
export const purpleBgPurpleDotsWithLogoOptions = {
  image: '', // Logo will be provided as base64 at runtime to avoid multiple network requests
  backgroundOptions: {
    color: '#fff', // Light mauve/lavender background
  } as never,
  dotsOptions: {
    color: '#512B84', // Purple dots
    type: 'square' as const
  },
  cornersSquareOptions: {
    color: '#512B84', // Purple corner squares
    type: 'square' as const
  },
  cornersDotOptions: {
    color: '#512B84', // Purple corner dots
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
    margin: -4, // Space around logo
    imageSize: 0.25, // Logo size (25% of QR code) - safe size for scannability
    hideBackgroundDots: true // Remove border around logo
  },
  margin: 0,
} as Partial<QRCodeOptions>;
