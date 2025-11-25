export interface UploadLocationsResponse {
  fileName: string,
  totalRecords: number,
  uploadedAt: string
}

export interface DiscardUploadResponse {
  message: string;
}

export interface TemplateError {
  message: string;
  isVisible: boolean;
}

export type SaveUploadResponse = DiscardUploadResponse;
