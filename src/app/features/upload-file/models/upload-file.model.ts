export interface UploadLocationsResponse {
  fileName: string,
  totalRecords: number,
  uploadedAt: string
}

export interface DiscardUploadResponse {
  message: string;
}

export type SaveUploadResponse = DiscardUploadResponse;
