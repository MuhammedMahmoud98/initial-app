import {Gradient, TypeNumber} from 'qr-code-styling';
import {ErrorCorrectionLevel, Mode} from 'qr-code-styling/lib/types';

export interface QRCodeOptions {
  width: number;
  height: number;
  type: 'svg' | 'canvas';
  data: string;
  margin?: number;
  image?: string;
  qrOptions?: {
    errorCorrectionLevel?: ErrorCorrectionLevel;
    margin?: number;
    typeNumber?: TypeNumber;
    mode?: Mode;
    quietZone?: number;
  };
  dotsOptions: {
    color: string;
    type: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    gradient?: Gradient;
  };
  cornersSquareOptions: {
    color: string;
    type: 'dot' | 'square' | 'extra-rounded';
  };
  cornersDotOptions: {
    color: string;
    type: 'dot' | 'square';
  };
  backgroundOptions?: {
    color: string;
  };
  imageOptions?: {
    crossOrigin?: string;
    margin?: number;
  };
}
