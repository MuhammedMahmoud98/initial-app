export type PrintingSizeTypes = 'A6' | 'A5' | 'A4' | '5x5' |'9x11';
export type PrintingSizeLabelTypes = 'A6' | 'A5' | 'A4' | '5x5' |'9x11';

export interface PrintingSizeDimension {
  label: PrintingSizeLabelTypes;
  value: PrintingSizeTypes;
  isSelected?: boolean;
}
