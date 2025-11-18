export interface UploadLocationsResponse {
  uploadId: string;
}

export interface DiscardUploadResponse {
  message: string;
}

export type SaveUploadResponse = DiscardUploadResponse;
