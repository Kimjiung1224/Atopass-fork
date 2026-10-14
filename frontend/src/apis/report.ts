import type { ApiSuccess } from '@/types/api';
import type { CreateReportRequest, Report } from '@/types/report';
import { client, unwrap } from './client';

export const reportApi = {
  create: (body: CreateReportRequest) => client.post<ApiSuccess<Report>>('/reports', body).then(unwrap),
  getList: () => client.get<ApiSuccess<Report[]>>('/reports').then(unwrap),
  getDetail: (reportId: number) => client.get<ApiSuccess<Report>>(`/reports/${reportId}`).then(unwrap),
  /** PDF blob — 미리보기/다운로드는 object URL로 처리 */
  getFile: (reportId: number) =>
    client.get<Blob>(`/reports/${reportId}/file`, { responseType: 'blob' }).then((res) => res.data),
};
