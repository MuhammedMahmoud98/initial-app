# QR Settings — Adjusting QR size, margins and PDF layout

Path: `src/assets/QR-settings.md`
Related code: `src/app/core/services/pdf-maker.service.ts` and helper functions in `src/app/shared/helpers/helpers.ts`

## Purpose

This file documents where to change QR dimensions, spacing, font warm-up/caching and other PDF layout knobs used by the app. It includes examples and troubleshooting tips so other developers can quickly adjust QR output without digging through the service implementation.

## Quick summary

- Change QR size, page size, and page margins from the helper functions in `src/app/shared/helpers/helpers.ts`.
- Control top/bottom margins for QR and text via `handleQRTopMargin`, `handleQRBottomMargin`, `handleTextMarginBottom`.
- Increase/decrease QR dimensions via `displayQrDimension` and `handlePDFSize`.
- Avoid slow first-call font loading by warming up fonts early with `PdfMakerService.warmUpPdfMake()`.

## Helpful locations

- `src/app/core/services/pdf-maker.service.ts`

  - Responsible for initializing pdfMake with app font, generating the PDF, and wiring the PDF document definition.
  - `warmUpPdfMake()` calls `initializePdfMake()` to fetch and register the `STCForward-Regular.ttf` font and cache it in `localStorage`.
  - `generatePdfSingleColumn(records)` builds the document definition and calls `pdfMake.createPdf(...).download(...)`.

- `src/app/shared/helpers/helpers.ts` (primary tuning surface)
  - displayQrDimension(pageSize)
  - handlePDFSize(records)
  - handlePDFMargins(records)
  - handleQRTopMargin(records)
  - handleQRBottomMargin(records)
  - handleTextMarginBottom(records)
  - handleTextFontSize(records)
  - handleFooterFontSize(records)
  - handleLogoMargins(records)
  - handleLineMargins(records)
  - handleLineSeparatorWidth(records)
  - handleIconsWidth(records)
  - handleIconTopMargin(records)

Edit these helper functions to change layout consistently across the generated PDFs.

## Common edits (examples)

- Increase QR size by applying a multiplier in `displayQrDimension`:

```ts
// src/app/shared/helpers/helpers.ts
export function displayQrDimension(pageSize: unknown): number {
  const base = /* existing logic to compute base dimension */;
  const multiplier = 1.15; // increase by 15%
  return Math.round(base * multiplier);
}
```

- Increase top margin before the QR:

```ts
export function handleQRTopMargin(records: unknown[]): number {
  // previous: return 10;
  return 30; // increase top spacing
}
```

- Increase bottom margin for the helper text:

```ts
export function handleTextMarginBottom(records: unknown[]): number {
  // previous: return 8;
  return 16;
}
```

- Adjust page size or return explicit width/height from `handlePDFSize`:

```ts
export function handlePDFSize(records: unknown[] | undefined) {
  // return a built-in size string like 'A4' or an object with explicit width & height
  return { width: 595.28 /* pt for A4 width */, height: 841.89 /* pt for A4 height */ };
}
```

## Font load & performance tips

- Why the first call can be slow

  - The first time `initializePdfMake()` runs, it fetches the TTF font from `/assets/layouts/fonts/STCForward-Regular.ttf`, converts it to base64 and registers it with pdfMake's virtual file system (vfs). Network latency, file size, or the main-thread conversion can make that first call noticeably slower.

- How the service reduces repeated delay

  - The service caches the base64 font string in `localStorage` under the key `STCForward-Regular.ttf.base64`. It also caches the initialized `pdfMake` instance in memory so subsequent calls reuse it.

- Best practices to avoid slow first-call behavior
  1. Warm up the font early in app lifecycle (for example in a top-level component or an app initializer):

```ts
// Some early component or app initializer
constructor(private pdfMaker: PdfMakerService) {
  // fire-and-forget warm up
  this.pdfMaker.warmUpPdfMake();
}
```

2. Ensure the font file is served with good caching headers from the server (so the browser can cache the TTF file).
3. If your environment supports it, prebundle or inline the font into your frontend build (only for environments where that is acceptable).
4. If `localStorage` is unavailable (private mode, restricted contexts), consider falling back to an IndexedDB-based cache or server-side rendering for PDFs.

- Debugging tips
  - Add a performance log around the font fetch in `initializePdfMake()` to measure the duration.
  - Verify `localStorage.getItem('STCForward-Regular.ttf.base64')` contains a non-empty string after warm-up.
  - Check `pdfMake.vfs['STCForward-Regular.ttf']` is populated in the console.

## Example: warm-up + safe call pattern

The service already serializes initialization using a private promise and caches the pdfMake instance. To minimize race conditions or duplicate downloads, call `warmUpPdfMake()` once early and await `initializePdfMake()` where needed.

```ts
// call warmUpPdfMake early (no await) and then when generating a PDF, the generate method awaits initialization internally
this.pdfMaker.warmUpPdfMake();
// later, this.pdfMaker.generatePdfSingleColumn(records) will await the cached initializer
```

## Adjusting margins and layout for different record counts

- If your layout should change based on the number of records, most helper functions receive `records` and can switch behaviour (for example smaller margins when printing many codes per page).

- Example conditional margin:

```ts
export function handleQRBottomMargin(records: PrintQRCodeDto[]) {
  return records.length > 6 ? 8 : 20;
}
```

## Troubleshooting common issues

- Font sometimes takes long to load only on first call

  - Ensure `warmUpPdfMake()` is called earlier during app start.
  - Confirm the app can write to `localStorage` (some browser modes block it).
  - If the font file is large, consider compressing or using a subset TTF for PDF text.

- Visual layout changes not applied

  - Make sure you edited the helper functions imported by `pdf-maker.service.ts`.
  - Regenerate the PDF and clear the browser cache if you changed assets or the font.

- PDF generation fails with an error referencing `pdfMake.vfs` or missing font
  - Confirm `initializePdfMake()` has completed before calling `generatePdfSingleColumn`.
  - Use `warmUpPdfMake()` early or await `initializePdfMake()` in calling code.

## Quick checklist for making an adjustment

1. Edit the relevant helper(s) in `src/app/shared/helpers/helpers.ts`.
2. Optionally call `this.pdfMaker.warmUpPdfMake()` in a top-level component to warm fonts.
3. Rebuild/reload the app and generate a PDF to verify the change.
4. If the font or images changed, clear the browser cache and localStorage key `STCForward-Regular.ttf.base64` and re-run warm-up.

## Notes

- This document assumes the repo serves static assets from `src/assets` and that `environment.baseHref` is configured correctly in `src/app/core/services/pdf-maker.service.ts`.
- If you prefer the guide in a different folder (e.g., `docs/`), move or copy this file accordingly.

---

If you'd like, I can also:

- Add a short `README` section with screenshots of before/after PDFs for sample margin changes.
- Create a small unit-test or smoke-test that calls `warmUpPdfMake()` and verifies `localStorage` gets populated (if you want automated verification).
