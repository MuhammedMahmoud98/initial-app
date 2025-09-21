export interface CoreAppRoutes {
  path: string;
  title: string;
}

export interface LocationBase<T> {
  content:                 T[];
  totalAvailableLocations?: number;
  totalQRGenerated?:        number;
  page:                    number;
  size:                    number;
  totalElements:           number;
  totalPages:              number;
}

export interface ItemFilter {
  page: number;
  size: number;
  filter?: string;
}
