import {inject, Injectable} from '@angular/core';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {PrintQRCodeDto} from '../../features/created-locations/models/created-location.model';
import {
  displayQrDimension, displayTypeNumber, getUniqueServiceBottomMargin,
  handleEmployeeIconPosition,
  handleEmployeeIconWidth,
  handleFooterFontSize, handleFooterTextRightMargin, handleIconsWidth, handleIconTopMargin,
  handleLineMargins, handleLineSeparatorWidth, handleLineWidth,
  handleLogoMargins, handleMiddleSpacing, handlePDFMargins,
  handlePDFSize, handlePhoneIconTopMargin, handleQRBottomMargin,
  handleQRTopMargin,
  handleSTCLogoDimension, handleTextFontSize, handleTextMarginBottom
} from '../../shared/helpers/helpers';
import {environment} from '../../environment/environment';
import {DatePipe} from '@angular/common';
import {QrCodeStylingService} from '../../shared/services/qr-code-styling.service';
import {whiteQRwithSharpCornersOptions, pinkBgPurpleDotsWithLogoOptions, purpleBgPurpleDotsWithLogoOptions } from '../../shared/constants/qr-code-styling-options';

@Injectable({
  providedIn: 'root',
})
export class PdfMakerService {
  readonly #datePipe: DatePipe = inject(DatePipe);
  readonly #qrCodeStylingService: QrCodeStylingService = inject(QrCodeStylingService);
  // Cached pdfMake instance and initializer promise to avoid repeated font fetches
  private pdfMakeInstance: unknown | null = null;
  private pdfMakePromise: Promise<unknown> | null = null;
  private readonly FONT_KEY = 'STCForward-Regular.ttf.base64';
  private readonly FONT_KEY_MEDIUM = 'STCForward-Medium.ttf.base64';
  private employeeLocationSvg: string | null = null;
  private mobileSvg: string | null = null;
  private stcPurpleLogoBase64: string | null = null;
  private svgLogoBase64: string | null = null;

  // protected async initializePdfMake() {
  //   const pdfMakeModule = await import('pdfmake/build/pdfmake');
  //   const pdfFonts = await import('pdfmake/build/vfs_fonts');
  //
  //   const pdfMake = pdfMakeModule.default || pdfMakeModule; // clone to make it extensible
  //   (pdfMake as unknown as { vfs: object }).vfs = pdfFonts.vfs || (pdfFonts as unknown as {pdfMake: {vfs: object}}).pdfMake?.vfs;
  //
  //   const fontUrl = '/assets/layouts/fonts/STCForward-Regular.ttf';
  //   const response = await fetch(fontUrl);
  //   const fontData = await response.arrayBuffer();
  //
  //   console.log((pdfMake as any).vfs, 'VFS VFS VFS');
  //
  //   (pdfMake as any).vfs['STCForward-Regular.ttf'] = this.arrayBufferToBase64(fontData);
  //
  //   // 6️⃣ Register the font family
  //   (pdfMake as any).fonts = {
  //     ...((pdfMake as any).fonts || {}),
  //     STCFont: {
  //       normal: 'STCForward-Regular.ttf',
  //       bold: 'STCForward-Regular.ttf',
  //       italics: 'STCForward-Regular.ttf',
  //       bolditalics: 'STCForward-Regular.ttf',
  //     },
  //   };
  //
  //   return pdfMake;
  // }

    public warmUpPdfMake(): void {
      // fire-and-forget; subsequent calls to generatePdfSingleColumn will await the same promise
      console.log('%cFONT WARM UP', 'color: yellow');
      void this.initializePdfMake();
    }

    private async loadEmployeeLocationSvg(): Promise<string> {
      if (this.employeeLocationSvg) {
        return this.employeeLocationSvg;
      }

      const svgUrl = `${environment.baseHref}${environment.production ? '/' : ''}assets/images/employee-location.svg`;
      const response = await fetch(svgUrl);
      if (!response.ok) throw new Error(`SVG not found at ${svgUrl}`);
      this.employeeLocationSvg = await response.text();
      return this.employeeLocationSvg;
    }

    private async loadMobileSvg(): Promise<string> {
      if (this.mobileSvg) {
        return this.mobileSvg;
      }

      const svgUrl = `${environment.baseHref}${environment.production ? '/' : ''}assets/images/mobile.svg`;
      const response = await fetch(svgUrl);
      if (!response.ok) throw new Error(`SVG not found at ${svgUrl}`);
      this.mobileSvg = await response.text();
      return this.mobileSvg;
    }

    private async loadStcPurpleLogoBase64(): Promise<string> {
      if (this.stcPurpleLogoBase64) {
        return this.stcPurpleLogoBase64;
      }

      const logoUrl = `${environment.baseHref}${environment.production ? '/' : ''}assets/images/stc-purple-logo.svg`;
      const response = await fetch(logoUrl);
      if (!response.ok) throw new Error(`Logo not found at ${logoUrl}`);
      const blob = await response.blob();

      // Convert to base64
      this.stcPurpleLogoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return this.stcPurpleLogoBase64;
    }

    private async loadSvgLogoBase64(): Promise<string> {
      if (this.svgLogoBase64) {
        return this.svgLogoBase64;
      }

      const logoUrl = `${environment.baseHref}${environment.production ? '/' : ''}assets/images/svg-logo.svg`;
      const response = await fetch(logoUrl);
      if (!response.ok) throw new Error(`Logo not found at ${logoUrl}`);
      const blob = await response.blob();

      // Convert to base64
      this.svgLogoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return this.svgLogoBase64;
    }

    protected async initializePdfMake(): Promise<unknown> {
      // Return cached instance when available
      if (this.pdfMakeInstance) return this.pdfMakeInstance;
      // If initialization is already in progress, return the same promise to serialize work
      if (this.pdfMakePromise) return this.pdfMakePromise;

      this.pdfMakePromise = (async () => {
        const pdfMakeModule = await import('pdfmake/build/pdfmake');
        const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

        const pdfMake = (pdfFontsModule as unknown as {pdfMake : unknown}).pdfMake || pdfMakeModule.default || pdfMakeModule;

        (pdfMake as unknown as {vfs: unknown}).vfs = (pdfMake as unknown as {vfs: unknown}).vfs || {};

        // Try to reuse cached base64 font from localStorage (best-effort)
        let base64Font: string | null = null;
        try {
          base64Font = localStorage.getItem(this.FONT_KEY);
        } catch (e) {
          console.log(e);
          base64Font = null; // localStorage may be unavailable in some environments
        }

        if (!base64Font) {
          const fontUrl = `${environment.baseHref}${environment.production ? '/': ''}assets/layouts/fonts/STCForward-Regular.ttf`;
          const response = await fetch(fontUrl, { cache: 'force-cache' });
          if (!response.ok) throw new Error(`Font not found at ${fontUrl}`);
          const fontData = await response.arrayBuffer();
          // Prefer the async conversion to avoid expensive synchronous work
          try {
            base64Font = await this.arrayBufferToBase64Async(fontData);
          } catch (e) {
            console.log(e);
            // Fallback to synchronous conversion if FileReader fails for any reason
            base64Font = this.arrayBufferToBase64(fontData);
          }
          // Persist to localStorage for faster next loads (best-effort)
          try { localStorage.setItem(this.FONT_KEY, base64Font); } catch (e) {
            console.log(e);
          }
        }

      (pdfMake as unknown as {vfs: Record<string, string>}).vfs['STCForward-Regular.ttf'] = base64Font;

      // Load Medium font
      let base64FontMedium: string | null = null;
      try {
        base64FontMedium = localStorage.getItem(this.FONT_KEY_MEDIUM);
      } catch (e) {
        console.log(e);
        base64FontMedium = null;
      }

      if (!base64FontMedium) {
        const fontUrlMedium = `${environment.baseHref}${environment.production ? '/': ''}assets/layouts/fonts/STCForward-Medium.ttf`;
        const responseMedium = await fetch(fontUrlMedium, { cache: 'force-cache' });
        if (!responseMedium.ok) throw new Error(`Font not found at ${fontUrlMedium}`);
        const fontDataMedium = await responseMedium.arrayBuffer();
        try {
          base64FontMedium = await this.arrayBufferToBase64Async(fontDataMedium);
        } catch (e) {
          console.log(e);
          base64FontMedium = this.arrayBufferToBase64(fontDataMedium);
        }
        try { localStorage.setItem(this.FONT_KEY_MEDIUM, base64FontMedium); } catch (e) {
          console.log(e);
        }
      }

      (pdfMake as unknown as {vfs: Record<string, string>}).vfs['STCForward-Medium.ttf'] = base64FontMedium;

      // Define the font family
      (pdfMake as unknown as {fonts: unknown}).fonts = {
        ...(pdfMake as unknown as {fonts: unknown}).fonts || {},
        STCFont: {
          normal: 'STCForward-Regular.ttf',
          bold: 'STCForward-Regular.ttf',
          italics: 'STCForward-Regular.ttf',
          bolditalics: 'STCForward-Regular.ttf',
        },
        STCFontMedium: {
          normal: 'STCForward-Medium.ttf',
          bold: 'STCForward-Medium.ttf',
          italics: 'STCForward-Medium.ttf',
          bolditalics: 'STCForward-Medium.ttf',
        },
      };

        this.pdfMakeInstance = pdfMake;
        console.log('%cFONT WARM UP', 'color: orange');
        return pdfMake;
      })();

      try {
        return await this.pdfMakePromise;
      } finally {
        // Keep instance cached; clear the transient promise so future calls use cached instance
        this.pdfMakePromise = null;
      }
    }



  async generatePdfSingleColumn(records: PrintQRCodeDto[]) {
    const pdfMake = await this.initializePdfMake();

    console.log(pdfMake, 'PDF MAKE');
    const content: unknown[] = [];

    // Add each QR code
    for (const [index, record] of records.entries()) {
      // Generate at 5x resolution for maximum sharpness
      const qrResolutionMultiplier = 5;
      const qrDisplaySize = displayQrDimension(handlePDFSize(records) as never);
      const qrGenerationSize = qrDisplaySize * qrResolutionMultiplier;
      const qrImage = await this.#qrCodeStylingService.generateQRCodePNG(
        `${environment.qrCodeUrl}/qr-guest/user-guest/${record.qrCode}`, {
          ...whiteQRwithSharpCornersOptions,
          width: qrGenerationSize,
          height: qrGenerationSize,
          qrOptions: {
            ...whiteQRwithSharpCornersOptions.qrOptions,
            typeNumber: displayTypeNumber(handlePDFSize(records) as never),
          }
        },
      );
      const qrDisplayWidth = qrDisplaySize;
      const qrDisplayHeight = qrDisplaySize;

      content.push({
        stack: [
          {
            text: [
              { text: 'scan!', color: '#FF375E' },  // Color for "scan!"
              { text: ' your gateway', color: 'white' }  // Color for rest of text
            ],
            color: '#fff',
            style: 'qrSubtext',
            alignment: 'start',
            bold: true,
            fontSize: handleTextFontSize(records),
            margin: [0, records[0]?.size === 'A4' ? 60: 0, 0, handleTextMarginBottom(records)],
            font: 'STCFont'  // ✅ Add font property here
          },
          {
            text: 'to unique services',  // Second line
            style: 'qrSubtext',
            alignment: 'start',
            bold: true,
            color: '#fff',
            fontSize: handleTextFontSize(records),
            margin: [0, 0, 0, getUniqueServiceBottomMargin(records)],  // Bottom margin before QR code
            font: 'STCFont'  // ✅ Add font property here
          },
          {
            // qr: `${environment.qrCodeUrl}/qr-guest/user-guest/${record.qrCode}`,
            image: qrImage,
            width: qrDisplayWidth,
            height: qrDisplayHeight,
            alignment: 'start',
            // alignment: 'start',
            // foreground: '#000',
            // fit: displayQrDimension(handlePDFSize(records) as never),
            margin: [0, handleQRTopMargin(records), 0, handleQRBottomMargin(records)],  // Bottom margin before QR code
          },
          {
            columns: [
              {
                // Location pin icon using text/symbol
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="38" viewBox="0 0 26 38" fill="none">\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M13.0711 34.5532C15.7251 29.0632 19.5591 23.9342 22.2921 18.5282C24.3961 14.3642 24.7431 10.0062 21.7871 6.10116C14.0721 -4.09084 -3.08289 5.01816 3.46211 18.2052L13.0711 34.5532ZM11.5891 0.169156C21.7981 -0.925844 28.6391 9.28416 24.2061 18.5282C21.3031 24.5802 16.7761 30.4832 13.7571 36.5532C13.2831 37.2652 12.6261 37.2652 12.1521 36.5532C9.19711 30.3462 4.27211 24.2132 1.45911 18.0542C-2.18589 10.0742 2.90211 1.10016 11.5891 0.169156Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M18.4367 12.6277H17.7157C17.7157 13.9537 17.1807 15.1467 16.3117 16.0167C15.4427 16.8847 14.2487 17.4197 12.9237 17.4197C11.5977 17.4197 10.4047 16.8847 9.53471 16.0167C8.66671 15.1467 8.13171 13.9537 8.13171 12.6277C8.13171 11.3027 8.66671 10.1087 9.53471 9.2387C10.4047 8.3707 11.5977 7.8357 12.9237 7.8357C14.2487 7.8357 15.4427 8.3707 16.3117 9.2387C17.1807 10.1087 17.7157 11.3027 17.7157 12.6277H18.4367H19.1577C19.1577 10.9087 18.4587 9.3457 17.3317 8.2197C16.2057 7.0927 14.6427 6.3937 12.9237 6.3937C11.2047 6.3937 9.64071 7.0927 8.51571 8.2197C7.38771 9.3457 6.68871 10.9087 6.68971 12.6277C6.68871 14.3467 7.38771 15.9097 8.51571 17.0357C9.64071 18.1627 11.2047 18.8627 12.9237 18.8617C14.6427 18.8627 16.2057 18.1627 17.3317 17.0357C18.4587 15.9097 19.1577 14.3467 19.1577 12.6277H18.4367Z" fill="white"/>\n' +
                  '</svg>',
                width: handleIconsWidth(records),
                margin: [0, handleIconTopMargin(records), 15, 0]  // Negative margin to position over purple box
              },
              {
                stack: [
                  {
                    text: 'location code',
                    color: 'white',
                    fontSize: handleFooterFontSize(records),
                    margin: [handleFooterTextRightMargin(records), 0, 0, handleTextMarginBottom(records)]
                  },
                  {
                    text: record.locationCode,
                    color: '#FF375E',  // Pink/red color
                    fontSize: handleFooterFontSize(records),
                    margin: [handleFooterTextRightMargin(records), 10, 0, 0],
                    maxHeight: 40,
                    lineHeight: 1
                  }
                ],
                width: '*'
              }
            ]
          },
          // White separator line
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: handleLineSeparatorWidth(records),  // Adjust to match purple box width
                y2: 0,
                lineWidth: handleLineWidth(records),
                lineColor: 'white'
              }
            ],
            margin: handleLineMargins(records),
          },
          {
            columns: [
              {
                // Location phone icon using text/symbol
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 31 31" fill="none">\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M25.7665 27.5223C24.8545 28.4343 23.6675 28.8863 22.4675 28.8863C21.2725 28.8863 20.0855 28.4343 19.1735 27.5223L3.00653 11.3513C2.09453 10.4433 1.64253 9.25227 1.64253 8.05727C1.64253 6.86227 2.09453 5.67427 3.00653 4.76227L3.24653 4.52227L11.1565 12.4333L18.0925 19.3723L26.0025 27.2823L25.7665 27.5223ZM3.24653 3.55127L2.75853 4.03527L2.51953 4.27527C0.431529 6.36227 0.431529 9.75127 2.51953 11.8393L18.6855 28.0063C20.7775 30.0973 24.1625 30.0973 26.2545 28.0063L26.9775 27.2823L3.24653 3.55127Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M25.7665 27.5223C24.8545 28.4343 23.6675 28.8863 22.4675 28.8863C21.2725 28.8863 20.0855 28.4343 19.1735 27.5223L3.00654 11.3513C2.09454 10.4433 1.64254 9.25229 1.64254 8.05729C1.64254 6.86229 2.09454 5.67429 3.00654 4.76229L3.24654 4.52229L11.1565 12.4333L18.0925 19.3723L26.0025 27.2823L25.7665 27.5223ZM27.4645 26.7953L26.9775 26.3113L20.0425 19.3763V19.3723L19.5585 18.8883H19.5545V18.8843L19.0675 18.4013L12.1275 11.4583L11.6405 10.9743L4.21754 3.55129V3.54729L3.73354 3.06429H3.73054L3.24654 2.57629L2.27154 3.55129L2.03154 3.78729C0.856538 4.96729 0.262538 6.51629 0.266538 8.05729C0.262538 9.60229 0.856538 11.1513 2.03154 12.3263L18.2025 28.4933C19.3775 29.6733 20.9265 30.2623 22.4675 30.2623C24.0135 30.2623 25.5625 29.6733 26.7375 28.4933L26.9775 28.2573L27.9485 27.2823L27.4645 26.7953Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M11.1529 10.4868L4.21793 3.55182V3.54782L5.80193 1.96682L11.0779 7.24682C11.5379 7.70682 11.7659 8.30082 11.7659 8.90682C11.7659 9.47682 11.5619 10.0388 11.1529 10.4868ZM11.5659 6.75982L5.80193 0.991821L3.73393 3.06382H3.72993L3.24693 3.55182L11.1569 11.4618L11.5659 11.0488C11.5929 11.0258 11.6169 10.9978 11.6369 10.9708C12.7529 9.78282 12.7259 7.91982 11.5659 6.75982Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M4.21763 3.55151V3.54751L5.80163 1.96751L11.0786 7.24751C11.5386 7.70751 11.7666 8.30051 11.7666 8.90651C11.7666 9.47651 11.5616 10.0385 11.1526 10.4865L4.21763 3.55151ZM12.0536 6.27251L5.80163 0.0205078L3.24663 2.57651L2.27163 3.55151L2.75863 4.03551L3.24663 4.52251L11.1566 12.4325L11.6446 11.9495L12.0536 11.5365C12.0806 11.5095 12.1046 11.4855 12.1276 11.4575C12.8046 10.7465 13.1426 9.81851 13.1426 8.90651C13.1426 7.95451 12.7806 6.99951 12.0536 6.27251Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M26.9775 26.3114L20.0425 19.3764V19.3724C20.4905 18.9634 21.0525 18.7624 21.6225 18.7584C22.2245 18.7624 22.8215 18.9864 23.2815 19.4464L28.5615 24.7274L26.9775 26.3114ZM23.7695 18.9594C22.6095 17.8034 20.7495 17.7764 19.5585 18.8884H19.5545C19.5275 18.9084 19.5035 18.9314 19.4765 18.9594L19.0675 19.3724L26.9775 27.2824L29.5335 24.7274L23.7695 18.9594Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M20.0422 19.3722C20.4902 18.9632 21.0522 18.7632 21.6232 18.7592C22.2242 18.7632 22.8222 18.9872 23.2822 19.4472L28.5622 24.7272L26.9772 26.3112L20.0422 19.3762V19.3722ZM24.2532 18.4762C23.5292 17.7482 22.5742 17.3832 21.6232 17.3832C20.7032 17.3832 19.7792 17.7252 19.0672 18.4012L18.9922 18.4762L18.5792 18.8842L18.0922 19.3722L26.4902 27.7702L26.9772 28.2572L30.5082 24.7272L24.2532 18.4762Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M23.443 14.5678L22.716 13.8408C22.558 12.3508 21.91 10.9038 20.766 9.75985C19.621 8.61985 18.179 7.96685 16.689 7.80985L15.961 7.08185C17.876 7.08185 19.791 7.81385 21.253 9.27585C22.716 10.7348 23.443 12.6488 23.443 14.5678Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M24.131 14.5679H22.755C22.755 14.3239 22.743 14.0839 22.716 13.8409C22.558 12.3509 21.91 10.9039 20.766 9.75986C19.621 8.61986 18.179 7.96686 16.689 7.80986C16.445 7.78186 16.205 7.76986 15.961 7.76986V6.39386C18.049 6.39386 20.144 7.19186 21.741 8.78886C23.333 10.3809 24.135 12.4759 24.131 14.5679Z" fill="white"/>\n' +
                  // eslint-disable-next-line max-len
                  '  <path d="M15.9617 4.02957C18.6607 4.03057 21.3527 5.05657 23.4117 7.11557C25.4707 9.17457 26.4977 11.8666 26.4977 14.5656H27.8737C27.8747 11.5196 26.7097 8.46657 24.3847 6.14257C22.0607 3.81756 19.0077 2.65257 15.9617 2.65357V4.02957Z" fill="white"/>\n' +
                  '</svg>',
                width: handleIconsWidth(records),
                margin: [0, handlePhoneIconTopMargin(records), 15, 0]  // Negative margin to position over purple box
              },
              {
                stack: [
                  {
                    text: 'shared services',
                    color: 'white',
                    fontSize: handleFooterFontSize(records),
                    margin: [handleFooterTextRightMargin(records), 0, 0, handleTextMarginBottom(records)]
                  },
                  {
                    text: '0114599999',
                    color: '#FF375E',  // Pink/red color
                    fontSize: handleFooterFontSize(records),
                    bold: true,
                    margin: [handleFooterTextRightMargin(records), 0, 0, 0]
                  }
                ],
                width: '*'
              }
            ]
          },
        ],
        margin: [0, 0, 0, 0],
        pageBreak: (index < (records.length - 1)) && 'after'
      } as unknown as never);
    };

    const docDefinition = {
      pageSize: handlePDFSize(records), // TODO:: IF SIZE INCLUDES *; RETURN OBJECT WITH WIDTH AND HEIGHT
      pageMargins: handlePDFMargins(records),
      content: content,
      header: function() {
        return {
          // STC LOGO
          // eslint-disable-next-line max-len
          image: 'data:image/png;base64,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', // Replace with your image
          margin: handleLogoMargins(records), // [left, top, right, bottom] - positions in top left
          ...handleSTCLogoDimension(records)
        };
      },
      background: function(currentPage: number, pageSize: {width: number, height: number}) {
        return {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: pageSize?.width,
              h: pageSize?.height,
              color: '#512B84'
            }
          ]
        };
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#2c3e50'
        },
        subheader: {
          fontSize: 14,
          color: '#7f8c8d'
        },
        qrLabel: {
          fontSize: 12,
          margin: [0, 15, 0, 0]
        },
        qrInstruction: {
          fontSize: 11,
          color: '#34495e',
          italics: true
        },
      },
      defaultStyle: {
        font: 'STCFont',
      },
    } as unknown as TDocumentDefinitions;
    // pdfDoc.open();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return pdfMake.createPdf(docDefinition,undefined, undefined, pdfMake.vfs).download(`${handlePDFSize(records, true)} Locations QR Codes - ${this.displayCurrentDate()}`);
  }

  async generatePdfTwoColumns(records: PrintQRCodeDto[]) {
    // Group records by size - pdfMake requires all pages to have the same size
    const recordsBySize = records.reduce((acc, record) => {
      const sizeKey = record.size?.includes('A6') ? 'A6' : 'other';
      if (!acc[sizeKey]) {
        acc[sizeKey] = [];
      }
      acc[sizeKey].push(record);
      return acc;
    }, {} as Record<string, PrintQRCodeDto[]>);

    // Generate a PDF for each size group sequentially
    const sizeGroups = Object.keys(recordsBySize);
    for (const size of sizeGroups) {
      await this.generatePdfForSize(recordsBySize[size]);
      // Add small delay between downloads to prevent browser issues
      if (sizeGroups.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  private async generatePdfForSize(records: PrintQRCodeDto[]) {
    const pdfMake = await this.initializePdfMake();
    const isA6Size = records[0]?.size?.includes('A6') ?? false;
    const illustrationSvg = isA6Size ? await this.loadMobileSvg() : await this.loadEmployeeLocationSvg();
    // Preload logos as base64 to avoid multiple network requests
    const stcPurpleLogoBase64 = await this.loadStcPurpleLogoBase64();
    const svgLogoBase64 = await this.loadSvgLogoBase64();
    const content: unknown[] = [];

    // Use for...of loop to handle async QR code generation
    for (const [index, record] of records.entries()) {

      // Generate styled QR code image - use different styling based on size
      // Generate at 5x resolution for maximum sharpness, pdfmake will scale down for display
      const qrOptions = isA6Size ? purpleBgPurpleDotsWithLogoOptions : pinkBgPurpleDotsWithLogoOptions;
      const qrResolutionMultiplier = 5;
      const qrDisplaySize = displayQrDimension(handlePDFSize(records) as never);
      const qrGenerationSize = qrDisplaySize * qrResolutionMultiplier;
      const qrImage = await this.#qrCodeStylingService.generateQRCodePNG(
        `${environment.qrCodeUrl}/qr-guest/user-guest/${record.qrCode}`, {
          ...qrOptions,
          image: isA6Size ? stcPurpleLogoBase64 : svgLogoBase64,
          width: qrGenerationSize,
          height: qrGenerationSize,
        },
      );

      // Define colors based on size
      const textColor = isA6Size ? '#512B84' : '#fff';
      const iconFillColor = isA6Size ? '#512B84' : 'white';
      const lineColor = isA6Size ? '#512B84' : 'white';

      content.push({
        columns: [
          // Left column - Text and Info
          {
            stack: [
              // Main text section - different text for A6 vs 9x11
              ...(isA6Size ? [
                // A6 text: "scan to enhance the experience!"
                     {
                  text: '',
                margin: [0, 80, 0, 0]
              },
                {
                  text: 'scan to enhance',
                  color: '#512B84',
                  style: 'qrSubtext',
                  alignment: 'start',
                  bold: true,
                  fontSize: 21,
                  margin: [0, 30, 0, 2],
                  font: 'STCFontMedium'
                },
                {
                  text: [
                    { text: 'the ', color: '#512B84', bold: true },
                    { text: 'experience', color: '#FF375E', bold: true },
                    { text: '!', color: '#512B84', bold: true }
                  ],
                  style: 'qrSubtext',
                  alignment: 'start',
                  fontSize: 21,
                  margin: [0, 0, 0, 0],
                  font: 'STCFontMedium'
                },
              ] : [
                // 6x9 text: "everything your workspace needs starts here!"
                {
                  text: '',
                margin: [0, 30, 0, 0]
              },
              {
                text: 'everything your',
                  color: '#fff',
                  style: 'qrSubtext',
                  alignment: 'start',
                  bold: false,
                  fontSize: handleTextFontSize(records),
                  margin: [0, 18, 0, handleTextMarginBottom(records)],
                  font: 'STCFont'
                },
                {
                  text: 'workspace needs',
                  style: 'qrSubtext',
                  alignment: 'start',
                  bold: false,
                  color: '#fff',
                  fontSize: handleTextFontSize(records),
                  margin: [0, 0, 0, handleTextMarginBottom(records)],
                  font: 'STCFont'
                },
                {
                  text: [
                    { text: 'starts ', color: 'white' },
                    { text: 'here', color: '#EB4B62' },
                    { text: '!', color: 'white' }
                  ],
                  style: 'qrSubtext',
                  alignment: 'start',
                  bold: false,
                  fontSize: handleTextFontSize(records),
                  margin: [0, 0, 0, getUniqueServiceBottomMargin(records)],
                  font: 'STCFont'
                },
              ]),
              // Spacer to push footer to bottom
              {
                text: '',
                margin: [0, 0, 0, isA6Size ? 50 : handleMiddleSpacing(records)]
              },
              // Location code section
              {
                columns: [
                  {
                    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="38" viewBox="0 0 26 38" fill="none">
  <path d="M13.0711 34.5532C15.7251 29.0632 19.5591 23.9342 22.2921 18.5282C24.3961 14.3642 24.7431 10.0062 21.7871 6.10116C14.0721 -4.09084 -3.08289 5.01816 3.46211 18.2052L13.0711 34.5532ZM11.5891 0.169156C21.7981 -0.925844 28.6391 9.28416 24.2061 18.5282C21.3031 24.5802 16.7761 30.4832 13.7571 36.5532C13.2831 37.2652 12.6261 37.2652 12.1521 36.5532C9.19711 30.3462 4.27211 24.2132 1.45911 18.0542C-2.18589 10.0742 2.90211 1.10016 11.5891 0.169156Z" fill="${iconFillColor}"/>
  <path d="M18.4367 12.6277H17.7157C17.7157 13.9537 17.1807 15.1467 16.3117 16.0167C15.4427 16.8847 14.2487 17.4197 12.9237 17.4197C11.5977 17.4197 10.4047 16.8847 9.53471 16.0167C8.66671 15.1467 8.13171 13.9537 8.13171 12.6277C8.13171 11.3027 8.66671 10.1087 9.53471 9.2387C10.4047 8.3707 11.5977 7.8357 12.9237 7.8357C14.2487 7.8357 15.4427 8.3707 16.3117 9.2387C17.1807 10.1087 17.7157 11.3027 17.7157 12.6277H18.4367H19.1577C19.1577 10.9087 18.4587 9.3457 17.3317 8.2197C16.2057 7.0927 14.6427 6.3937 12.9237 6.3937C11.2047 6.3937 9.64071 7.0927 8.51571 8.2197C7.38771 9.3457 6.68871 10.9087 6.68971 12.6277C6.68871 14.3467 7.38771 15.9097 8.51571 17.0357C9.64071 18.1627 11.2047 18.8627 12.9237 18.8617C14.6427 18.8627 16.2057 18.1627 17.3317 17.0357C18.4587 15.9097 19.1577 14.3467 19.1577 12.6277H18.4367Z" fill="${iconFillColor}"/>
</svg>`,
                    width: isA6Size ? 14 : handleIconsWidth(records),
                    margin: [0, isA6Size ? 0 : handleIconTopMargin(records), 8, 0]
                  },
                  {
                    stack: [
                      {
                        text: 'location code',
                        color: textColor,
                        fontSize: isA6Size ? 9 : handleFooterFontSize(records),
                        margin: [isA6Size ? 0 : handleFooterTextRightMargin(records), 0, 0, isA6Size ? 4 : handleTextMarginBottom(records)],
                        bold: false,
                        font: 'STCFont'

                      },
                      {
                        text: record.locationCode,
                        color: '#EB4B62',
                        fontSize: isA6Size ? 9: handleFooterFontSize(records),
                        bold: false,
                        margin: [isA6Size ? 0 : handleFooterTextRightMargin(records), 0, 0, 0],
                        font: 'STCFont',
                        maxHeight:  40,
                        lineHeight: 1.2
                      }
                    ],
                    width: '65%'
                  }
                ],
              },
              // Separator line
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: isA6Size ? 155 : handleLineSeparatorWidth(records),
                    y2: 0,
                    lineWidth: isA6Size ? 0.5 : handleLineWidth(records),
                    lineColor: lineColor
                  }
                ],
                margin: isA6Size ? [0, 14, 0, 14] : handleLineMargins(records)
              },
              // Shared services section
              {
                columns: [
                  {
                    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 31 31" fill="none">
  <path d="M25.7665 27.5223C24.8545 28.4343 23.6675 28.8863 22.4675 28.8863C21.2725 28.8863 20.0855 28.4343 19.1735 27.5223L3.00653 11.3513C2.09453 10.4433 1.64253 9.25227 1.64253 8.05727C1.64253 6.86227 2.09453 5.67427 3.00653 4.76227L3.24653 4.52227L11.1565 12.4333L18.0925 19.3723L26.0025 27.2823L25.7665 27.5223ZM3.24653 3.55127L2.75853 4.03527L2.51953 4.27527C0.431529 6.36227 0.431529 9.75127 2.51953 11.8393L18.6855 28.0063C20.7775 30.0973 24.1625 30.0973 26.2545 28.0063L26.9775 27.2823L3.24653 3.55127Z" fill="${iconFillColor}"/>
  <path d="M25.7665 27.5223C24.8545 28.4343 23.6675 28.8863 22.4675 28.8863C21.2725 28.8863 20.0855 28.4343 19.1735 27.5223L3.00654 11.3513C2.09454 10.4433 1.64254 9.25229 1.64254 8.05729C1.64254 6.86229 2.09454 5.67429 3.00654 4.76229L3.24654 4.52229L11.1565 12.4333L18.0925 19.3723L26.0025 27.2823L25.7665 27.5223ZM27.4645 26.7953L26.9775 26.3113L20.0425 19.3763V19.3723L19.5585 18.8883H19.5545V18.8843L19.0675 18.4013L12.1275 11.4583L11.6405 10.9743L4.21754 3.55129V3.54729L3.73354 3.06429H3.73054L3.24654 2.57629L2.27154 3.55129L2.03154 3.78729C0.856538 4.96729 0.262538 6.51629 0.266538 8.05729C0.262538 9.60229 0.856538 11.1513 2.03154 12.3263L18.2025 28.4933C19.3775 29.6733 20.9265 30.2623 22.4675 30.2623C24.0135 30.2623 25.5625 29.6733 26.7375 28.4933L26.9775 28.2573L27.9485 27.2823L27.4645 26.7953Z" fill="${iconFillColor}"/>
  <path d="M11.1529 10.4868L4.21793 3.55182V3.54782L5.80193 1.96682L11.0779 7.24682C11.5379 7.70682 11.7659 8.30082 11.7659 8.90682C11.7659 9.47682 11.5619 10.0388 11.1529 10.4868ZM11.5659 6.75982L5.80193 0.991821L3.73393 3.06382H3.72993L3.24693 3.55182L11.1569 11.4618L11.5659 11.0488C11.5929 11.0258 11.6169 10.9978 11.6369 10.9708C12.7529 9.78282 12.7259 7.91982 11.5659 6.75982Z" fill="${iconFillColor}"/>
  <path d="M4.21763 3.55151V3.54751L5.80163 1.96751L11.0786 7.24751C11.5386 7.70751 11.7666 8.30051 11.7666 8.90651C11.7666 9.47651 11.5616 10.0385 11.1526 10.4865L4.21763 3.55151ZM12.0536 6.27251L5.80163 0.0205078L3.24663 2.57651L2.27163 3.55151L2.75863 4.03551L3.24663 4.52251L11.1566 12.4325L11.6446 11.9495L12.0536 11.5365C12.0806 11.5095 12.1046 11.4855 12.1276 11.4575C12.8046 10.7465 13.1426 9.81851 13.1426 8.90651C13.1426 7.95451 12.7806 6.99951 12.0536 6.27251Z" fill="${iconFillColor}"/>
  <path d="M26.9775 26.3114L20.0425 19.3764V19.3724C20.4905 18.9634 21.0525 18.7624 21.6225 18.7584C22.2245 18.7624 22.8215 18.9864 23.2815 19.4464L28.5615 24.7274L26.9775 26.3114ZM23.7695 18.9594C22.6095 17.8034 20.7495 17.7764 19.5585 18.8884H19.5545C19.5275 18.9084 19.5035 18.9314 19.4765 18.9594L19.0675 19.3724L26.9775 27.2824L29.5335 24.7274L23.7695 18.9594Z" fill="${iconFillColor}"/>
  <path d="M20.0422 19.3722C20.4902 18.9632 21.0522 18.7632 21.6232 18.7592C22.2242 18.7632 22.8222 18.9872 23.2822 19.4472L28.5622 24.7272L26.9772 26.3112L20.0422 19.3762V19.3722ZM24.2532 18.4762C23.5292 17.7482 22.5742 17.3832 21.6232 17.3832C20.7032 17.3832 19.7792 17.7252 19.0672 18.4012L18.9922 18.4762L18.5792 18.8842L18.0922 19.3722L26.4902 27.7702L26.9772 28.2572L30.5082 24.7272L24.2532 18.4762Z" fill="${iconFillColor}"/>
  <path d="M23.443 14.5678L22.716 13.8408C22.558 12.3508 21.91 10.9038 20.766 9.75985C19.621 8.61985 18.179 7.96685 16.689 7.80985L15.961 7.08185C17.876 7.08185 19.791 7.81385 21.253 9.27585C22.716 10.7348 23.443 12.6488 23.443 14.5678Z" fill="${iconFillColor}"/>
  <path d="M24.131 14.5679H22.755C22.755 14.3239 22.743 14.0839 22.716 13.8409C22.558 12.3509 21.91 10.9039 20.766 9.75986C19.621 8.61986 18.179 7.96686 16.689 7.80986C16.445 7.78186 16.205 7.76986 15.961 7.76986V6.39386C18.049 6.39386 20.144 7.19186 21.741 8.78886C23.333 10.3809 24.135 12.4759 24.131 14.5679Z" fill="${iconFillColor}"/>
  <path d="M15.9617 4.02957C18.6607 4.03057 21.3527 5.05657 23.4117 7.11557C25.4707 9.17457 26.4977 11.8666 26.4977 14.5656H27.8737C27.8747 11.5196 26.7097 8.46657 24.3847 6.14257C22.0607 3.81756 19.0077 2.65257 15.9617 2.65357V4.02957Z" fill="${iconFillColor}"/>
</svg>`,
                    width: isA6Size ? 14 : handleIconsWidth(records),
                    margin: [0, isA6Size ? 0 : 3, 8, 0]
                  },
                  {
                    stack: [
                      {
                        text: 'Shared Services',
                        color: textColor,
                        fontSize: isA6Size ? 9 : handleFooterFontSize(records),
                        margin: [isA6Size ? 0 : handleFooterTextRightMargin(records), 0, 0, isA6Size ? 4 : handleTextMarginBottom(records)],
                        bold: false,
                        font: 'STCFont'

                      },
                      {
                        text: '0114599999',
                        color: '#EB4B62',
                        fontSize: isA6Size ? 9 : handleFooterFontSize(records),
                        bold: false,
                        margin: [isA6Size ? 0 : handleFooterTextRightMargin(records), 0, 0, 0],
                        font: 'STCFont'

                      }
                    ],
                    width: '*'
                  }
                ]
              }
            ],
            width:  '80%',
          },
          // Right column - QR Code only (styled)
          {
            stack: [
              {
                image: qrImage,
                width: isA6Size ? 120 : displayQrDimension(handlePDFSize(records) as never),
                height: isA6Size ? 120 : displayQrDimension(handlePDFSize(records) as never),
                alignment: 'right',
                margin: isA6Size ?   [0, -30, 5, 0] : [0, -30, 0, 0]
              }
            ],
            width:  '20%',
            alignment: 'right'
          }
        ],
        columnGap: isA6Size ? 6 : 8,
        margin: [0, 0, 0, 0]
      } as unknown as never);

      // Illustration at bottom right - using absolute position (employee for 9x11, mobile for A6)
      content.push({
        svg: illustrationSvg,
        width: isA6Size ? 100 : handleEmployeeIconWidth(records),
        absolutePosition: isA6Size ? { x: 182, y: 220 } : handleEmployeeIconPosition(records),
        pageBreak: (index < (records.length - 1)) ? 'after' : undefined
      } as unknown as never);
    }


    const docDefinition = {
      pageSize: handlePDFSize(records),
      pageMargins: handlePDFMargins(records),
      content: content,
      header: () => {
        if (isA6Size) {
          return {
            svg: '<svg width="56" height="28" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.19198 28C12.1121 28 14.5091 27.085 16.0784 25.5548C17.2566 24.3755 17.9523 22.8046 17.9523 20.9746C17.9523 19.3174 17.3429 17.833 16.2104 16.6993C15.0779 15.5657 13.463 14.7371 11.4163 14.3457L8.05949 13.6899C6.66292 13.4306 5.88084 12.7291 5.88084 11.7683C5.88084 10.5025 7.09966 9.63326 9.05994 9.63326C10.2788 9.63326 11.3249 10.0247 12.0258 10.7262C12.4625 11.2041 12.7672 11.8192 12.8535 12.5156L17.6933 11.4227C17.5613 10.0247 16.9112 8.80465 15.9057 7.8032C14.3364 6.23239 11.8988 5.23094 9.01932 5.23094C6.36329 5.23094 4.13893 6.1053 2.6154 7.49818C1.31024 8.71823 0.568786 10.3755 0.568786 12.2106C0.568786 13.8272 1.09187 15.1794 2.13803 16.2215C3.18418 17.2687 4.70772 18.0516 6.7137 18.5345L10.0248 19.3174C11.6804 19.7088 12.4219 20.3188 12.4219 21.4118C12.4219 22.764 11.203 23.5468 9.19706 23.5468C7.75986 23.5468 6.58166 23.069 5.84021 22.281C5.31713 21.7574 5.01242 21.061 4.96672 20.2731L0 21.366C0.13204 22.8504 0.827787 24.1569 1.87395 25.2041C3.52952 26.9477 6.19062 27.9949 9.19706 27.9949L9.19198 28ZM45.9752 28C49.2 28 51.6833 26.8206 53.3846 25.1634C54.7355 23.8569 55.5633 22.3268 56 20.756L50.9012 19.053C50.6829 19.8359 50.2461 20.6696 49.5504 21.3203C48.7226 22.1031 47.5901 22.6725 45.9752 22.6725C44.4922 22.6725 43.1008 22.1031 42.0952 21.1017C41.0948 20.0545 40.4803 18.5294 40.4803 16.6078C40.4803 14.6863 41.0897 13.1612 42.0952 12.114C43.0957 11.1126 44.4465 10.589 45.9294 10.589C47.4987 10.589 48.5855 11.1126 49.3726 11.8954C50.0278 12.5512 50.4188 13.3798 50.6778 14.2084L55.8629 12.4648C55.4718 10.9397 54.6441 9.40959 53.4202 8.14379C51.6782 6.44081 49.1492 5.22077 45.7923 5.22077C42.6996 5.22077 39.9115 6.40015 37.9055 8.40305C35.8995 10.4517 34.6807 13.2883 34.6807 16.6028C34.6807 19.9172 35.9452 22.7538 37.9918 24.8025C39.9978 26.8105 42.8316 27.9848 45.965 27.9848L45.9752 28ZM28.3682 28C30.6332 28 32.2481 27.3036 32.9439 26.6935V21.9811C32.4208 22.3726 31.3746 22.8555 30.0238 22.8555C29.0639 22.8555 28.3682 22.6369 27.8451 22.159C27.4084 21.7219 27.19 20.9797 27.19 19.9782V0H21.4361V5.88671H32.9388V11.4684H21.4361V21.3711C21.4361 23.3791 22.0455 24.9906 23.1374 26.1242C24.3562 27.3442 26.1438 28 28.3682 28Z" fill="#4D2C87"/></svg>',
            width: 55,
            margin: handleLogoMargins(records)
          };
        }
        return {
          // eslint-disable-next-line max-len
          image: 'data:image/png;base64,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',
          margin: handleLogoMargins(records),
          ...handleSTCLogoDimension(records)
        };
      },
      background: (currentPage: number, pageSize: {width: number, height: number}) => {
        return {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: pageSize?.width,
              h: pageSize?.height,
              color: isA6Size ? '#FFFFFF' : '#512B84'
            }
          ]
        };
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#2c3e50'
        },
        subheader: {
          fontSize: 14,
          color: '#7f8c8d'
        },
        qrLabel: {
          fontSize: 12,
          margin: [0, 15, 0, 0]
        },
        qrInstruction: {
          fontSize: 11,
          color: '#34495e',
          italics: true
        },
      },
      defaultStyle: {
        font: 'STCFontMedium',
      },
    } as unknown as TDocumentDefinitions;

    // Wrap download in a Promise to ensure proper async handling
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const pdfDoc = pdfMake.createPdf(docDefinition, undefined, undefined, pdfMake.vfs);

    return new Promise<void>((resolve) => {
      pdfDoc.download(`${handlePDFSize(records, true)} Locations QR Codes - ${this.displayCurrentDate()}`, () => {
        resolve();
      });
    });
  }

  displayCurrentDate(): string {
    const date = new Date();

    return this.#datePipe.transform(date, 'dd-MM-yyyy - h:mm a') || '';
  };

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    // Synchronous conversion was previously used; keep a synchronous shim for callers
    // but prefer using the async version `arrayBufferToBase64Async` elsewhere to avoid blocking.
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
   }

  // Async conversion using FileReader to avoid large synchronous string operations on the main thread
  private arrayBufferToBase64Async(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const reader = new FileReader();
        reader.onerror = () => {
          reader.abort();
          reject(new Error('Failed to convert font ArrayBuffer to base64'));
        };
        reader.onload = () => {
          const result = reader.result as string; // data:<mime>;base64,AAAA
          // strip prefix if present
          const commaIndex = result.indexOf(',');
          if (commaIndex >= 0) {
            resolve(result.substring(commaIndex + 1));
          } else {
            resolve(result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        reject(e);
        }
    });
  }
}
