export interface CreateReportRequest {
  startDate: string;
  endDate: string;
  includePhotos?: boolean;
}

/** 응답 예시 미정 — 백엔드 확정 후 수정 */
export interface Report {
  reportId: number;
  startDate: string;
  endDate: string;
  includePhotos: boolean;
  createdAt: string;
}
