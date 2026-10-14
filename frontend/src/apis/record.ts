import type { ApiSuccess } from '@/types/api';
import type { RecordCreated, RecordDetail, RecordInput, RecordListParams, RecordPage } from '@/types/record';
import { client, unwrap } from './client';

export const recordApi = {
  /** 페이지 응답 (기본 size 10). 기록이 없는 날짜는 포함되지 않는다 */
  getList: (params: RecordListParams) => client.get<ApiSuccess<RecordPage>>('/records', { params }).then(unwrap),

  getDetail: (recordId: number) => client.get<ApiSuccess<RecordDetail>>(`/records/${recordId}`).then(unwrap),

  create: (body: RecordInput) => client.post<ApiSuccess<RecordCreated>>('/records', body).then(unwrap),

  /** 전체 내용을 보낸다 (수정하지 않은 필드 포함) */
  update: (recordId: number, body: RecordInput) =>
    client.put<ApiSuccess<RecordDetail>>(`/records/${recordId}`, body).then(unwrap),

  remove: (recordId: number) => client.delete(`/records/${recordId}`),

  /** 날짜로 진입할 때 목록에서 recordId를 찾는다 (하루 1건) */
  findByDate: async (date: string) => {
    const { content } = await recordApi.getList({ startDate: date, endDate: date, size: 1 });
    return content.find((r) => r.recordDate === date) ?? null;
  },
};
