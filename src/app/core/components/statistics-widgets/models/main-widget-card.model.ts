export enum MainWidgetCardType {
  'total-locations-icon' = 'var(--primary-100)',
  'generated-qrs-icon' = 'var(--oases-100)',
  'assigned-qrs-icon' = 'var(--secondary-100)',
  'archived-location-icon' = 'var(--sunset-100)'
}

export type CardIconName = keyof typeof MainWidgetCardType;

export type iconBgColorType = MainWidgetCardType[keyof MainWidgetCardType];

export interface MainWidgetCard {
  id: number;
  title: string;
  mainMetric: number;
  subMetric: string;
  subValue: number;
  iconName: CardIconName;
}

export interface MainWidgetCardVM extends MainWidgetCard {
  iconBgColor: iconBgColorType;
}

export interface MainWidgetCardsResponse {
  mainWidgets: MainWidgetCard[];
}
