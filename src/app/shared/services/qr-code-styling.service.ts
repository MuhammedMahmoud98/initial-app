import { Injectable } from '@angular/core';
import {QRCodeOptions} from '../models/qr-code-styling.model';
import QRCodeStyling from 'qr-code-styling';

@Injectable({
  providedIn: 'root'
})
export class QrCodeStylingService {
  async generateQRCodePNG(data: string, options?: Partial<QRCodeOptions>, hideLogo?: boolean): Promise<string> {
    const defaultOptions = {
      width: 280,
      height: 280,
      type: 'svg' as const,
      data: data,
      image: 'assets/images/svg-logo.svg',
      dotsOptions: {
        color: '#000000',
        type: 'rounded' as const
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'extra-rounded' as const
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'dot' as const
      },
      backgroundOptions: {
        color: '#ffffff',
        margin: 0,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10, // Space around logo
        imageSize: 0.4 // Logo size (40% of QR code)
      },
    } as Partial<QRCodeOptions>;

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      imageOptions: {
        ...(defaultOptions.imageOptions || {}),
        ...(options?.imageOptions || {})
      },
      qrOptions: {
        ...(defaultOptions.qrOptions || {}),
        ...(options)?.qrOptions || {}
      }
    } as Partial<QRCodeOptions>;

    if (hideLogo) {
      delete (mergedOptions)?.image;
      mergedOptions.imageOptions = {
        ...(mergedOptions.imageOptions || {}),
        imageSize: 0,
        hideBackgroundDots: true
      };
    }

    const qrCode = new QRCodeStyling({
      ...mergedOptions
    });


    const blob = await qrCode.getRawData('png');
    if (!blob) throw new Error('Failed to generate QR code');

    // Convert Blob to Base64
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob as never);
    });
  }
}
