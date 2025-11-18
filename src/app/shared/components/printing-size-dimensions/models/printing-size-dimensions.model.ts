export type PrintingSizeTypes = 'A5' | 'A4' | '5*5';
export type PrintingSizeLabelTypes = 'A5' | 'A4' | '5x5';

export interface PrintingSizeDimension {
  label: PrintingSizeLabelTypes;
  value: PrintingSizeTypes;
  isSelected?: boolean;
}
