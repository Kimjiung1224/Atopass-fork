import type { ApiSuccess } from '@/types/api';
import type { ClinicVisit } from '@/types/visit';
import { client, unwrap } from './client';

export const visitApi = {
  /** 날짜 오름차순 */
  getList: () => client.get<ApiSuccess<ClinicVisit[]>>('/visits').then(unwrap),
  create: (visitDate: string) => client.post<ApiSuccess<ClinicVisit>>('/visits', { visitDate }).then(unwrap),
  remove: (visitId: number) => client.delete(`/visits/${visitId}`),
};
