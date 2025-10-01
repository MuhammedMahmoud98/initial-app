import { Injectable } from '@angular/core';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {PrintQRCodeDto} from '../../features/created-locations/models/created-location.model';
import {displayQrDimension, handlePDFSize} from '../../shared/helpers/helpers';
import {environment} from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfMakerService {
  protected async initializePdfMake() {
    const pdfMake = await import('pdfmake/build/pdfmake');
    const pdfFonts = await import('pdfmake/build/vfs_fonts');

    // Debug: Check what's actually in pdfFonts

    // The correct structure is usually just pdfFonts.vfs or pdfFonts.pdfMake.vfs
    // Try this instead:
    (pdfMake as unknown as { vfs: object }).vfs = pdfFonts.vfs || (pdfFonts as unknown as {pdfMake: {vfs: object}}).pdfMake?.vfs;

    return pdfMake;
  }

  async generatePdfSingleColumn(records: PrintQRCodeDto[]) {
    const pdfMake = await this.initializePdfMake();

    const content: unknown[] = [];

    // Add each QR code
    records.forEach((record, index) => {
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
            fontSize: record.size.includes('*') ? 12 : 15,
            margin: [0, 0, 0, 5]
          },
          {
            text: 'to unique services',  // Second line
            style: 'qrSubtext',
            alignment: 'start',
            bold: true,
            color: '#fff',
            fontSize: record.size.includes('*') ? 12 : 15,
            margin: [0, 0, 0, 15]  // Bottom margin before QR code
          },
          {
            qr: `${environment.qrCodeUrl}/qr-guest/user-guest/${record.qrCode}`,
            alignment: 'start',
            foreground: '#000',
            fit: displayQrDimension(handlePDFSize(records) as never),
            width: displayQrDimension(handlePDFSize(records) as never),
            height: displayQrDimension(handlePDFSize(records) as never),
            margin: [0, 0, 0, 15]  // Bottom margin before QR code
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
                width: 15,
                margin: [0, 0, 15, 0]  // Negative margin to position over purple box
              },
              {
                stack: [
                  {
                    text: 'location code',
                    color: 'white',
                    fontSize: 13,
                    margin: [10, 0, 0, 0]
                  },
                  {
                    text: record.locationCode,
                    color: '#FF375E',  // Pink/red color
                    fontSize: 14,
                    margin: [10, 0, 0, 0]
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
                x2: 300,  // Adjust to match purple box width
                y2: 0,
                lineWidth: 2,
                lineColor: 'white'
              }
            ],
            margin: [0, 10, 0, 10]
          },
          {
            columns: [
              {
                // Location pin icon using text/symbol
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
                width: 15,
                margin: [0, 0, 15, 0]  // Negative margin to position over purple box
              },
              {
                stack: [
                  {
                    text: 'shared services',
                    color: 'white',
                    fontSize: 13,
                    margin: [10, 0, 0, 0]
                  },
                  {
                    text: '0114599999',
                    color: '#FF4081',  // Pink/red color
                    fontSize: 14,
                    bold: true,
                    margin: [10, 0, 0, 0]
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
    });

    const docDefinition = {
      pageSize: handlePDFSize(records), // TODO:: IF SIZE INCLUDES *; RETURN OBJECT WITH WIDTH AND HEIGHT
      pageMargins: [40, 60, 40, 50],
      content: content,
      header: function() {
        return {
          // STC LOGO
          // eslint-disable-next-line max-len
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAArCAYAAAAJ3cTrAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARhSURBVHgB7ZqBddMwEEAvPAYwE6BO0DIB6QSEDdIJaiaIO0HSCRwmoBs4TNAygc0EKRMcd5XcuKktnSwpobz89+6ZEkmnO8nS6awJHBlEzOnxxVHsajKZNPBGeA/H54JkCv8R7+BEdE5OTcDJqQk4OTUBJ6cm4OTUBDhDKoojM3rMSM5JlBH+v0cjDyS/Se7eUizZQva1IV3XPqYxT7bvF8lGat/EomxKj2ujMAMZ3IFbUr4Wlm8HzdV+CTtj+2hI5yX46WTbcpDbxmxIvvvY96yQZIlh1GZQomDas+rzaGtBssVw++ZShQrdBviwgAhgBKca2+4xLguX0gzjOlSm+ABOpd8vMHx2DlHaFJeYjikcyamoZ2gqh7aUQ4ql1B0R14EAcKRTMf5yZiPfV14KKq1Q75rderxkzFHW8SmMBMc7tcTDwW9D5tPp3GE0O9e1CZQwEhzhVNSD7UNFUph6U5KZ+dtncytY9wS1d7cWmx4pLvsAbsMVPe6hP+7j+JXju1VPvSnYY1Dms+N37uO3vXZrQbtMAzoJvhkqgDp8Wgja48PQmWQ93YIQM9r8Gvwgyc2IZ446a3SjwAOjV8K9q3+dNqUb3ly6SYnCImkH9+qkcGopaLP27S/qJWGICvVEytrCkhEoMeIpqdPRFE6tBW3OYQTGef2OtBSUUKF28tMrDgFgZKeiDvRdjA7xcLeBZZKCoVSonazAr5OxnSqxZXQkIuEpn0o73x3oDEwIU5IlSY16Fis4DkpQ5ickpJukvoJdDjGUOWjn5nB4JJtPAwl5dqpJwF5GVsgpxCiZqrfEi88p7FiSM/rnDcRzbnGkGWvDO/TzofcbFTm2AD1reUl4gHAWOCKGHUkjKKMgIYMf/sysXZN8Aj56AXwluYVxTmaHHmq2NoIy5/CvgTqBwkdBzlzVKGMokxQ7pMoE7b3MKPnZzifQCnXiRUEqjALJqSzrqZviRFUJ2ixgBPj6CFwNOhh3sy83FWuSlYeyQmCI6qknceoFeCDsyxb9B8uVJ6lIZlxwibvs0ivFHgolmSHVU28lqOe1HqNsCWBqFDoW5V8R5pLkgzRDJUkK973+kllVo8V47JnJKHsDnm0cah/1APHv0u9cipPU/Ipfg52CooAbi1GKHhXYQ5UHE0ns1+VZuAQ3DbyMPjKjj29hKxNf7/dpKGk+xMa0/8f8zVHC1KMNjpaufBK6NepZxeU5E8Svw8xjFHvXZ5Trt/ZtoO0cD0eN3dmOsnUtFDU0vBjhxoilbZ9lIIT5vuJUFylaCrCAsnXVhusyReybKfsUQ4qlu5sva3CA4YNaC9pPNWMLl3Hs2Jij6hPnhlzNEWXyMfyN6MJ9lYd6KL8gMUSNIz6zoHZsjf5UHjp44oTO2grHHlFRO7cSKtpie6IIBOWDym+V+3tRvw52rk/uYmvKO093E2EHuNMXRrqXdPnyQGOE49BHiIgxQHX0dnWKbzYL9CijQxk9H0HfDm9vi3vp+gubMLUEARNV0AAAAABJRU5ErkJggg==', // Replace with your image
          width: 50,  // Adjust width as needed
          height: 31, // Adjust height as needed
          margin: [40, 10, 0, 0] // [left, top, right, bottom] - positions in top left
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
    } as unknown as TDocumentDefinitions;

    const pdfDoc = pdfMake.createPdf(docDefinition).download(`${handlePDFSize(records, true)} QR CODE FILE`);
    // pdfDoc.open();

    return pdfDoc;
  }
}
