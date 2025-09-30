import { Injectable } from '@angular/core';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {PrintQRCodeDto} from '../../features/created-locations/models/created-location.model';
import {handlePDFSize} from '../../shared/helpers/helpers';
import {environment} from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfMakerService {
  protected async initializePdfMake() {
    const pdfMake = await import('pdfmake/build/pdfmake');
    const pdfFonts = await import('pdfmake/build/vfs_fonts');

    // Debug: Check what's actually in pdfFonts
    console.log('pdfFonts structure:', pdfFonts);

    // The correct structure is usually just pdfFonts.vfs or pdfFonts.pdfMake.vfs
    // Try this instead:
    (pdfMake as unknown as { vfs: object }).vfs = pdfFonts.vfs || (pdfFonts as unknown as {pdfMake: {vfs: object}}).pdfMake?.vfs;

    return pdfMake;
  }
  //
  // async generatePdf(records: { name: string; qrBase64: string }[], chunkNumber: number) {
  //   const pdfMake = await this.initializePdfMake();
  //   // Build QR blocks
  //   const qrBlocks = records.map(loc => ({
  //     stack: [
  //       { text: loc.name, fontSize: 10, margin: [0, 0, 0, 4] },
  //       { image: loc.qrBase64, width: 80, alignment: 'center' }
  //     ],
  //     margin: [10, 10, 10, 10]
  //   }));
  //
  //   // Define PDF doc
  //   const docDefinition: any = {
  //     pageSize: 'A4',
  //     pageOrientation: 'portrait',
  //     content: [
  //       { text: `Locations - Chunk #${chunkNumber}`, style: 'header' },
  //       {
  //         columns: qrBlocks,
  //         columnGap: 10
  //       }
  //     ],
  //     styles: {
  //       header: { fontSize: 14, bold: true, margin: [0, 0, 0, 20] }
  //     }
  //   };
  //
  //   // Auto download
  //   pdfMake.createPdf(docDefinition).download(`locations-chunk-${chunkNumber}.pdf`);
  //
  //   // Release memory
  //   (docDefinition as any).content = [];
  // }

  async generatePdfSingleColumn(records: PrintQRCodeDto[], totalCount: number) {
    const pdfMake = await this.initializePdfMake();

    const content = [
      {
        text: 'QR Code Labels',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: `Total Records: ${totalCount}`,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      }
    ];

    // Add each QR code
    records.forEach((record, index) => {
      content.push({
        stack: [
          {
            text: 'Scan the QR code below:',
            style: 'qrInstruction',
            alignment: 'center',
            margin: [0, 40, 0, 20]
          },
          {
            qr: `${environment.qrCodeUrl}/qrcode/${record.qrCode}`, // ✅ pdfmake built-in QR
            alignment: 'center',
            foreground: '#000',
            fit: 200,                                          // ✅ controls QR size
            width: 200,
            height: 200,
          },
          {
            text: record.locationCode,
            style: 'qrLabel',
            alignment: 'center'
          }
        ],
        margin: [0, 0, 0, 0],
        pageBreak: (index < (records.length - 1)) && 'after'
      } as unknown as never);
    });

    const docDefinition = {
      pageSize: handlePDFSize(records), // TODO:: IF SIZE INCLUDES *; RETURN OBJECT WITH WIDTH AND HEIGHT
      pageMargins: [40, 60, 40, 50],
      content: content,
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
      footer: function (currentPage: number, pageCount: number) {
        return {
          margin: [0, 0, 0, 0],
          stack: [
            // Purple rectangle background
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: 595.28, // Full A4 width
                  h: 50,     // Footer height
                  color: '#4F008C'
                }
              ]
            },
            // Text on top of rectangle
            {
              columns: [
                {
                  text: 'Company Name',
                  alignment: 'left',
                  color: 'white',
                  fontSize: 12,
                  margin: [40, -30, 0, 0] // shift inside purple bar
                },
                {
                  text: `Page ${currentPage} of ${pageCount}`,
                  alignment: 'right',
                  color: 'white',
                  fontSize: 12,
                  margin: [0, -30, 40, 0] // shift inside purple bar
                }
              ]
            }
          ]
        };
      }
    } as unknown as TDocumentDefinitions;

    const pdfDoc = pdfMake.createPdf(docDefinition).download(`${handlePDFSize(records, true)} File`);
    // pdfDoc.open();

    return pdfDoc;
  }
}
